# Payment Validation Flow

## Overview
When Cashfree API approves a payment, the system automatically:
1. Updates `payments` table with `status='success'`
2. This triggers automatic chat access (payment-based access system)

## Flow Diagram

```
User Completes Payment
        ↓
Cashfree API Approves
        ↓
Frontend: PaymentCallback.tsx calls /api/payment/verify
        ↓
Backend: server/routes/payment.ts
        ↓
1. Check Cashfree API for payment status
2. If status = 'PAID' or 'ACTIVE' or 'SUCCESS':
   ├─ Update subscriptions.status = 'active'
   ├─ Update payments.status = 'success' ✅ (THIS GRANTS ACCESS)
   └─ Update users.premium_user = true (for UI display only)
        ↓
Database Trigger (optional):
   └─ trigger_upgrade_on_payment_success() fires
        ↓
Chat Access Automatically Enabled
   └─ checkUserHasPayment() finds payments.status='success'
```

## Key Code Locations

### 1. Payment Verification Endpoint
**File:** `server/routes/payment.ts` (line ~297-510)

**What it does:**
- Receives `orderId` from frontend
- Calls Cashfree API to verify payment status
- If payment is successful:
  - Updates `payments` table: `status = 'success'`
  - Updates `subscriptions` table: `status = 'active'`
  - Updates `users` table: `premium_user = true` (for UI only)

**Critical Code:**
```typescript
// Line ~467-484
if (isPaid || isAlreadyActive) {
  // Update or insert payment with status='success'
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, status')
    .eq('cashfree_order_id', orderId)
    .single();

  if (existingPayment) {
    // UPDATE existing payment to 'success'
    await supabase
      .from('payments')
      .update({
        status: 'success',
        cashfree_payment_id: paymentData.cf_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('cashfree_order_id', orderId);
  } else {
    // INSERT new payment with status='success'
    await supabase.from('payments').insert({
      user_id: subscription.user_id,
      cashfree_order_id: orderId,
      status: 'success',  // ✅ THIS IS THE KEY
      plan_type: subscription.plan_type,
      // ... other fields
    });
  }
}
```

### 2. Chat Access Check
**File:** `server/utils/checkUserHasPayment.ts`

**What it does:**
- Checks if user has any `payments` record with `status='success'`
- Returns `hasPayment: true` if found
- This grants chat access

**Code:**
```typescript
const { data: payments } = await supabase
  .from('payments')
  .select('plan_type, created_at, status')
  .eq('user_id', userId)
  .eq('status', 'success')  // ✅ Only successful payments
  .order('created_at', { ascending: false })
  .limit(1);

return { hasPayment: payments && payments.length > 0 };
```

### 3. Chat Route Paywall
**File:** `server/routes/chat.ts` (line ~380-420)

**What it does:**
- Before allowing chat, checks `checkUserHasPayment()`
- If no successful payment → block chat (20 message limit)
- If has successful payment → allow unlimited chats

## Webhook Support (Optional)

Cashfree can also send webhooks when payment status changes.

**File:** `server/routes/payment.ts` (line ~512+)

**Endpoint:** `POST /api/payment/webhook`

**What it does:**
- Receives payment status updates from Cashfree
- Updates `payments` table automatically
- No need for frontend to call `/api/payment/verify`

## Testing the Flow

### 1. Create Test Payment
```sql
-- In Supabase SQL Editor
INSERT INTO payments (
  user_id,
  cashfree_order_id,
  amount,
  status,
  plan_type
) VALUES (
  'USER_ID_HERE',
  'TEST_ORDER_123',
  99.00,
  'success',  -- ✅ This grants access
  'daily'
);
```

### 2. Verify Chat Access
- User should immediately have access to chats
- No need to refresh or logout/login
- System checks `payments.status='success'` in real-time

### 3. Test Payment Verification
```bash
# Test the verify endpoint
curl -X POST http://localhost:3000/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_ID", "userId": "USER_ID"}'
```

## SQL to Set All Users Free

Run this in **Supabase SQL Editor**:

```sql
-- Set all users to free plan
UPDATE users
SET 
  premium_user = false,
  subscription_plan = null,
  subscription_expiry = null,
  updated_at = NOW()
WHERE id IS NOT NULL;

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
```

Or use the migration file:
- `supabase/migrations/20250113_set_all_users_free_forever.sql`

## Important Notes

1. **`payments.status='success'` is the source of truth** for chat access
2. **`users.premium_user` is only for UI display** - not used for access control
3. **Payment verification automatically updates** `payments` table when Cashfree confirms payment
4. **Chat access is checked in real-time** - no caching, always queries `payments` table

## Troubleshooting

### Payment approved but chat still locked
1. Check `payments` table:
   ```sql
   SELECT * FROM payments 
   WHERE user_id = 'USER_ID' 
   AND status = 'success';
   ```
2. If no record, payment verification didn't run
3. Manually update:
   ```sql
   UPDATE payments 
   SET status = 'success' 
   WHERE cashfree_order_id = 'ORDER_ID';
   ```

### Payment verification not updating
1. Check backend logs for errors
2. Verify Cashfree API response
3. Check if `isPaid` is true in code
4. Verify `payments` table has correct structure

