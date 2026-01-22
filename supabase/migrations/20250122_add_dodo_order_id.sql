-- Add dodo_order_id column to subscriptions table
-- This migration adds support for Dodo Payments order tracking

-- Step 1: Make cashfree_order_id nullable (if it has NOT NULL constraint)
DO $$
BEGIN
    -- Check if cashfree_order_id has NOT NULL constraint
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'cashfree_order_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE subscriptions 
        ALTER COLUMN cashfree_order_id DROP NOT NULL;
        
        RAISE NOTICE 'Made cashfree_order_id nullable';
    END IF;
END $$;

-- Step 2: Add dodo_order_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'dodo_order_id'
    ) THEN
        ALTER TABLE subscriptions 
        ADD COLUMN dodo_order_id TEXT;
        
        RAISE NOTICE 'Added dodo_order_id column to subscriptions table';
    ELSE
        RAISE NOTICE 'dodo_order_id column already exists in subscriptions table';
    END IF;
END $$;

-- Step 3: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_dodo_order_id 
ON subscriptions(dodo_order_id) 
WHERE dodo_order_id IS NOT NULL;
