-- Fix RLS Policies for Upgrade Triggers
-- This migration allows SECURITY DEFINER functions to update users table
-- The trigger functions need to be able to update users when payments succeed

-- =====================================================
-- 1. Allow service_role to update users (for trigger functions)
-- =====================================================
DROP POLICY IF EXISTS "Service role can update users" ON users;
CREATE POLICY "Service role can update users" 
ON users 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- =====================================================
-- 2. Allow service_role to read users (for trigger functions to check status)
-- =====================================================
DROP POLICY IF EXISTS "Service role can read users" ON users;
CREATE POLICY "Service role can read users" 
ON users 
FOR SELECT 
USING (true);

-- =====================================================
-- 3. Ensure payments table allows service_role to update (for triggers)
-- =====================================================
DROP POLICY IF EXISTS "Service role can update payments" ON payments;
CREATE POLICY "Service role can update payments" 
ON payments 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- =====================================================
-- 4. Ensure subscriptions table allows service_role to update (for triggers)
-- =====================================================
DROP POLICY IF EXISTS "Service role can update subscriptions" ON subscriptions;
CREATE POLICY "Service role can update subscriptions" 
ON subscriptions 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- =====================================================
-- 5. Ensure subscriptions table allows service_role to read (for triggers)
-- =====================================================
DROP POLICY IF EXISTS "Service role can read subscriptions" ON subscriptions;
CREATE POLICY "Service role can read subscriptions" 
ON subscriptions 
FOR SELECT 
USING (true);

-- =====================================================
-- 6. Ensure payments table allows service_role to read (for triggers)
-- =====================================================
DROP POLICY IF EXISTS "Service role can read payments" ON payments;
CREATE POLICY "Service role can read payments" 
ON payments 
FOR SELECT 
USING (true);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this migration, test with:
-- SELECT fix_user_premium_status('YOUR_USER_ID_HERE');
-- 
-- Or check if triggers are working by:
-- 1. Insert a payment with status='success'
-- 2. Check if user.premium_user was updated

SELECT 'RLS policies updated for upgrade triggers!' as status;


