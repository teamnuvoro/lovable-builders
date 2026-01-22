# Switch Dodo Payments to Production/Live Mode

**Current Status:** ✅ Test mode working  
**Goal:** Switch to production/live mode

---

## Quick Checklist

- [ ] Get production API key from Dodo Dashboard
- [ ] Get production webhook secret from Dodo Dashboard  
- [ ] Create production products in Dodo Dashboard (get product IDs)
- [ ] Update `.env` file with production credentials
- [ ] Change `DODO_ENV=live_mode` in `.env`
- [ ] Update webhook URL to production domain (remove ngrok)
- [ ] Update BASE_URL to production domain
- [ ] Restart backend server
- [ ] Test payment flow in production
- [ ] Verify webhook receives events
- [ ] Monitor first few real payments

---

## Step-by-Step Guide

### Step 1: Get Production Credentials from Dodo Dashboard

1. **Login to Dodo Dashboard:**
   - Go to: https://dashboard.dodopayments.com
   - Make sure you're in **Live Mode** (not Test Mode)
   - Look for a toggle or switch at the top

2. **Get Production API Key:**
   - Navigate to **Settings** → **API Keys** (or **Developers** → **API Keys**)
   - Find your **Live Mode API Key**
   - Copy it (format: usually starts with letters/numbers)

3. **Get Production Webhook Secret:**
   - Navigate to **Settings** → **Webhooks**
   - View or create your webhook endpoint
   - Copy the **Webhook Secret** (starts with `whsec_...`)
   - **Important:** Update webhook URL to your production domain:
     ```
     https://your-production-domain.com/api/payment/webhook
     ```
     (NOT ngrok URL)

4. **Create Production Products:**
   - Navigate to **Products** section
   - Create two products:
     - **Daily Premium Plan** - Price: ₹29
     - **Weekly Premium Plan** - Price: ₹49
   - Copy the **Product IDs** (start with `pdt_...`)
   - **Note:** These are different from test mode product IDs

---

### Step 2: Update `.env` File

Open your `.env` file and update these values:

```env
# ============================================
# DODO PAYMENTS - PRODUCTION CONFIGURATION
# ============================================

# Change this from test_mode to live_mode
DODO_ENV=live_mode

# Replace with your PRODUCTION API key (from Dodo Dashboard → Live Mode)
DODO_PAYMENTS_API_KEY=YOUR_LIVE_API_KEY_HERE

# Replace with your PRODUCTION publishable key (if needed)
DODO_PUBLISHABLE_KEY=YOUR_LIVE_PUBLISHABLE_KEY_HERE

# Replace with your PRODUCTION webhook secret
DODO_WEBHOOK_SECRET=YOUR_LIVE_WEBHOOK_SECRET_HERE

# Replace with your PRODUCTION product IDs (from Dodo Dashboard → Products → Live Mode)
DODO_PRODUCT_ID_DAILY=pdt_YOUR_LIVE_DAILY_PRODUCT_ID
DODO_PRODUCT_ID_WEEKLY=pdt_YOUR_LIVE_WEEKLY_PRODUCT_ID

# ============================================
# PRODUCTION URLs (NO NGROK!)
# ============================================

# Your production domain (e.g., https://yourapp.com)
BASE_URL=https://your-production-domain.com

# Remove or leave empty in production
NGROK_URL=

# Production payment return URL
PAYMENT_RETURN_URL=https://your-production-domain.com/payment/return

# Production webhook URL
DODO_WEBHOOK_URL=https://your-production-domain.com/api/payment/webhook
```

**Critical Changes:**
- ✅ `DODO_ENV=live_mode` (was `test_mode`)
- ✅ Use **production** API keys (not test keys)
- ✅ Use **production** webhook secret
- ✅ Use **production** product IDs
- ✅ Use **production** domain URLs (remove ngrok)

---

### Step 3: Verify Production Domain

Make sure you have:
- ✅ Production domain configured (e.g., `yourapp.com`)
- ✅ HTTPS enabled (required for webhooks)
- ✅ Webhook endpoint accessible: `https://your-domain.com/api/payment/webhook`
- ✅ Return URL accessible: `https://your-domain.com/payment/return`

**If you don't have a production domain yet:**
- You can still test with ngrok, but set `DODO_ENV=live_mode`
- **Warning:** Real payments will be processed even with ngrok
- Better to use a proper production domain

---

### Step 4: Restart Backend Server

After updating `.env`:

1. **Stop the current server** (Ctrl+C)
2. **Restart the server:**
   ```bash
   npm run dev:server
   ```

3. **Check logs** - you should see:
   ```
   🔑 [Payment] Using Dodo live_mode
   ```

---

### Step 5: Test Production Flow

**⚠️ IMPORTANT:** In live mode, payments are REAL. Test carefully!

1. **Create a test order:**
   - Open your app
   - Trigger paywall
   - Select a plan
   - Should redirect to Dodo checkout

2. **Verify it's Live Mode:**
   - Checkout page should NOT show "Test Mode" badge
   - URL should be production Dodo domain

3. **Test with small amount:**
   - Use test card or small real payment
   - Complete payment
   - Verify redirect back to app

4. **Check webhook:**
   - Check backend logs for webhook events
   - Verify premium unlocks
   - Check Dodo Dashboard → Webhooks → Logs

---

### Step 6: Monitor First Payments

After going live:

1. **Watch Dodo Dashboard:**
   - View payments in **Payments** section
   - Check webhook delivery in **Webhooks** → **Logs**
   - Monitor for any errors

2. **Check Backend Logs:**
   - Look for successful checkout sessions
   - Verify webhook events received
   - Check for any errors

3. **Verify Database:**
   - Check `subscriptions` table for new records
   - Verify `dodo_order_id` is populated
   - Check `payments` table for payment records

---

## Important Warnings

### ⚠️ Real Money
- **Live mode processes REAL payments**
- Test thoroughly before going live
- Start with small amounts
- Monitor first few payments closely

### ⚠️ Webhooks
- Production webhooks must use HTTPS
- Webhook URL must be publicly accessible
- Webhook secret must match Dodo Dashboard
- Test webhook delivery before going live

### ⚠️ Products
- Production products are separate from test products
- Product IDs are different in live mode
- Prices should match your app configuration

### ⚠️ Security
- Never commit production credentials to git
- Keep production API keys secure
- Rotate keys if compromised
- Use environment variables only

---

## Rollback Plan

If something goes wrong:

1. **Immediate:** Change `DODO_ENV=test_mode` in `.env` and restart
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

## Next Steps

1. ✅ Get production credentials from Dodo Dashboard
2. ✅ Update `.env` file with production values
3. ✅ Change `DODO_ENV=live_mode`
4. ✅ Restart backend server
5. ✅ Test payment flow
6. ✅ Monitor first payments

**Ready?** Follow the steps above and you'll be live! 🚀
