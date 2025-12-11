-- =====================================================
-- TEMPORARY: Set All Users to Premium
-- Copy and paste this into Supabase SQL Editor
-- =====================================================

-- Set all users to daily premium with 30-day expiry
UPDATE users
SET 
  subscription_tier = 'daily',
  subscription_start_time = NOW(),
  subscription_end_time = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE id IS NOT NULL;

-- Show summary
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users,
  COUNT(CASE WHEN subscription_tier = 'daily' THEN 1 END) as daily_users,
  COUNT(CASE WHEN subscription_tier = 'weekly' THEN 1 END) as weekly_users
FROM users;

-- Success message
SELECT '✅ All users set to PREMIUM (daily) for 30 days!' as status;

