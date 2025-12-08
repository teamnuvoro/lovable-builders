# Supabase Setup Instructions

## Step 1: Run the SQL Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `supabase/migrations/20250109_payment_upgrade_automation.sql`
3. Paste into SQL Editor
4. Click "Run" to execute

This will create:
- ✅ Database functions for upgrading users
- ✅ Automatic triggers on subscriptions and payments tables
- ✅ Manual fix functions for existing users

## Step 2: Fix Existing Users (Optional but Recommended)

After running the migration, fix all users who already paid but weren't upgraded:

```sql
-- Fix all users with active subscriptions
SELECT * FROM fix_all_paid_users();
```

This will upgrade all users who have:
- Active subscriptions but aren't premium
- Successful payments but aren't premium

## Step 3: Test the Automation

Test with a specific user (replace USER_ID):

```sql
-- Test fix for specific user
SELECT fix_user_premium_status('USER_ID_HERE');
```

## Step 4: Verify Triggers Work

The triggers will automatically fire when:
- A subscription status changes to 'active'
- A payment status changes to 'success'

You can test by updating a subscription:

```sql
-- Test trigger (replace ORDER_ID)
UPDATE subscriptions 
SET status = 'active' 
WHERE cashfree_order_id = 'ORDER_ID_HERE';
```

The user should be automatically upgraded!

## API Endpoints (After Server Deployment)

### Fix Specific User
```bash
POST /api/payment/fix-user
Body: { "userId": "user-uuid-here" }
```

### Fix All Users
```bash
POST /api/payment/fix-all
```

## Troubleshooting

### If triggers don't fire:
1. Check if functions exist: `SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%upgrade%';`
2. Check if triggers exist: `SELECT trigger_name FROM information_schema.triggers WHERE trigger_name LIKE '%upgrade%';`
3. Check logs in Supabase Dashboard → Logs

### If manual fix doesn't work:
1. Check user has active subscription: `SELECT * FROM subscriptions WHERE user_id = 'USER_ID' AND status = 'active';`
2. Check user has successful payment: `SELECT * FROM payments WHERE user_id = 'USER_ID' AND status = 'success';`
3. Manually upgrade: `SELECT upgrade_user_to_premium('USER_ID', 'daily');`

