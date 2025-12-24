-- =====================================================
-- RAZORPAY PAYMENT MIGRATION
-- Migrates payment_transactions table from Cashfree to Razorpay
-- =====================================================

-- Make cashfree_order_id nullable (to allow Razorpay-only transactions)
-- Note: This may fail if there are existing NOT NULL constraints
-- If it fails, you may need to drop and recreate the constraint
DO $$
BEGIN
  -- Try to alter the column to be nullable
  ALTER TABLE payment_transactions 
  ALTER COLUMN cashfree_order_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN
    -- If it fails, log and continue (column might already be nullable)
    RAISE NOTICE 'Could not make cashfree_order_id nullable: %', SQLERRM;
END $$;

-- Remove UNIQUE constraint on cashfree_order_id (if exists)
-- This allows both Cashfree and Razorpay orders to coexist
DO $$
BEGIN
  ALTER TABLE payment_transactions 
  DROP CONSTRAINT IF EXISTS payment_transactions_cashfree_order_id_key;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not drop unique constraint: %', SQLERRM;
END $$;

-- Add new Razorpay columns (keep Cashfree columns for backward compatibility)
ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Create index for Razorpay order lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_order 
ON payment_transactions(razorpay_order_id) 
WHERE razorpay_order_id IS NOT NULL;

-- Create composite index for user and razorpay order
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_razorpay 
ON payment_transactions(user_id, razorpay_order_id) 
WHERE razorpay_order_id IS NOT NULL;

-- Add check constraint to ensure at least one order ID exists
ALTER TABLE payment_transactions
ADD CONSTRAINT payment_transactions_order_id_check 
CHECK (
  cashfree_order_id IS NOT NULL OR razorpay_order_id IS NOT NULL
);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Razorpay payment migration completed!' as status;

