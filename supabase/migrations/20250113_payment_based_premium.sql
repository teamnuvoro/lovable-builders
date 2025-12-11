-- =====================================================
-- PAYMENT-BASED PREMIUM ACCESS
-- Premium access is now determined by successful payments
-- All users are set to free, only users with payments.status='success' have access
-- =====================================================

-- =====================================================
-- 1. FUNCTION: Check if user has successful payment
-- =====================================================
CREATE OR REPLACE FUNCTION user_has_successful_payment(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_payment BOOLEAN := FALSE;
BEGIN
  -- Check if user has any successful payment
  SELECT EXISTS(
    SELECT 1 
    FROM payments 
    WHERE user_id = p_user_id 
      AND status = 'success'
  ) INTO v_has_payment;
  
  RETURN v_has_payment;
END;
$$;

-- =====================================================
-- 2. FUNCTION: Check if user has active subscription
-- =====================================================
CREATE OR REPLACE FUNCTION user_has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_subscription BOOLEAN := FALSE;
  v_expiry TIMESTAMPTZ;
BEGIN
  -- Check if user has active subscription
  SELECT expires_at INTO v_expiry
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    -- Check if subscription hasn't expired
    IF v_expiry IS NULL OR v_expiry > NOW() THEN
      v_has_subscription := TRUE;
    END IF;
  END IF;
  
  RETURN v_has_subscription;
END;
$$;

-- =====================================================
-- 3. FUNCTION: Get user premium status (payment-based)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_premium_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_payment BOOLEAN;
  v_has_subscription BOOLEAN;
  v_result JSONB;
BEGIN
  -- Check both payment and subscription
  v_has_payment := user_has_successful_payment(p_user_id);
  v_has_subscription := user_has_active_subscription(p_user_id);
  
  v_result := jsonb_build_object(
    'isPremium', (v_has_payment OR v_has_subscription),
    'hasPayment', v_has_payment,
    'hasSubscription', v_has_subscription
  );
  
  RETURN v_result;
END;
$$;

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION user_has_successful_payment(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_premium_status(UUID) TO service_role;

-- =====================================================
-- 5. NOTE: Set all users to free (run script separately)
-- =====================================================
-- Run: npx tsx scripts/set-all-users-to-free.ts
-- This will set all users.premium_user = false
-- Premium access is now determined by payments table

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Payment-based premium access functions installed!' as status;

