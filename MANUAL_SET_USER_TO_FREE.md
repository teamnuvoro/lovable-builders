# How to Set User to Free Plan Manually

## Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor** → **users** table
3. Find the user with phone number: `8828447880`
4. Click on the row to edit
5. Update these fields:
   - `premium_user`: Set to `false`
   - `subscription_plan`: Set to `null` or empty
   - `subscription_expiry`: Set to `null` or empty
6. Click **Save**

## Option 2: Using SQL Editor

Run this SQL in Supabase SQL Editor:

```sql
-- Find user by phone number
UPDATE users
SET 
  premium_user = false,
  subscription_plan = NULL,
  subscription_expiry = NULL,
  updated_at = NOW()
WHERE phone_number = '8828447880';

-- Also cancel any active subscriptions
UPDATE subscriptions
SET 
  status = 'cancelled',
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM users WHERE phone_number = '8828447880'
)
AND status = 'active';

-- Optional: Reset message count
UPDATE usage_stats
SET 
  total_messages = 0,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM users WHERE phone_number = '8828447880'
);
```

## Option 3: Using the Script

```bash
npx tsx scripts/set-user-to-free-by-phone.ts 8828447880
```

## Verify It Worked

After setting to free, check:
1. Refresh your browser (hard refresh: `Cmd+Shift+R`)
2. You should see "FREE PLAN" instead of "PREMIUM"
3. Message count should reset (or you can manually reset it)

