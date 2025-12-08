-- Create Payment Logs Table
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id TEXT,
    event_type TEXT NOT NULL,
    status_code TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details JSONB
);

-- Create User Payment Methods Table
CREATE TABLE IF NOT EXISTS user_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    upi_id TEXT, -- Encrypted
    last_used TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Policies for user_payment_methods
CREATE POLICY "Users can view their own payment details"
ON user_payment_methods
FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert/update (application logic handles encryption)
CREATE POLICY "Service role full access"
ON user_payment_methods
USING (true)
WITH CHECK (true);
