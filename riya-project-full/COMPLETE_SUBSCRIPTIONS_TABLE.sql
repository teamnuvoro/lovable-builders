-- COMPLETE SQL for subscriptions table
-- Copy this ENTIRE script to Supabase SQL Editor

-- First, drop the table if it exists with wrong schema
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Create subscriptions table with ALL columns
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('daily', 'weekly')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  cashfree_order_id TEXT UNIQUE NOT NULL,
  cashfree_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_order ON subscriptions(cashfree_order_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Success message
SELECT 'Subscriptions table created successfully!' as message;
