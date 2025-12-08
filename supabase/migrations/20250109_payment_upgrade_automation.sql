-- =====================================================
-- PAYMENT UPGRADE AUTOMATION - Database Functions & Triggers
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. FUNCTION: Upgrade User to Premium
-- =====================================================
CREATE OR REPLACE FUNCTION upgrade_user_to_premium(
  p_user_id UUID,
  p_plan_type TEXT DEFAULT 'daily',
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expiry TIMESTAMPTZ;
BEGIN
  -- Calculate expiry if not provided
  IF p_expires_at IS NULL THEN
    IF p_plan_type = 'weekly' THEN
      v_expiry := NOW() + INTERVAL '7 days';
    ELSE
      v_expiry := NOW() + INTERVAL '1 day';
    END IF;
  ELSE
    v_expiry := p_expires_at;
  END IF;

  -- Update user to premium
  UPDATE users
  SET 
    premium_user = true,
    subscription_plan = p_plan_type,
    subscription_expiry = v_expiry,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the upgrade
  RAISE NOTICE 'User % upgraded to premium with plan % until %', p_user_id, p_plan_type, v_expiry;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to upgrade user %: %', p_user_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- =====================================================
-- 2. FUNCTION: Calculate Subscription Expiry
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_subscription_expiry(
  p_plan_type TEXT,
  p_start_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_expiry TIMESTAMPTZ;
BEGIN
  v_start := COALESCE(p_start_date, NOW());

  IF p_plan_type = 'weekly' THEN
    v_expiry := v_start + INTERVAL '7 days';
  ELSE
    v_expiry := v_start + INTERVAL '1 day';
  END IF;

  RETURN v_expiry;
END;
$$;

-- =====================================================
-- 3. TRIGGER FUNCTION: Auto-upgrade on Subscription Active
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_upgrade_on_subscription_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expiry TIMESTAMPTZ;
BEGIN
  -- Only trigger when status changes to 'active'
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    -- Calculate expiry based on plan_type
    v_expiry := calculate_subscription_expiry(
      NEW.plan_type,
      COALESCE(NEW.started_at, NEW.created_at, NOW())
    );

    -- Upgrade user to premium
    PERFORM upgrade_user_to_premium(
      NEW.user_id,
      NEW.plan_type,
      v_expiry
    );

    -- Also update subscription expiry if column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscriptions' AND column_name = 'expires_at'
    ) THEN
      UPDATE subscriptions
      SET expires_at = v_expiry
      WHERE id = NEW.id;
    END IF;

    RAISE NOTICE 'Auto-upgraded user % to premium via subscription trigger', NEW.user_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Subscription trigger error for user %: %', NEW.user_id, SQLERRM;
    RETURN NEW;
END;
$$;

-- =====================================================
-- 4. TRIGGER: On Subscriptions Table Update
-- =====================================================
DROP TRIGGER IF EXISTS trg_subscription_upgrade ON subscriptions;
CREATE TRIGGER trg_subscription_upgrade
  AFTER INSERT OR UPDATE OF status ON subscriptions
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION trigger_upgrade_on_subscription_active();

-- =====================================================
-- 5. TRIGGER FUNCTION: Auto-upgrade on Payment Success
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_upgrade_on_payment_success()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_expiry TIMESTAMPTZ;
BEGIN
  -- Only trigger when payment status changes to 'success'
  IF NEW.status = 'success' AND (OLD.status IS NULL OR OLD.status != 'success') THEN
    -- Find associated subscription
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE cashfree_order_id = NEW.cashfree_order_id
    LIMIT 1;

    IF FOUND THEN
      -- Calculate expiry
      v_expiry := calculate_subscription_expiry(
        COALESCE(NEW.plan_type, v_subscription.plan_type, 'daily'),
        COALESCE(v_subscription.started_at, v_subscription.created_at, NOW())
      );

      -- Upgrade user to premium
      PERFORM upgrade_user_to_premium(
        NEW.user_id,
        COALESCE(NEW.plan_type, v_subscription.plan_type, 'daily'),
        v_expiry
      );

      -- Update subscription status if not already active
      IF v_subscription.status != 'active' THEN
        UPDATE subscriptions
        SET 
          status = 'active',
          cashfree_payment_id = NEW.cashfree_payment_id,
          updated_at = NOW()
        WHERE id = v_subscription.id;
      END IF;

      RAISE NOTICE 'Auto-upgraded user % to premium via payment trigger', NEW.user_id;
    ELSE
      -- No subscription found, upgrade based on payment alone
      v_expiry := calculate_subscription_expiry(
        COALESCE(NEW.plan_type, 'daily'),
        NOW()
      );

      PERFORM upgrade_user_to_premium(
        NEW.user_id,
        COALESCE(NEW.plan_type, 'daily'),
        v_expiry
      );

      RAISE NOTICE 'Auto-upgraded user % to premium via payment (no subscription found)', NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Payment trigger error for user %: %', NEW.user_id, SQLERRM;
    RETURN NEW;
END;
$$;

-- =====================================================
-- 6. TRIGGER: On Payments Table Update
-- =====================================================
DROP TRIGGER IF EXISTS trg_payment_upgrade ON payments;
CREATE TRIGGER trg_payment_upgrade
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'success')
  EXECUTE FUNCTION trigger_upgrade_on_payment_success();

