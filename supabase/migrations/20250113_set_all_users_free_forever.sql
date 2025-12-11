-- =====================================================
-- SET ALL USERS TO FREE PLAN FOREVER
-- This sets all users to free plan and clears premium status
-- Premium access is now determined by payments table only
-- =====================================================

-- Set all users to free plan
UPDATE users
SET 
  premium_user = false,
  subscription_plan = null,
  subscription_expiry = null,
  updated_at = NOW()
WHERE id IS NOT NULL; -- Update all users

-- Show summary
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN premium_user = true THEN 1 END) as premium_users,
  COUNT(CASE WHEN premium_user = false THEN 1 END) as free_users
FROM users;

-- Show users with successful payments (these will have access)
SELECT 
  COUNT(DISTINCT user_id) as users_with_successful_payments
FROM payments
WHERE status = 'success';

-- Success message
SELECT '✅ All users set to FREE plan. Premium access now based on payments table only!' as status;

