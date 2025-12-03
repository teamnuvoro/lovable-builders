-- CREATE REQUIRED TABLES IN SUPABASE
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE,
  gender TEXT DEFAULT 'prefer_not_to_say',
  persona TEXT DEFAULT 'sweet_supportive',
  persona_prompt JSONB,
  premium_user BOOLEAN DEFAULT false,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  locale TEXT DEFAULT 'hi-IN',
  onboarding_complete BOOLEAN DEFAULT true,
  age INTEGER,
  city TEXT,
  occupation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create usage_stats table
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_messages INTEGER DEFAULT 0,
  total_call_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'chat',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  partner_type_one_liner TEXT,
  top_3_traits_you_value TEXT[],
  what_you_might_work_on TEXT[],
  next_time_focus TEXT[],
  love_language_guess TEXT,
  communication_fit TEXT,
  confidence_score INTEGER,
  persona_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai', 'assistant')),
  tag TEXT DEFAULT 'general' CHECK (tag IN ('general', 'evaluation')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user ON usage_stats(user_id);

-- 7. Create user_summary_latest table
CREATE TABLE IF NOT EXISTS user_summary_latest (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  partner_type_one_liner TEXT,
  top_3_traits_you_value TEXT[],
  what_you_might_work_on TEXT[],
  next_time_focus TEXT[],
  love_language_guess TEXT,
  communication_fit TEXT,
  confidence_score INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Success message
SELECT 'All tables created successfully!' as status;
