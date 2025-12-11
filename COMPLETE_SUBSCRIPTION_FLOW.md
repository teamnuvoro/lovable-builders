# Complete Subscription Flow Implementation

## Overview

This document describes the complete subscription flow with:
- **20 free messages** for all users
- **Automatic lockout** when limit is reached
- **Automatic unlock** after payment
- **Time-based expiry** (24 hours for daily, 7 days for weekly)
- **Automatic downgrade** when subscription expires

## Flow Diagram

```
User Starts Chat
    ↓
Free User: 20 messages allowed
    ↓
After 20 messages → PAYWALL (Locked)
    ↓
User Clicks "Upgrade" → Payment Flow
    ↓
Payment Success → User Upgraded Automatically
    ↓
Chat Unlocks Immediately
    ↓
Daily Pass: Valid for 24 hours
Weekly Pass: Valid for 7 days
    ↓
After Expiry → Auto-downgrade to Free
    ↓
Back to 20 free messages
```

## Database Schema

### Users Table
- `premium_user` (boolean) - Premium status flag
- `subscription_plan` (text) - 'daily' or 'weekly'
- `subscription_expiry` (timestamptz) - When subscription expires

### Subscriptions Table
- `status` - 'pending', 'active', 'expired', 'cancelled'
- `plan_type` - 'daily' or 'weekly'
- `expires_at` - Expiry timestamp
- `started_at` - When subscription started

### Usage Stats Table
- `total_messages` - Total messages sent (resets daily for free users)
- `last_daily_reset` - Last reset timestamp

## Implementation Details

### 1. Message Limit Check (Chat Endpoint)

**Location:** `server/routes/chat.ts`

```typescript
// Check message count
messageCount = await getUserMessageCount(userId);

// Check premium status with expiry
const { data: latestUser } = await supabase
  .from('users')
  .select('premium_user, subscription_expiry')
  .eq('id', userId)
  .single();

// Auto-downgrade if expired
if (expiry && expiry < now) {
  await supabase.from('users').update({
    premium_user: false,
    subscription_expiry: null
  });
}

// Block if not premium and limit reached
if (!isPremium && messageCount >= 20) {
  return res.status(402).json({ code: "QUOTA_EXHAUSTED" });
}
```

### 2. Payment Success → Auto Unlock

**Location:** `server/routes/payment.ts`

When payment is verified:
1. Subscription status → 'active'
2. User `premium_user` → true
3. `subscription_expiry` → calculated (24h or 7 days)
4. Database triggers fire → user upgraded
5. Chat unlocks immediately

### 3. Expiry Handling

**Automatic Checks:**
- On every chat request
- On every `/api/user/usage` call
- Via Supabase scheduled function (hourly)

**When Expired:**
- `premium_user` → false
- `subscription_plan` → null
- `subscription_expiry` → null
- Subscription `status` → 'expired'
- User back to 20 free messages

## Supabase Functions

### 1. `check_and_downgrade_expired_subscriptions()`
- Runs hourly (via pg_cron)
- Finds all expired subscriptions
- Downgrades users automatically

### 2. `can_user_send_message(user_id)`
- Checks if user can send message
- Returns: `{ can_send: boolean, message_count: number, limit: 20 }`

### 3. `get_user_message_count(user_id)`
- Returns current message count
- Returns 999999 for premium users

## Testing the Flow

### Step 1: Set User to Free
```bash
npx tsx scripts/set-user-to-free.ts
```

### Step 2: Send 20 Messages
- User can send 20 messages
- After 20th message → Paywall appears

### Step 3: Make Payment
- Click "Upgrade"
- Select plan (Daily or Weekly)
- Payment succeeds (mock mode)
- Chat unlocks immediately

### Step 4: Verify Unlock
- User can send unlimited messages
- Check premium status in UI

### Step 5: Test Expiry (Optional)
- Manually set `subscription_expiry` to past date
- Try sending message → Should auto-downgrade
- User back to 20 free messages

## Migration

Run the migration to set up all functions:

```sql
-- Run in Supabase SQL Editor
\i supabase/migrations/20250113_complete_subscription_flow.sql
```

Or apply manually via Supabase Dashboard.

## Key Features

✅ **20 Free Messages** - All users get 20 free messages
✅ **Automatic Lockout** - Chat locked after 20 messages
✅ **Payment Unlock** - Chat unlocks immediately after payment
✅ **Time-Based Expiry** - Daily (24h) or Weekly (7 days)
✅ **Auto-Downgrade** - User downgraded when subscription expires
✅ **Supabase Scheduling** - Automatic expiry checks via database

## Next Steps

1. Run the migration: `supabase/migrations/20250113_complete_subscription_flow.sql`
2. Test the flow end-to-end
3. Monitor expiry handling
4. Set up pg_cron for hourly expiry checks (optional)

