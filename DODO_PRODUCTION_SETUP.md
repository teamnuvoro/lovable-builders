# Dodo Payments - Production Setup Guide

**Status:** ✅ Test mode working  
**Next:** Switch to production/live mode

---

## Prerequisites Checklist

Before switching to production, ensure:

- [x] Test mode payment flow works end-to-end
- [x] Webhook receives and processes `payment.succeeded` events
- [x] Premium unlock works after payment
- [x] Database migration applied (`dodo_order_id` column exists)
- [ ] Production Dodo account approved
- [ ] Production API keys obtained from Dodo Dashboard
- [ ] Production webhook secret obtained
- [ ] Production products created in Dodo Dashboard
- [ ] Production domain configured (not ngrok)

---

## Step 1: Get Production Credentials from Dodo Dashboard

### 1.1 Login to Dodo Dashboard
- Go to: https://dashboard.dodopayments.com
- Switch to **Live Mode** (not Test Mode)

### 1.2 Get Production API Key
1. Navigate to **Settings** → **API Keys** (or **Developers** → **API Keys**)
2. Copy your **Live Mode API Key**
3. Format: Usually starts with `EDZf...` or similar

### 1.3 Get Production Webhook Secret
1. Navigate to **Settings** → **Webhooks**
2. Create or view your webhook endpoint
3. Copy the **Webhook Secret** (starts with `whsec_...`)
4. Ensure webhook URL points to your production domain (not ngrok)

### 1.4 Create Production Products
1. Navigate to **Products** section
2. Create two products:
   - **Daily Premium Plan** - Price: ₹29
   - **Weekly Premium Plan** - Price: ₹49
3. Copy the **Product IDs** (start with `pdt_...`)

---

## Step 2: Update Environment Variables

### 2.1 Update `.env` File

Replace test credentials with production credentials:

```env
# Dodo Payments Configuration (PRODUCTION)
DODO_PAYMENTS_API_KEY=YOUR_LIVE_API_KEY_HERE
DODO_PUBLISHABLE_KEY=YOUR_LIVE_PUBLISHABLE_KEY_HERE
DODO_ENV=live_mode  # ⚠️ CHANGE FROM test_mode TO live_mode
DODO_WEBHOOK_SECRET=YOUR_LIVE_WEBHOOK_SECRET_HERE

# Production Products (from Dodo Dashboard → Products)
DODO_PRODUCT_ID_DAILY=pdt_YOUR_LIVE_DAILY_PRODUCT_ID
DODO_PRODUCT_ID_WEEKLY=pdt_YOUR_LIVE_WEEKLY_PRODUCT_ID

# Production URLs (NO NGROK!)
BASE_URL=https://your-production-domain.com
NGROK_URL=  # Leave empty or remove in production
PAYMENT_RETURN_URL=https://your-production-domain.com/payment/return
DODO_WEBHOOK_URL=https://your-production-domain.com/api/payment/webhook
```

### 2.2 Critical Changes:
- ✅ `DODO_ENV=live_mode` (was `test_mode`)
- ✅ Use production API keys (not test keys)
- ✅ Use production webhook secret
- ✅ Use production domain URLs (remove ngrok)
- ✅ Use production product IDs

---

## Step 3: Verify Production Configuration

### 3.1 Check Production Safety Checks
The server has production safety checks that will:
- ✅ Verify BASE_URL is set and not ngrok
- ✅ Verify webhook URL is production domain
- ✅ Verify API keys are production keys

### 3.2 Test Production Setup (Optional - Use Test Payment)
1. Update `.env` with production credentials
2. Restart backend server
3. Try creating a payment order
4. Verify it redirects to Dodo **Live Mode** checkout (not Test Mode)
5. **DO NOT complete real payment** - just verify the flow

---

## Step 4: Deploy to Production

### 4.1 Update Production Environment Variables
If deploying to a platform (Vercel, Render, etc.):
- Add all Dodo production credentials to platform's environment variables
- Ensure `DODO_ENV=live_mode` is set
- Ensure production URLs are configured

### 4.2 Database Migration
Ensure the database migration has been run in production:
```sql
-- Run this in production Supabase SQL Editor
-- File: supabase/migrations/20250122_add_dodo_order_id.sql
```

---

## Step 5: Post-Launch Verification

### 5.1 Test Real Payment Flow
1. Create a test order with small amount
2. Complete payment
3. Verify webhook receives event
4. Verify premium unlocks
5. Verify subscription record created

### 5.2 Monitor Logs
Watch for:
- ✅ Successful checkout session creation
- ✅ Webhook events received
- ✅ Premium unlock successful
- ❌ Any errors or warnings

### 5.3 Check Dodo Dashboard
- View payments in Dodo Dashboard → Payments
- Verify webhook events in Dodo Dashboard → Webhooks → Logs
- Check for any failed webhook deliveries

---

## Important Notes

### ⚠️ Security
- **Never commit production credentials to git**
- Use environment variables only
- Keep production API keys secure
- Rotate keys if compromised

### ⚠️ Testing
- Test mode and live mode use **different accounts**
- Test payments in test mode first
- Verify webhook works before going live
- Test with small amounts first

### ⚠️ Webhooks
- Production webhooks must use HTTPS
- Webhook URL must be publicly accessible
- Webhook secret must match Dodo Dashboard
- Test webhook delivery in Dodo Dashboard

### ⚠️ Products
- Production products are separate from test products
- Product IDs are different in live mode
- Prices can be different (but should match your app)

---

## Rollback Plan

If something goes wrong:

1. **Immediate:** Set `DODO_ENV=test_mode` in `.env` and restart
2. **Check:** Dodo Dashboard → Payments for any issues
3. **Verify:** Webhook logs in Dodo Dashboard
4. **Fix:** Update configuration and retry

---

## Support

If you encounter issues:
1. Check Dodo Dashboard → Webhooks → Logs
2. Check backend server logs
3. Verify environment variables are set correctly
4. Ensure webhook URL is accessible
5. Contact Dodo Payments support if needed

---

**Ready to go live?** Follow the steps above and test thoroughly before processing real payments!
