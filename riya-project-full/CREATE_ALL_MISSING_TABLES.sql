-- CREATE ALL MISSING TABLES IN SUPABASE
-- Copy this ENTIRE script and run in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create call_sessions table (for voice calls)
CREATE TABLE IF NOT EXISTS call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vapi_call_id TEXT,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed', 'failed', 'aborted')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  transcript TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create subscriptions table (for payments)
DROP TABLE IF EXISTS subscriptions CASCADE;

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

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_sessions_user ON call_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_status ON call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_order ON subscriptions(cashfree_order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 4. Verify tables exist
SELECT 
  'Tables created successfully!' as status,
  COUNT(*) FILTER (WHERE table_name = 'call_sessions') as call_sessions_exists,
  COUNT(*) FILTER (WHERE table_name = 'subscriptions') as subscriptions_exists,
  COUNT(*) FILTER (WHERE table_name = 'users') as users_exists,
  COUNT(*) FILTER (WHERE table_name = 'usage_stats') as usage_stats_exists
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('call_sessions', 'subscriptions', 'users', 'usage_stats');

