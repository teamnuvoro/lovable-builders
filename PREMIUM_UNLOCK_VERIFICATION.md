# Premium Unlock After Payment - Verification

## How It Works

### 1. Payment Flow
1. User clicks "Get Premium" → Creates checkout session
2. User completes payment on Dodo checkout page
3. Dodo sends webhook to `/api/payment/webhook`

### 2. Webhook Handler (`server/routes/payment.ts`)
When `payment.succeeded` event is received:

**Step 1: Extract User ID**
- Gets `user_id` from `event.data.metadata.user_id`
- Gets `plan_type` from metadata (should be 'monthly')

**Step 2: Calculate Expiry**
- For monthly plan: Adds 1 month from current date
- Sets `expiry` to 1 month from now

**Step 3: Unlock Premium (CRITICAL)**
```typescript
await supabase
  .from('users')
  .update({
    premium_user: true,              // ✅ Sets premium flag
    subscription_plan: 'monthly',   // ✅ Sets plan type
    subscription_expiry: expiry,     // ✅ Sets expiry (1 month)
    updated_at: new Date().toISOString()
  })
  .eq('id', userId);
```

**Step 4: Update Subscription Record**
- Finds subscription by `dodo_order_id` or pending status
- Updates to `status: 'active'` with expiry date

**Step 5: Record Payment**
- Inserts payment record (non-blocking)

### 3. Premium Status Check (`server/routes/supabase-api.ts`)
The `/api/user/usage` endpoint now checks:

1. **First:** Checks active subscriptions in `subscriptions` table
2. **Then:** Checks `premium_user` field in `users` table (for Dodo payments)
3. **Validates:** Ensures `subscription_expiry` hasn't passed

If `premium_user: true` and not expired → `isPremium = true`

### 4. Message Limits (`server/utils/messageQuota.ts`)
Updated to:
- Check `premium_user === true` (not expired)
- Check `subscription_plan === 'monthly'`
- Allow unlimited messages (returns 999999) if premium

### 5. Frontend (`client/src/pages/ChatPage.tsx`)
- Checks `userUsage?.premiumUser` from `/api/user/usage`
- If premium → unlimited messages
- If not premium → 20 message limit

## Verification Checklist

After payment completes:

✅ **Database Check:**
```sql
SELECT premium_user, subscription_plan, subscription_expiry 
FROM users 
WHERE id = 'user-id-here';
```
Should show:
- `premium_user: true`
- `subscription_plan: 'monthly'`
- `subscription_expiry: <date 1 month from now>`

✅ **Subscription Check:**
```sql
SELECT status, plan_type, expires_at 
FROM subscriptions 
WHERE user_id = 'user-id-here' 
ORDER BY created_at DESC 
LIMIT 1;
```
Should show:
- `status: 'active'`
- `plan_type: 'monthly'`
- `expires_at: <date 1 month from now>`

✅ **Payment Check:**
```sql
SELECT status, plan_type, provider 
FROM payments 
WHERE user_id = 'user-id-here' 
ORDER BY created_at DESC 
LIMIT 1;
```
Should show:
- `status: 'PAID'`
- `plan_type: 'monthly'`
- `provider: 'dodo'`

✅ **Frontend Check:**
- Open browser console
- Check `userUsage` object
- Should show `premiumUser: true`
- Should show `subscriptionPlan: 'monthly'`
- Should allow unlimited messages

## Troubleshooting

### If premium doesn't unlock:

1. **Check webhook logs:**
   - Look for `[Dodo Webhook] ✅ User upgraded to premium`
   - Check for any errors

2. **Check database:**
   - Verify `premium_user = true` in users table
   - Verify `subscription_expiry` is in the future

3. **Check frontend:**
   - Refresh page (premium status is cached)
   - Check browser console for `userUsage` object
   - Verify `/api/user/usage` returns `premiumUser: true`

4. **Check webhook delivery:**
   - Go to Dodo Dashboard → Webhooks → Logs
   - Verify webhook was delivered successfully
   - Check for any delivery errors

## Key Points

- ✅ Webhook sets `premium_user: true` immediately
- ✅ Expiry is set to 1 month from payment
- ✅ `/api/user/usage` checks `premium_user` field
- ✅ Message quota allows unlimited for premium users
- ✅ Frontend respects premium status from API

---

**Status:** ✅ All systems configured for premium unlock after payment
