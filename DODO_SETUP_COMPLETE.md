# Dodo Payments Setup - Complete Checklist

**Date:** January 22, 2026  
**Status:** ✅ **READY TO TEST**

---

## ✅ Completed Steps

### 1. Credentials Added to `.env`
- ✅ `DODO_PAYMENTS_API_KEY` - Configured
- ✅ `DODO_WEBHOOK_SECRET` - Configured
- ✅ `DODO_ENV=test_mode` - Configured
- ✅ `DODO_PRODUCT_ID_DAILY=pdt_0NWqC74RstuwjFqmtaXuM` - **Added**
- ✅ `DODO_PRODUCT_ID_WEEKLY=pdt_0NWqCOKnCmDnEvrpvpY1W` - **Added**

### 2. Code Implementation
- ✅ Dodo service created (`server/services/dodo.ts`)
- ✅ Payment routes updated (`server/routes/payment.ts`)
- ✅ Frontend updated (`client/src/components/paywall/PaywallSheet.tsx`)
- ✅ Webhook handler implemented
- ✅ Product ID validation added

### 3. Webhook Configuration
- ✅ Webhook URL: `https://prosurgical-nia-carpingly.ngrok-free.dev/api/payment/webhook`
- ✅ Events subscribed: `payment.succeeded`, `payment.failed`
- ✅ Webhook secret: `whsec_HA+86qoSDycamMmAduENxqFsSsd9q081`

---

## ⏳ Required: Database Migration

**You MUST run this SQL in Supabase before testing:**

### Open Supabase SQL Editor:
https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/sql/new

### Copy and Run This SQL:

```sql
-- Step 1: Make cashfree_order_id nullable (if it has NOT NULL constraint)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'cashfree_order_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE subscriptions 
        ALTER COLUMN cashfree_order_id DROP NOT NULL;
        
        RAISE NOTICE 'Made cashfree_order_id nullable';
    END IF;
END $$;

-- Step 2: Add dodo_order_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'dodo_order_id'
    ) THEN
        ALTER TABLE subscriptions 
        ADD COLUMN dodo_order_id TEXT;
        
        RAISE NOTICE 'Added dodo_order_id column to subscriptions table';
    ELSE
        RAISE NOTICE 'dodo_order_id column already exists in subscriptions table';
    END IF;
END $$;

-- Step 3: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_dodo_order_id 
ON subscriptions(dodo_order_id) 
WHERE dodo_order_id IS NOT NULL;
```

**Click "Run"** after pasting the SQL.

---

## 🧪 Testing Steps

### 1. Restart Backend Server
```bash
npm run dev:server
```

### 2. Test Payment Flow
1. Open the app
2. Trigger paywall (reach message limit or click "Try Premium")
3. Select a plan (Daily or Weekly)
4. Should redirect to Dodo checkout page
5. Complete test payment
6. Should redirect back to app
7. Premium should unlock automatically via webhook

### 3. Verify Premium Unlock
- Check user's `premium_user` status in database
- Check `subscriptions` table for new record
- Check `payments` table for payment record

---

## 📋 Current Configuration

### Environment Variables (All Set):
```env
# Dodo Payments
DODO_PAYMENTS_API_KEY=EDZfBIxXGlBq22J8.S4GB2mVshV8X5z8sEIySXEuF0nhi_SEuFsdobt-DBK2doMJz
DODO_PUBLISHABLE_KEY=pk_snd_091bba0fefcd4852a44cccdcf47602b5
DODO_ENV=test_mode
DODO_WEBHOOK_SECRET=whsec_HA+86qoSDycamMmAduENxqFsSsd9q081
DODO_PRODUCT_ID_DAILY=pdt_0NWqC74RstuwjFqmtaXuM
DODO_PRODUCT_ID_WEEKLY=pdt_0NWqCOKnCmDnEvrpvpY1W

# URLs
BASE_URL=https://prosurgical-nia-carpingly.ngrok-free.dev
NGROK_URL=https://prosurgical-nia-carpingly.ngrok-free.dev
PAYMENT_RETURN_URL=https://prosurgical-nia-carpingly.ngrok-free.dev/payment/return
DODO_WEBHOOK_URL=https://prosurgical-nia-carpingly.ngrok-free.dev/api/payment/webhook

# Enable payments
ENABLE_PAYMENTS_IN_DEV=true
```

---

## 🐛 Troubleshooting

### If payment creation fails:
- Check backend logs for Dodo API errors
- Verify product IDs are correct in `.env`
- Ensure API key is correct

### If webhook doesn't fire:
- Check Dodo Dashboard → Webhooks → Logs
- Verify webhook URL is accessible (ngrok must be running)
- Check webhook secret matches

### If premium doesn't unlock:
- Check webhook logs in backend
- Verify `metadata.user_id` is being extracted correctly
- Check database for subscription/payment records

---

## ✅ Ready to Test!

After running the database migration, you're all set. The payment flow should work end-to-end.

**Next:** Run the SQL migration, restart backend, and test!
