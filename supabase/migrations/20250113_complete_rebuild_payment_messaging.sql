-- =====================================================
-- COMPLETE REBUILD: Payment & Messaging Flow
-- This migration creates the exact schema as specified
-- =====================================================

-- =====================================================
-- 1. UPDATE USERS TABLE
-- =====================================================

-- Add new subscription fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_time TIMESTAMPTZ;

-- Update existing users to free tier
UPDATE users 
SET subscription_tier = 'free',
    subscription_start_time = NULL,
    subscription_end_time = NULL
WHERE subscription_tier IS NULL;

-- =====================================================
-- 2. CREATE MESSAGE_LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_user_message BOOLEAN DEFAULT true
);

-- Index for fast querying recent messages (24-hour window)
CREATE INDEX IF NOT EXISTS idx_message_logs_user_created 
ON message_logs(user_id, created_at DESC);

-- =====================================================
-- 3. CREATE PAYMENT_TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cashfree_order_id VARCHAR(255) UNIQUE NOT NULL,
  cashfree_payment_id VARCHAR(255),
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('daily', 'weekly')),
  amount_paise BIGINT NOT NULL, -- Store in paise (1 rupee = 100 paise)
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  payment_timestamp TIMESTAMPTZ -- When Cashfree confirmed payment
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_cashfree 
ON payment_transactions(user_id, cashfree_order_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status 
ON payment_transactions(status) WHERE status = 'pending';

-- =====================================================
-- 4. CREATE SUBSCRIPTION_HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_tier VARCHAR(20),
  new_tier VARCHAR(20) NOT NULL,
  reason VARCHAR(100) NOT NULL, -- 'payment_success', 'expiration', 'manual_downgrade'
  transaction_id UUID REFERENCES payment_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user 
ON subscription_history(user_id, created_at DESC);

-- =====================================================
-- 5. CREATE HELPER FUNCTION: trigger_set_updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. CREATE TRIGGER: Auto-update updated_at on users
-- =====================================================

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- =====================================================
-- 7. CREATE TRIGGER: Auto-update updated_at on payment_transactions
-- =====================================================

DROP TRIGGER IF EXISTS set_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER set_payment_transactions_updated_at
BEFORE UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- =====================================================
-- 8. CREATE FUNCTION: Check and downgrade expired subscriptions
-- =====================================================

-- Drop existing function if it exists (in case return type changed)
DROP FUNCTION IF EXISTS check_and_downgrade_expired_subscriptions() CASCADE;

CREATE FUNCTION check_and_downgrade_expired_subscriptions()
RETURNS TABLE(
  user_id UUID,
  old_tier VARCHAR,
  downgraded BOOLEAN
) AS $$
DECLARE
  expired_user RECORD;
BEGIN
  -- Find users with expired subscriptions
  FOR expired_user IN
    SELECT id, subscription_tier, subscription_end_time
    FROM users
    WHERE subscription_tier IN ('daily', 'weekly')
      AND subscription_end_time IS NOT NULL
      AND subscription_end_time <= NOW()
  LOOP
    -- Downgrade to free
    UPDATE users
    SET subscription_tier = 'free',
        subscription_start_time = NULL,
        subscription_end_time = NULL,
        updated_at = NOW()
    WHERE id = expired_user.id;

    -- Log to history
    INSERT INTO subscription_history (
      user_id, old_tier, new_tier, reason
    ) VALUES (
      expired_user.id,
      expired_user.subscription_tier,
      'free',
      'expiration'
    );

    -- Return result
    user_id := expired_user.id;
    old_tier := expired_user.subscription_tier;
    downgraded := TRUE;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. CREATE FUNCTION: Get message count in last 24 hours
-- =====================================================

-- Drop existing function if it exists (in case return type changed)
DROP FUNCTION IF EXISTS get_user_message_count_24h(UUID) CASCADE;

CREATE FUNCTION get_user_message_count_24h(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  msg_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO msg_count
  FROM message_logs
  WHERE user_id = p_user_id
    AND is_user_message = true
    AND created_at > NOW() - INTERVAL '24 hours';
  
  RETURN COALESCE(msg_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own message logs
DROP POLICY IF EXISTS "Users can view own message logs" ON message_logs;
CREATE POLICY "Users can view own message logs" ON message_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can read message logs (for quota checking)
DROP POLICY IF EXISTS "Service role can read message logs" ON message_logs;
CREATE POLICY "Service role can read message logs" ON message_logs
  FOR SELECT USING (true);

-- Service role can insert message logs (for backend)
DROP POLICY IF EXISTS "Service role can insert message logs" ON message_logs;
CREATE POLICY "Service role can insert message logs" ON message_logs
  FOR INSERT WITH CHECK (true);

-- Users can only see their own payment transactions
DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage payment transactions
DROP POLICY IF EXISTS "Service role can manage payment transactions" ON payment_transactions;
CREATE POLICY "Service role can manage payment transactions" ON payment_transactions
  FOR ALL USING (true);

-- Users can only see their own subscription history
DROP POLICY IF EXISTS "Users can view own subscription history" ON subscription_history;
CREATE POLICY "Users can view own subscription history" ON subscription_history
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert subscription history
DROP POLICY IF EXISTS "Service role can insert subscription history" ON subscription_history;
CREATE POLICY "Service role can insert subscription history" ON subscription_history
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_and_downgrade_expired_subscriptions() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_message_count_24h(UUID) TO service_role;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Complete payment and messaging schema created!' as status;

