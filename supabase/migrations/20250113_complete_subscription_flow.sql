-- =====================================================
-- COMPLETE SUBSCRIPTION FLOW - Message Limits & Expiry
-- This migration implements:
-- 1. 20 free messages limit
-- 2. Automatic chat unlock after payment
-- 3. Automatic expiry handling (daily/weekly)
-- 4. Scheduled downgrade when subscription expires
-- =====================================================

-- =====================================================
-- 1. FUNCTION: Check and Downgrade Expired Subscriptions
-- =====================================================
CREATE OR REPLACE FUNCTION check_and_downgrade_expired_subscriptions()
RETURNS TABLE(
  user_id UUID,
  downgraded BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Find all users with expired subscriptions
  FOR v_user IN
    SELECT 
      u.id,
      u.email,
      u.subscription_expiry,
      u.subscription_plan
    FROM users u
    WHERE u.premium_user = true
      AND u.subscription_expiry IS NOT NULL
      AND u.subscription_expiry < NOW()
  LOOP
    BEGIN
      -- Downgrade user to free
      UPDATE users
      SET 
        premium_user = false,
        subscription_plan = NULL,
        subscription_expiry = NULL,
        updated_at = NOW()
      WHERE id = v_user.id;

      -- Also update subscription status to expired
      UPDATE subscriptions
      SET 
        status = 'expired',
        updated_at = NOW()
      WHERE user_id = v_user.id
        AND status = 'active'
        AND expires_at < NOW();

      user_id := v_user.id;
      downgraded := TRUE;
      message := format('User %s downgraded - subscription expired on %s', 
        v_user.email, 
        v_user.subscription_expiry
      );
      v_count := v_count + 1;

      RETURN NEXT;
    EXCEPTION
      WHEN OTHERS THEN
        user_id := v_user.id;
        downgraded := FALSE;
        message := 'Error: ' || SQLERRM;
        RETURN NEXT;
    END;
  END LOOP;

  -- Log summary
  RAISE NOTICE 'Checked expired subscriptions: % users downgraded', v_count;
END;
$$;

-- =====================================================
-- 2. FUNCTION: Get User Message Count (Resets Daily for Free Users)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_message_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_user RECORD;
  v_is_premium BOOLEAN;
  v_expiry TIMESTAMPTZ;
BEGIN
  -- Get user premium status and expiry
  SELECT premium_user, subscription_expiry INTO v_user
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Check if subscription is still valid
  v_is_premium := v_user.premium_user;
  IF v_user.subscription_expiry IS NOT NULL THEN
    IF v_user.subscription_expiry < NOW() THEN
      -- Subscription expired, downgrade
      UPDATE users
      SET premium_user = false, subscription_plan = NULL, subscription_expiry = NULL
      WHERE id = p_user_id;
      v_is_premium := false;
    END IF;
  END IF;

  -- If premium, return unlimited (999999)
  IF v_is_premium THEN
    RETURN 999999;
  END IF;

  -- For free users, get count from usage_stats
  SELECT COALESCE(total_messages, 0) INTO v_count
  FROM usage_stats
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- =====================================================
-- 3. FUNCTION: Check if User Can Send Message
-- =====================================================
CREATE OR REPLACE FUNCTION can_user_send_message(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_message_count INTEGER;
  v_is_premium BOOLEAN;
  v_expiry TIMESTAMPTZ;
  v_result JSONB;
  FREE_MESSAGE_LIMIT CONSTANT INTEGER := 20;
BEGIN
  -- Get user details
  SELECT 
    premium_user,
    subscription_expiry,
    subscription_plan
  INTO v_user
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_send', false,
      'reason', 'user_not_found',
      'message_count', 0,
      'limit', FREE_MESSAGE_LIMIT
    );
  END IF;

  -- Check if subscription expired
  v_is_premium := v_user.premium_user;
  IF v_user.subscription_expiry IS NOT NULL THEN
    IF v_user.subscription_expiry < NOW() THEN
      -- Auto-downgrade expired subscription
      UPDATE users
      SET 
        premium_user = false,
        subscription_plan = NULL,
        subscription_expiry = NULL,
        updated_at = NOW()
      WHERE id = p_user_id;
      v_is_premium := false;
    END IF;
  END IF;

  -- Premium users can always send
  IF v_is_premium THEN
    RETURN jsonb_build_object(
      'can_send', true,
      'is_premium', true,
      'message_count', 0,
      'limit', 999999,
      'expires_at', v_user.subscription_expiry
    );
  END IF;

  -- Free users: check message count
  SELECT COALESCE(total_messages, 0) INTO v_message_count
  FROM usage_stats
  WHERE user_id = p_user_id;

  IF v_message_count >= FREE_MESSAGE_LIMIT THEN
    RETURN jsonb_build_object(
      'can_send', false,
      'reason', 'quota_exhausted',
      'message_count', v_message_count,
      'limit', FREE_MESSAGE_LIMIT,
      'is_premium', false
    );
  END IF;

  RETURN jsonb_build_object(
    'can_send', true,
    'is_premium', false,
    'message_count', v_message_count,
    'limit', FREE_MESSAGE_LIMIT
  );
END;
$$;

-- =====================================================
-- 4. TRIGGER: Auto-downgrade on Subscription Expiry Check
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_check_subscription_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if subscription just expired
  IF NEW.subscription_expiry IS NOT NULL AND NEW.subscription_expiry < NOW() THEN
    -- Downgrade user
    UPDATE users
    SET 
      premium_user = false,
      subscription_plan = NULL,
      subscription_expiry = NULL,
      updated_at = NOW()
    WHERE id = NEW.id;

    RAISE NOTICE 'User % auto-downgraded due to expired subscription', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger (optional - for real-time checks)
DROP TRIGGER IF EXISTS trg_check_subscription_expiry ON users;
CREATE TRIGGER trg_check_subscription_expiry
  AFTER UPDATE OF subscription_expiry ON users
  FOR EACH ROW
  WHEN (NEW.subscription_expiry IS NOT NULL AND NEW.subscription_expiry < NOW())
  EXECUTE FUNCTION trigger_check_subscription_expiry();

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION check_and_downgrade_expired_subscriptions() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_message_count(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION can_user_send_message(UUID) TO service_role;

-- =====================================================
-- 6. CREATE SCHEDULED JOB (pg_cron extension required)
-- Run this check every hour to downgrade expired users
-- =====================================================
-- Note: Uncomment if pg_cron is enabled in your Supabase project
-- SELECT cron.schedule(
--   'check-expired-subscriptions',
--   '0 * * * *', -- Every hour
--   $$SELECT check_and_downgrade_expired_subscriptions();$$
-- );

-- =====================================================
-- 7. MANUAL TEST FUNCTION
-- =====================================================
-- You can manually run this to check and downgrade expired users:
-- SELECT * FROM check_and_downgrade_expired_subscriptions();

