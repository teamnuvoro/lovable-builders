# Dodo Payments Migration Guide

**Date:** January 21, 2026  
**Status:** ✅ **COMPLETE** - Migrated from Cashfree to Dodo Payments

---

## What Changed

### ✅ **Backend Changes**

1. **Replaced Cashfree SDK with Dodo Payments SDK**
   - New service file: `server/services/dodo.ts`
   - Uses official `dodopayments` npm package
   - Follows Dodo error guide best practices

2. **Updated Payment Routes** (`server/routes/payment.ts`)
   - Replaced `createCashfreeOrder` with `createDodoCheckoutSession`
   - Updated webhook handler to use Dodo's `payment.succeeded` event
   - Changed database fields from `cashfree_order_id` to `dodo_order_id`

3. **Webhook Handler**
   - Uses `express.raw()` middleware (already configured)
   - Verifies webhook signature using Dodo SDK
   - Extracts `user_id` from `event.data.metadata.user_id` (source of truth)
   - Unlocks premium first, records payment second (idempotent)

### ✅ **Frontend Changes**

1. **PaywallSheet Component** (`client/src/components/paywall/PaywallSheet.tsx`)
   - Removed Cashfree SDK initialization
   - Uses simple redirect to `checkout_url` (no SDK needed)
   - Updated error messages

2. **Removed Cashfree SDK Script**
   - No longer needed in `index.html`

---

## Environment Variables

### Required Variables

Add to `.env`:

```env
# Dodo Payments Configuration
DODO_PAYMENTS_API_KEY=your_api_key_here
DODO_WEBHOOK_SECRET=your_webhook_secret_here
DODO_ENV=test_mode  # or 'live_mode' for production

# Product IDs (from Dodo dashboard)
DODO_PRODUCT_ID_DAILY=pdt_xxx  # Optional: specific product for daily plan
DODO_PRODUCT_ID_WEEKLY=pdt_xxx  # Optional: specific product for weekly plan

# Payment URLs (same as before)
BASE_URL=https://yourdomain.com
NGROK_URL=https://your-ngrok-url.ngrok.app  # For dev
PAYMENT_RETURN_URL=https://yourdomain.com/payment/return
DODO_WEBHOOK_URL=https://yourdomain.com/api/payment/webhook  # Optional, defaults to BASE_URL/webhook

# Enable payments in dev (optional)
ENABLE_PAYMENTS_IN_DEV=true
```

### Removed Variables

These are no longer needed:
- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`
- `CASHFREE_ENV`
- `CASHFREE_WEBHOOK_URL`
- `CASHFREE_STRICT_MODE`

---

## Database Schema Changes

### Required Migration

Update `subscriptions` table to support Dodo:

```sql
-- Add dodo_order_id column (if not exists)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS dodo_order_id TEXT;

-- Optional: Keep cashfree_order_id for backward compatibility
-- Or migrate existing data:
-- UPDATE subscriptions SET dodo_order_id = cashfree_order_id WHERE cashfree_order_id IS NOT NULL;
```

### Updated Fields

- `subscriptions.dodo_order_id` - Stores Dodo checkout session ID
- `payments.provider` - Should be set to `'dodo'` for new payments

---

## API Changes

### Create Order Endpoint

**Before (Cashfree):**
```json
POST /api/payment/create-order
Response: {
  "payment_session_id": "session_...",
  "order_id": "ORDER_...",
  "cf_order_id": "..."
}
```

**After (Dodo):**
```json
POST /api/payment/create-order
Response: {
  "checkout_url": "https://checkout.dodopayments.com/...",
  "checkout_session_id": "cs_...",
  "order_id": "ORDER_...",
  "session_id": "cs_..."  // For compatibility
}
```

### Webhook Endpoint

**Before (Cashfree):**
- Event type: `PAYMENT_SUCCESS_WEBHOOK`
- Looked up subscription by `cashfree_order_id`

**After (Dodo):**
- Event type: `payment.succeeded`
- Extracts `user_id` from `event.data.metadata.user_id` (source of truth)
- No database lookup needed

---

## Key Differences

### 1. **No SDK Required**
- Cashfree: Required SDK initialization and `checkout()` call
- Dodo: Simple redirect to `checkout_url`

### 2. **Customer Object**
- Cashfree: Required `customerName`, `customerEmail`, `customerPhone`
- Dodo: Only requires `email` and `name` (strict schema)

### 3. **Metadata**
- Cashfree: Flexible metadata format
- Dodo: **All values must be strings** (`String()` conversion required)

### 4. **Webhook Events**
- Cashfree: `PAYMENT_SUCCESS_WEBHOOK`
- Dodo: `payment.succeeded`

### 5. **User ID Source**
- Cashfree: Looked up from database using `order_id`
- Dodo: **Extracted directly from `metadata.user_id`** (source of truth)

---

## Testing Checklist

- [ ] Set `DODO_ENV=test_mode` in `.env`
- [ ] Set `DODO_PAYMENTS_API_KEY` (test key from Dodo dashboard)
- [ ] Set `DODO_WEBHOOK_SECRET` (from Dodo dashboard)
- [ ] Configure webhook URL in Dodo dashboard: `https://your-ngrok-url.ngrok.app/api/payment/webhook`
- [ ] Test checkout session creation
- [ ] Test payment flow end-to-end
- [ ] Verify webhook receives `payment.succeeded` event
- [ ] Verify `premium_user` is set to `true` after payment
- [ ] Test idempotency (send webhook twice)

---

## Common Issues & Solutions

### Issue: "customer: data did not match any variant"
**Solution:** Ensure customer object has ONLY `email` and `name` (no extra fields)

### Issue: "metadata.amount: expected string, found number"
**Solution:** Convert all metadata values to strings using `String()`

### Issue: "Invalid webhook signature"
**Solution:** Ensure `express.raw()` middleware is used for webhook route

### Issue: "Missing user_id in payment metadata"
**Solution:** Verify metadata is passed correctly when creating checkout session

---

## Rollback Plan

If you need to rollback to Cashfree:

1. Restore `server/routes/payment.ts` from git
2. Restore `client/src/components/paywall/PaywallSheet.tsx` from git
3. Restore Cashfree environment variables
4. Re-add Cashfree SDK script to `index.html`

---

## Next Steps

1. **Get Dodo Payments Credentials**
   - Sign up at Dodo Payments dashboard
   - Get API key and webhook secret
   - Create products for daily/weekly plans

2. **Configure Webhook**
   - Set webhook URL in Dodo dashboard
   - Use ngrok URL for development
   - Use production URL for production

3. **Test End-to-End**
   - Create checkout session
   - Complete test payment
   - Verify webhook processing
   - Verify premium unlock

---

**Migration Complete:** January 21, 2026
