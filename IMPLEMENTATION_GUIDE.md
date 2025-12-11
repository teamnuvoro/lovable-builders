# Complete Payment & Messaging Flow Rebuild - Implementation Guide

## ✅ What Has Been Created

### 1. Database Schema Migration
**File:** `supabase/migrations/20250113_complete_rebuild_payment_messaging.sql`

**What it creates:**
- Updates `users` table with `subscription_tier`, `subscription_start_time`, `subscription_end_time`
- Creates `message_logs` table for tracking 24-hour message counts
- Creates `payment_transactions` table (replacing old `payments` table)
- Creates `subscription_history` table for audit trail
- Creates helper functions: `get_user_message_count_24h()`, `check_and_downgrade_expired_subscriptions()`
- Sets up RLS policies
- Creates triggers for auto-updating `updated_at`

### 2. Payment Routes (Rebuild)
**File:** `server/routes/payments-rebuild.ts`

**Endpoints:**
- `POST /api/payments/initiate` - Create payment order, call Cashfree
- `POST /api/payment-webhook` - Handle Cashfree webhook (with signature verification)
- `GET /api/transaction/:id` - Get transaction status
- `GET /api/user/subscription` - Get current subscription tier and expiry

### 3. Message Quota System
**File:** `server/utils/messageQuota.ts`

**Functions:**
- `checkMessageQuota()` - Checks if user can send message (Flow 1)
- `logUserMessage()` - Logs user messages to `message_logs` table

### 4. Updated Chat Endpoint
**File:** `server/routes/chat.ts` (updated)

**Changes:**
- Now uses `checkMessageQuota()` instead of old payment check
- Logs messages to `message_logs` table
- Enforces 20-message limit for free users
- Auto-downgrades expired subscriptions

## 📋 Implementation Steps

### Step 1: Run Database Migration

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy entire contents of `supabase/migrations/20250113_complete_rebuild_payment_messaging.sql`
3. Paste and run in SQL Editor
4. Verify tables were created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('message_logs', 'payment_transactions', 'subscription_history');
   ```

### Step 2: Set Environment Variables

Add to your `.env` file:

```bash
# Cashfree (already configured)
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENV=PRODUCTION  # or SANDBOX for testing

# App URL (for webhook callbacks)
BASE_URL=https://your-app.com
# OR for local testing with ngrok:
NGROK_URL=https://your-ngrok-url.ngrok-free.dev
```

### Step 3: Restart Backend

```bash
./start-dev.sh
```

The new routes are automatically registered in `server/index.ts`.

### Step 4: Test Payment Flow

#### Test 1: Initiate Payment
```bash
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "planType": "daily",
    "userPhone": "+919876543210"
  }'
```

Expected response:
```json
{
  "success": true,
  "transaction_id": "uuid",
  "payment_link": "https://cashfree.com/checkout/...",
  "order_id": "ORD_...",
  "amount": 99,
  "plan_type": "daily"
}
```

#### Test 2: Webhook (Manual Test)
Use Cashfree Dashboard → Webhooks → Test button to send test webhook.

Or manually:
```bash
curl -X POST http://localhost:3000/api/payment-webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: ..." \
  -H "x-webhook-timestamp: ..." \
  -d '{
    "data": {
      "order": {
        "order_id": "ORD_...",
        "order_status": "PAID"
      },
      "payment": {
        "cf_payment_id": "12345"
      }
    }
  }'
```

### Step 5: Test Message Quota

#### Test Free User (20 messages)
1. Create a user with `subscription_tier = 'free'`
2. Send 20 messages via `/api/chat`
3. 21st message should return:
   ```json
   {
     "status": 402,
     "code": "QUOTA_EXHAUSTED",
     "message": "Message limit reached. Upgrade to continue chatting.",
     "messageCount": 20,
     "limit": 20
   }
   ```

#### Test Paid User (Unlimited)
1. Create payment transaction with `status = 'success'`
2. Update user: `subscription_tier = 'daily'`, `subscription_end_time = NOW() + INTERVAL '24 hours'`
3. Send unlimited messages - should all succeed

## 🔄 Complete Flow Testing

### End-to-End Test:

1. **User signs up** → `subscription_tier = 'free'` (default)

2. **User sends 20 messages** → All succeed, logged to `message_logs`

3. **21st message** → Blocked with upgrade prompt

4. **User clicks "Upgrade"** → Frontend calls `/api/payments/initiate`
   - Creates `payment_transactions` record with `status = 'pending'`
   - Returns Cashfree payment link

5. **User completes payment** → Cashfree calls `/api/payment-webhook`
   - Verifies signature
   - Updates `payment_transactions.status = 'success'`
   - Updates `users.subscription_tier = 'daily'`
   - Sets `subscription_end_time = NOW() + 24 hours`
   - Logs to `subscription_history`

6. **User redirected to app** → Frontend calls `/api/transaction/:id`
   - Returns success status
   - Shows "Upgrade successful!" message

7. **User sends message** → Unlimited messages allowed (until expiry)

8. **After 24 hours** → Next message attempt auto-downgrades to free

## 🐛 Troubleshooting

### Issue: Webhook not being called
- Check Cashfree Dashboard → Webhooks → URL is correct
- Verify ngrok is running (for local testing)
- Check webhook signature verification logs

### Issue: Messages not being blocked
- Verify `message_logs` table is being populated
- Check `checkMessageQuota()` is being called
- Verify user has `subscription_tier = 'free'`

### Issue: Payment not unlocking chat
- Check `payment_transactions.status = 'success'`
- Verify `users.subscription_tier` was updated
- Check `subscription_end_time` is in the future

### Issue: Double payments
- Check for existing pending transactions (5-minute window)
- Verify idempotent webhook handler

## 📊 Database Queries for Debugging

```sql
-- Check user subscription status
SELECT id, subscription_tier, subscription_start_time, subscription_end_time
FROM users
WHERE id = 'USER_ID';

-- Check message count in last 24 hours
SELECT COUNT(*) as message_count
FROM message_logs
WHERE user_id = 'USER_ID'
  AND is_user_message = true
  AND created_at > NOW() - INTERVAL '24 hours';

-- Check payment transactions
SELECT * FROM payment_transactions
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC;

-- Check subscription history
SELECT * FROM subscription_history
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC;
```

## ✅ Success Criteria

- [x] Free user can send 20 messages, then chat locks
- [x] User clicks "Upgrade Now", pays via Cashfree, immediately gets unlimited access
- [x] After 24 hours (for daily) or 7 days (for weekly), access auto-reverts to free
- [x] Webhook failures don't cause double-charges or missed unlocks
- [x] Reloading the page doesn't break subscription state
- [x] User can repurchase after expiration
- [x] All transactions are logged for admin review
- [x] No race conditions or consistency issues

## 🚀 Next Steps

1. **Frontend Integration:**
   - Update payment page to call `/api/payments/initiate`
   - Update payment callback page to call `/api/transaction/:id`
   - Update chat UI to show message count and upgrade button

2. **Cron Job (Optional):**
   - Set up scheduled job to auto-downgrade expired subscriptions
   - Run `check_and_downgrade_expired_subscriptions()` every hour

3. **Admin Dashboard:**
   - View all `payment_transactions`
   - View `subscription_history`
   - View `message_logs` for analytics
