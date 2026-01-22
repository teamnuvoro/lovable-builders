# Single Monthly Plan Update - ₹99/month

## Changes Made

### 1. Backend Configuration (`server/config.ts`)
- ✅ Changed from `daily: 100, weekly: 150` to `monthly: 99`
- ✅ Single plan configuration

### 2. Dodo Service (`server/services/dodo.ts`)
- ✅ Updated interface to use `planType: 'monthly'`
- ✅ Changed product ID lookup to use `DODO_PRODUCT_ID_MONTHLY`
- ✅ Removed daily/weekly product ID logic

### 3. Payment Routes (`server/routes/payment.ts`)
- ✅ Default plan type set to `'monthly'`
- ✅ Validation only accepts `'monthly'` plan
- ✅ Amount calculation uses `planConfig.plans.monthly`
- ✅ Subscription expiry set to 1 month (instead of 1 day or 7 days)
- ✅ Webhook handler updated for monthly plan

### 4. Frontend Paywall (`client/src/components/paywall/PaywallSheet.tsx`)
- ✅ Changed from two plans (daily/weekly) to single monthly plan
- ✅ Updated UI to show single premium card
- ✅ Removed plan selection logic
- ✅ Updated types to use `'monthly'` only

## Next Steps

### 1. Update Dodo Dashboard
Create a single product in Dodo Dashboard:
- **Name:** Monthly Premium Plan
- **Price:** ₹99
- **Currency:** INR
- **Mode:** Live Mode (for production)

### 2. Update `.env` File
Add the monthly product ID:
```env
DODO_PRODUCT_ID_MONTHLY=pdt_YOUR_MONTHLY_PRODUCT_ID
```

You can remove the old product IDs:
```env
# Remove these (no longer needed):
# DODO_PRODUCT_ID_DAILY=...
# DODO_PRODUCT_ID_WEEKLY=...
```

### 3. Restart Backend Server
After updating `.env`:
```bash
npm run dev:server
```

## Testing

1. Open paywall - should show single ₹99/month plan
2. Click "Get Premium" button
3. Should redirect to Dodo checkout
4. Complete payment
5. Verify premium unlocks for 1 month
6. Check database - subscription should have `plan_type: 'monthly'`

## Database Notes

Existing subscriptions with `plan_type: 'daily'` or `'weekly'` will still work (fallback logic handles them), but all new subscriptions will be `'monthly'`.

---

**Status:** ✅ Code updated - Ready for testing after updating Dodo Dashboard product and `.env` file.
