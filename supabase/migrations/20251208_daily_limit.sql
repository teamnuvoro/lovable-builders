-- Add daily limit tracking columns to usage_stats
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_stats' AND column_name = 'daily_messages_count') THEN
        ALTER TABLE usage_stats ADD COLUMN daily_messages_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_stats' AND column_name = 'last_daily_reset') THEN
        ALTER TABLE usage_stats ADD COLUMN last_daily_reset TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;
