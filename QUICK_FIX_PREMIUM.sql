-- =====================================================
-- QUICK FIX: Set All Users to Premium (Works with Current Schema)
-- =====================================================

-- This uses the existing premium_user column
UPDATE users
SET 
  premium_user = true,
  subscription_plan = 'daily',
  subscription_expiry = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE id IS NOT NULL;

-- Show result
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN premium_user = true THEN 1 END) as premium_users
FROM users;

SELECT '✅ All users set to PREMIUM!' as status;

