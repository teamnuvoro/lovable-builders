-- =====================================================
-- TEMPORARY: Set All Users to Premium
-- This works with EXISTING schema (premium_user column)
-- =====================================================

-- First, check if subscription_tier column exists, if not use premium_user
-- Option 1: If subscription_tier column exists (after running migration)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'subscription_tier'
    ) THEN
        -- Use new schema
        UPDATE users
        SET 
          subscription_tier = 'daily',
          subscription_start_time = NOW(),
          subscription_end_time = NOW() + INTERVAL '30 days',
          updated_at = NOW()
        WHERE id IS NOT NULL;
        
        RAISE NOTICE 'Updated using subscription_tier column';
    ELSE
        -- Use old schema (premium_user column)
        UPDATE users
        SET 
          premium_user = true,
          subscription_plan = 'daily',
          subscription_expiry = NOW() + INTERVAL '30 days',
          updated_at = NOW()
        WHERE id IS NOT NULL;
        
        RAISE NOTICE 'Updated using premium_user column (old schema)';
    END IF;
END $$;

-- Show summary
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN premium_user = true OR subscription_tier IN ('daily', 'weekly') THEN 1 END) as premium_users,
  COUNT(CASE WHEN premium_user = false OR subscription_tier = 'free' THEN 1 END) as free_users
FROM users;

-- Success message
SELECT '✅ All users set to PREMIUM for 30 days!' as status;

