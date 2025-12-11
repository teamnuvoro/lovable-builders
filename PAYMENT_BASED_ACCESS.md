# Payment-Based Premium Access

## Overview
Premium access is now determined by **successful payments** in the `payments` table, not the `premium_user` flag.

## How It Works

1. **All users are set to FREE by default**
   - `users.premium_user = false` for everyone
   - `users.subscription_plan = null`

2. **Premium access is checked via payments table**
   - Users with `payments.status = 'success'` can use chats
   - Users with active subscriptions can also use chats
   - No payment = FREE plan (20 message limit)

3. **Real-time checking**
   - Every chat request checks `payments` table
   - Every user usage check queries `payments` table
   - No caching of premium status

## Setup Steps

### 1. Run Database Migration
```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/20250113_payment_based_premium.sql
```

This creates helper functions:
- `user_has_successful_payment(user_id)` - Check if user has successful payment
- `user_has_active_subscription(user_id)` - Check if user has active subscription
- `get_user_premium_status(user_id)` - Get combined premium status

### 2. Set All Users to Free
```bash
npx tsx scripts/set-all-users-to-free.ts
```

This will:
- Set all `users.premium_user = false`
- Set all `users.subscription_plan = null`
- Set all `users.subscription_expiry = null`
- Show count of users with successful payments

### 3. Restart Backend
```bash
./start-dev.sh
```

The backend now checks `payments` table instead of `premium_user` flag.

## Code Changes

### Backend Changes

1. **`server/utils/checkUserHasPayment.ts`** (NEW)
   - Helper functions to check payments and subscriptions
   - Used by chat and user usage endpoints

2. **`server/routes/chat.ts`**
   - Updated paywall check to use `checkUserHasPayment()`
   - No longer relies on `users.premium_user` flag

3. **`server/routes/supabase-api.ts`**
   - Updated `/api/user/usage` to check payments table
   - Returns premium status based on payment records

### Database Functions

- `user_has_successful_payment(UUID)` - Returns true if user has any successful payment
- `user_has_active_subscription(UUID)` - Returns true if user has active, non-expired subscription
- `get_user_premium_status(UUID)` - Returns JSON with premium status

## Testing

### Test Free User (No Payment)
1. User should have NO records in `payments` table with `status='success'`
2. User should see "FREE PLAN" in UI
3. User should be limited to 20 messages

### Test Premium User (Has Payment)
1. Create a payment record:
   ```sql
   INSERT INTO payments (user_id, cashfree_order_id, amount, status, plan_type)
   VALUES ('USER_ID', 'TEST_ORDER_123', 99.00, 'success', 'daily');
   ```
2. User should have access to unlimited chats
3. User should see "PREMIUM" in UI

### Verify in Database
```sql
-- Check user's payment status
SELECT 
  u.id,
  u.name,
  u.email,
  u.premium_user,
  COUNT(p.id) as successful_payments
FROM users u
LEFT JOIN payments p ON p.user_id = u.id AND p.status = 'success'
WHERE u.id = 'USER_ID'
GROUP BY u.id, u.name, u.email, u.premium_user;
```

## Benefits

1. **Single Source of Truth**: Payments table is the authority
2. **No Sync Issues**: No need to keep `premium_user` flag in sync
3. **Audit Trail**: Can see all successful payments
4. **Flexible**: Can check payment history, dates, amounts, etc.

## Migration Notes

- Old `premium_user` flag is still in database but not used for access control
- Triggers that set `premium_user` still work (for UI display)
- But access control now checks `payments` table directly

## Troubleshooting

### User has payment but still can't chat
1. Check payment status: `SELECT * FROM payments WHERE user_id = 'USER_ID' AND status = 'success';`
2. Check backend logs for payment check results
3. Verify migration was run: `SELECT * FROM pg_proc WHERE proname = 'user_has_successful_payment';`

### User shows premium but shouldn't
1. Check if they have successful payment: `SELECT * FROM payments WHERE user_id = 'USER_ID' AND status = 'success';`
2. If no payment, run: `npx tsx scripts/set-all-users-to-free.ts` again
3. Clear browser cache and refresh

