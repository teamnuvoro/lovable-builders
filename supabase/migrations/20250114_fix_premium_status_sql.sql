-- =====================================================
-- FIX PREMIUM STATUS SQL FUNCTIONS
-- Update SQL functions to exclude mock payments and expired subscriptions
-- This matches the backend logic in server/routes/supabase-api.ts
-- =====================================================

-- =====================================================
-- 1. UPDATE: Check if user has active subscription (exclude mocks and expired)
-- =====================================================
CREATE OR REPLACE FUNCTION user_has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_subscription BOOLEAN := FALSE;
  v_expiry TIMESTAMPTZ;
  v_order_id TEXT;
  v_payment_method TEXT;
BEGIN
  -- Check if user has active subscription that:
  -- 1. Has status = 'active'
  -- 2. Has not expired (expires_at > NOW() OR expires_at IS NULL but we treat NULL as expired)
  -- 3. Is NOT a mock payment (cashfree_order_id does NOT start with 'mock_order_')
  -- 4. Has a corresponding real payment (payment_method != 'mock')
  SELECT 
    s.expires_at,
    s.cashfree_order_id
  INTO v_expiry, v_order_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
    AND s.cashfree_order_id IS NOT NULL
    AND s.cashfree_order_id NOT LIKE 'mock_order_%'  -- Exclude mock subscriptions
    AND (s.expires_at IS NOT NULL AND s.expires_at > NOW())  -- Must have expiry and not expired
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    -- Double-check: Verify this subscription has a real payment (not mock)
    IF v_order_id IS NOT NULL THEN
      SELECT payment_method INTO v_payment_method
      FROM payments
      WHERE cashfree_order_id = v_order_id
        AND status = 'success'
      LIMIT 1;
      
      -- Only grant premium if payment exists and is NOT mock
      IF v_payment_method IS NOT NULL AND v_payment_method != 'mock' THEN
        v_has_subscription := TRUE;
      END IF;
    END IF;
  END IF;
  
  RETURN v_has_subscription;
END;
$$;

-- =====================================================
-- 2. UPDATE: Check if user has successful payment (exclude mocks)
-- =====================================================
CREATE OR REPLACE FUNCTION user_has_successful_payment(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_payment BOOLEAN := FALSE;
BEGIN
  -- Check if user has any successful payment that is NOT a mock payment
  SELECT EXISTS(
    SELECT 1 
    FROM payments 
    WHERE user_id = p_user_id 
      AND status = 'success'
      AND (payment_method IS NULL OR payment_method != 'mock')  -- Exclude mock payments
  ) INTO v_has_payment;
  
  RETURN v_has_payment;
END;
$$;

-- =====================================================
-- 3. UPDATE: Get user premium status (exclude mocks and expired)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_premium_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_payment BOOLEAN;
  v_has_subscription BOOLEAN;
  v_subscription_plan TEXT;
  v_result JSONB;
BEGIN
  -- Check both payment and subscription (both now exclude mocks)
  v_has_payment := user_has_successful_payment(p_user_id);
  v_has_subscription := user_has_active_subscription(p_user_id);
  
  -- Get subscription plan if subscription exists
  IF v_has_subscription THEN
    SELECT plan_type INTO v_subscription_plan
    FROM subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND cashfree_order_id IS NOT NULL
      AND cashfree_order_id NOT LIKE 'mock_order_%'
      AND expires_at IS NOT NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  v_result := jsonb_build_object(
    'isPremium', (v_has_payment OR v_has_subscription),
    'hasPayment', v_has_payment,
    'hasSubscription', v_has_subscription,
    'subscriptionPlan', v_subscription_plan
  );
  
  RETURN v_result;
END;
$$;

-- =====================================================
-- 4. NEW FUNCTION: Get active subscription details (exclude mocks)
-- =====================================================
CREATE OR REPLACE FUNCTION get_active_subscription_details(p_user_id UUID)
RETURNS TABLE(
  subscription_id UUID,
  plan_type TEXT,
  expires_at TIMESTAMPTZ,
  cashfree_order_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.plan_type,
    s.expires_at,
    s.cashfree_order_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
    AND s.cashfree_order_id IS NOT NULL
    AND s.cashfree_order_id NOT LIKE 'mock_order_%'  -- Exclude mock subscriptions
    AND s.expires_at IS NOT NULL
    AND s.expires_at > NOW()  -- Not expired
    AND EXISTS (
      -- Verify there's a real payment (not mock)
      SELECT 1
      FROM payments p
      WHERE p.cashfree_order_id = s.cashfree_order_id
        AND p.status = 'success'
        AND (p.payment_method IS NULL OR p.payment_method != 'mock')
    )
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION user_has_successful_payment(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_premium_status(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_active_subscription_details(UUID) TO service_role;

-- =====================================================
-- 6. CLEANUP: Mark expired subscriptions as expired
-- =====================================================
UPDATE subscriptions
SET 
  status = 'expired',
  updated_at = NOW()
WHERE status = 'active'
  AND (
    expires_at IS NULL  -- No expiry date = expired
    OR expires_at < NOW()  -- Past expiry date = expired
  );

-- =====================================================
-- 7. CLEANUP: Mark mock subscriptions as expired
-- =====================================================
UPDATE subscriptions
SET 
  status = 'expired',
  updated_at = NOW()
WHERE status = 'active'
  AND cashfree_order_id LIKE 'mock_order_%';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Premium status SQL functions updated! Mock payments and expired subscriptions are now excluded.' as status;
