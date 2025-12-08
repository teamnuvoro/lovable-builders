-- =====================================================
-- FIX EXISTING USERS - Run this in Supabase SQL Editor
-- =====================================================

-- This will upgrade all users who have active subscriptions or successful payments
-- but aren't marked as premium yet

SELECT * FROM fix_all_paid_users();

-- To see the results more clearly:
-- SELECT 
--   user_id,
--   upgraded,
--   message
-- FROM fix_all_paid_users();