-- =====================================================
-- 7. FUNCTION: Manual Fix - Upgrade All Users with Active Subscriptions
-- =====================================================
CREATE OR REPLACE FUNCTION fix_all_paid_users()
RETURNS TABLE(
  user_id UUID,
  upgraded BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Find all users with active subscriptions who aren't premium
  FOR v_subscription IN
    SELECT DISTINCT ON (s.user_id)
      s.user_id,
      s.plan_type,
      s.started_at,
      s.created_at,
      s.expires_at
    FROM subscriptions s
    INNER JOIN users u ON u.id = s.user_id
    WHERE s.status = 'active'
      AND (u.premium_user IS NULL OR u.premium_user = false)
    ORDER BY s.user_id, s.created_at DESC
  LOOP
    BEGIN
      -- Upgrade the user
      PERFORM upgrade_user_to_premium(
        v_subscription.user_id,
        v_subscription.plan_type,
        COALESCE(v_subscription.expires_at, calculate_subscription_expiry(v_subscription.plan_type, v_subscription.started_at))
      );

      user_id := v_subscription.user_id;
      upgraded := TRUE;
      message := 'Upgraded successfully';
      v_count := v_count + 1;

      RETURN NEXT;
    EXCEPTION
      WHEN OTHERS THEN
        user_id := v_subscription.user_id;
        upgraded := FALSE;
        message := 'Error: ' || SQLERRM;
        RETURN NEXT;
    END;
  END LOOP;

  -- Also check payments table for successful payments
  FOR v_subscription IN
    SELECT DISTINCT ON (p.user_id)
      p.user_id,
      p.plan_type
    FROM payments p
    INNER JOIN users u ON u.id = p.user_id
    WHERE p.status = 'success'
      AND (u.premium_user IS NULL OR u.premium_user = false)
    ORDER BY p.user_id, p.created_at DESC
  LOOP
    BEGIN
      -- Skip if already processed in subscriptions loop
      IF NOT EXISTS (
        SELECT 1 FROM subscriptions 
        WHERE user_id = v_subscription.user_id AND status = 'active'
      ) THEN
        PERFORM upgrade_user_to_premium(
          v_subscription.user_id,
          COALESCE(v_subscription.plan_type, 'daily'),
          calculate_subscription_expiry(COALESCE(v_subscription.plan_type, 'daily'))
        );

        user_id := v_subscription.user_id;
        upgraded := TRUE;
        message := 'Upgraded from payment record';
        v_count := v_count + 1;

        RETURN NEXT;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        user_id := v_subscription.user_id;
        upgraded := FALSE;
        message := 'Error: ' || SQLERRM;
        RETURN NEXT;
    END;
  END LOOP;

  RAISE NOTICE 'Fixed % users', v_count;
END;
$$;

-- =====================================================
-- 8. FUNCTION: Fix Specific User
-- =====================================================
CREATE OR REPLACE FUNCTION fix_user_premium_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_payment RECORD;
  v_result JSONB;
  v_upgraded BOOLEAN := FALSE;
BEGIN
  -- Check for active subscription
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    PERFORM upgrade_user_to_premium(
      p_user_id,
      v_subscription.plan_type,
      COALESCE(v_subscription.expires_at, calculate_subscription_expiry(v_subscription.plan_type, v_subscription.started_at))
    );
    v_upgraded := TRUE;
    v_result := jsonb_build_object(
      'success', TRUE,
      'upgraded', TRUE,
      'source', 'subscription',
      'plan_type', v_subscription.plan_type
    );
  ELSE
    -- Check for successful payment
    SELECT * INTO v_payment
    FROM payments
    WHERE user_id = p_user_id
      AND status = 'success'
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
      PERFORM upgrade_user_to_premium(
        p_user_id,
        COALESCE(v_payment.plan_type, 'daily'),
        calculate_subscription_expiry(COALESCE(v_payment.plan_type, 'daily'))
      );
      v_upgraded := TRUE;
      v_result := jsonb_build_object(
        'success', TRUE,
        'upgraded', TRUE,
        'source', 'payment',
        'plan_type', COALESCE(v_payment.plan_type, 'daily')
      );
    ELSE
      v_result := jsonb_build_object(
        'success', FALSE,
        'upgraded', FALSE,
        'message', 'No active subscription or successful payment found'
      );
    END IF;
  END IF;

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'upgraded', FALSE,
      'error', SQLERRM
    );
END;
$$;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION upgrade_user_to_premium(UUID, TEXT, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION calculate_subscription_expiry(TEXT, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION fix_all_paid_users() TO service_role;
GRANT EXECUTE ON FUNCTION fix_user_premium_status(UUID) TO service_role;

-- =====================================================
-- 10. VERIFICATION QUERIES (Optional - Run to test)
-- =====================================================
-- Uncomment to test:
-- SELECT fix_user_premium_status('YOUR_USER_ID_HERE');
-- SELECT * FROM fix_all_paid_users();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Payment upgrade automation installed successfully!' as status;

