-- =====================================================
-- WHATSAPP REMINDERS SYSTEM
-- Creates tables and fields for reminder tracking
-- =====================================================

-- =====================================================
-- 1. CREATE WHATSAPP_REMINDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('daily_checkin', 'subscription_expiry', 'inactive_user')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  message_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_user 
ON whatsapp_reminders(user_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_scheduled 
ON whatsapp_reminders(scheduled_at) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_status 
ON whatsapp_reminders(status) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_type 
ON whatsapp_reminders(reminder_type);

-- =====================================================
-- 2. ADD USER FIELDS FOR WHATSAPP REMINDERS
-- =====================================================

-- Add whatsapp_opt_in field (default true, allow opt-out)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT true;

-- Add last_active_at field (track last chat/call activity)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Create index for last_active_at queries
CREATE INDEX IF NOT EXISTS idx_users_last_active 
ON users(last_active_at) 
WHERE last_active_at IS NOT NULL;

-- =====================================================
-- 3. CREATE TRIGGER: Auto-update updated_at on whatsapp_reminders
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_set_whatsapp_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_whatsapp_reminders_updated_at ON whatsapp_reminders;
CREATE TRIGGER set_whatsapp_reminders_updated_at
BEFORE UPDATE ON whatsapp_reminders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_whatsapp_reminders_updated_at();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE whatsapp_reminders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own reminders
DROP POLICY IF EXISTS "Users can view own reminders" ON whatsapp_reminders;
CREATE POLICY "Users can view own reminders" ON whatsapp_reminders
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all reminders
DROP POLICY IF EXISTS "Service role can manage reminders" ON whatsapp_reminders;
CREATE POLICY "Service role can manage reminders" ON whatsapp_reminders
  FOR ALL USING (true);

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON whatsapp_reminders TO service_role;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ WhatsApp reminders schema created!' as status;

