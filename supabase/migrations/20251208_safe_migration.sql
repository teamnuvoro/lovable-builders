-- SAFE MIGRATION SCRIPT (Copy and Run this entire block)
-- This script uses "IF EXISTS" checks to avoid errors if you run it multiple times.

-- 1. TRACKING & LIMITS
-- Add usage tracking columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_stats' AND column_name = 'daily_messages_count') THEN
        ALTER TABLE usage_stats ADD COLUMN daily_messages_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_stats' AND column_name = 'last_daily_reset') THEN
        ALTER TABLE usage_stats ADD COLUMN last_daily_reset TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. USER SUBSCRIPTION FIELDS
-- Add subscription fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan TEXT;

-- 3. PAYMENTS TABLE (The robust one for the new plan)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID, -- Optional reference
    cashfree_order_id TEXT,
    cashfree_payment_id TEXT,
    amount NUMERIC,
    status TEXT, -- 'success', 'failed', 'pending'
    plan_type TEXT, -- 'daily', 'weekly'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBSCRIPTIONS TABLE (If missing)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT,
    amount NUMERIC,
    currency TEXT DEFAULT 'INR',
    status TEXT,
    cashfree_order_id TEXT,
    cashfree_payment_id TEXT,
    started_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYMENT LOGS & METHODS (Supporting tables)
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id TEXT,
    event_type TEXT NOT NULL,
    status_code TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details JSONB
);

CREATE TABLE IF NOT EXISTS user_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    upi_id TEXT,
    last_used TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SECURITY POLICIES (RLS) - The part that was failing
-- We DROP existing policies first to prevent "Policy already exists" errors

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Payments Table Policies
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role insert payments" ON payments;
CREATE POLICY "Service role insert payments" ON payments FOR INSERT WITH CHECK (true);

-- Subscriptions Table Policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- User Payment Methods Policies (The specific error you saw)
DROP POLICY IF EXISTS "Users can view their own payment details" ON user_payment_methods;
CREATE POLICY "Users can view their own payment details" ON user_payment_methods FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access" ON user_payment_methods;
CREATE POLICY "Service role full access" ON user_payment_methods USING (true) WITH CHECK (true);

-- Grant Access
GRANT SELECT, INSERT, UPDATE ON payments TO service_role;
GRANT SELECT ON payments TO authenticated;
