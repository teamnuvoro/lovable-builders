-- =====================================================
-- VERSION 2 - ALL MIGRATIONS COMBINED
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- MIGRATION 1: Razorpay Payment Migration
-- =====================================================

-- Make cashfree_order_id nullable (to allow Razorpay-only transactions)
DO $$
BEGIN
  ALTER TABLE payment_transactions 
  ALTER COLUMN cashfree_order_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not make cashfree_order_id nullable: %', SQLERRM;
END $$;

-- Remove UNIQUE constraint on cashfree_order_id (if exists)
DO $$
BEGIN
  ALTER TABLE payment_transactions 
  DROP CONSTRAINT IF EXISTS payment_transactions_cashfree_order_id_key;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not drop unique constraint: %', SQLERRM;
END $$;

-- Add new Razorpay columns
ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Create indexes for Razorpay
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_order 
ON payment_transactions(razorpay_order_id) 
WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_razorpay 
ON payment_transactions(user_id, razorpay_order_id) 
WHERE razorpay_order_id IS NOT NULL;

-- Add check constraint
ALTER TABLE payment_transactions
DROP CONSTRAINT IF EXISTS payment_transactions_order_id_check;

ALTER TABLE payment_transactions
ADD CONSTRAINT payment_transactions_order_id_check 
CHECK (
  cashfree_order_id IS NOT NULL OR razorpay_order_id IS NOT NULL
);

-- =====================================================
-- MIGRATION 2: WhatsApp Reminders
-- =====================================================

-- Create whatsapp_reminders table
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

-- Indexes for whatsapp_reminders
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

-- Add user fields for WhatsApp reminders
ALTER TABLE users
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT true;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_last_active 
ON users(last_active_at) 
WHERE last_active_at IS NOT NULL;

-- Create trigger for whatsapp_reminders updated_at
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

-- RLS Policies for whatsapp_reminders
ALTER TABLE whatsapp_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reminders" ON whatsapp_reminders;
CREATE POLICY "Users can view own reminders" ON whatsapp_reminders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage reminders" ON whatsapp_reminders;
CREATE POLICY "Service role can manage reminders" ON whatsapp_reminders
  FOR ALL USING (true);

GRANT SELECT, INSERT, UPDATE ON whatsapp_reminders TO service_role;

-- =====================================================
-- MIGRATION 3: Sarvam Call ID Support
-- =====================================================

-- Add sarvam_call_id to call_sessions
ALTER TABLE call_sessions
ADD COLUMN IF NOT EXISTS sarvam_call_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_call_sessions_sarvam_call_id 
ON call_sessions(sarvam_call_id) 
WHERE sarvam_call_id IS NOT NULL;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ All Version 2 migrations completed successfully!' as status;

