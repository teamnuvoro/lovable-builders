# Dodo Payments Credentials Setup

**Date:** January 21, 2026

---

## Your Credentials

### Test Mode Credentials:
- **Publishable Key:** `pk_snd_091bba0fefcd4852a44cccdcf47602b5`
- **API Key:** `EDZfBIxXGlBq22J8.S4GB2mVshV8X5z8sEIySXEuF0nhi_SEuFsdobt-DBK2doMJz`

---

## Add to `.env` File

Add these lines to your `.env` file:

```env
# Dodo Payments Configuration (Test Mode)
DODO_PAYMENTS_API_KEY=EDZfBIxXGlBq22J8.S4GB2mVshV8X5z8sEIySXEuF0nhi_SEuFsdobt-DBK2doMJz
DODO_PUBLISHABLE_KEY=pk_snd_091bba0fefcd4852a44cccdcf47602b5
DODO_ENV=test_mode

# Webhook Secret (from Dodo Dashboard → Webhooks)
DODO_WEBHOOK_SECRET=whsec_HA+86qoSDycamMmAduENxqFsSsd9q081

# Payment URLs (use your existing ngrok URL)
BASE_URL=https://prosurgical-nia-carpingly.ngrok-free.dev
NGROK_URL=https://prosurgical-nia-carpingly.ngrok-free.dev
PAYMENT_RETURN_URL=https://prosurgical-nia-carpingly.ngrok-free.dev/payment/return
DODO_WEBHOOK_URL=https://prosurgical-nia-carpingly.ngrok-free.dev/api/payment/webhook

# Enable payments in dev
ENABLE_PAYMENTS_IN_DEV=true
```

---

## Important Notes

1. **API Key vs Publishable Key:**
   - **API Key** (`DODO_PAYMENTS_API_KEY`): Used by backend to create checkout sessions
   - **Publishable Key** (`DODO_PUBLISHABLE_KEY`): Currently not used (Dodo uses redirect URLs, not SDK)
   - Keep both for future use if needed

2. **Webhook Secret:**
   - Get this from Dodo Dashboard → Webhooks section
   - Required for webhook signature verification
   - Add it to `DODO_WEBHOOK_SECRET` in `.env`

3. **Product IDs (REQUIRED):**
   - **You MUST create products in Dodo Dashboard first**
   - Go to Dodo Dashboard → Products section
   - Create two products:
     - Daily Plan (₹29)
     - Weekly Plan (₹49)
   - Copy the product IDs and add to `.env`:
     ```env
     DODO_PRODUCT_ID_DAILY=pdt_xxx  # Replace with your daily product ID
     DODO_PRODUCT_ID_WEEKLY=pdt_xxx  # Replace with your weekly product ID
     ```
   - **These are REQUIRED** - the code will fail without them
   - See `DODO_CREATE_PRODUCTS_GUIDE.md` for detailed instructions

---

## Next Steps

1. ✅ Add credentials to `.env` file (see below)
2. ✅ Webhook secret obtained: `whsec_HA+86qoSDycamMmAduENxqFsSsd9q081`
3. ✅ Webhook URL configured: `https://prosurgical-nia-carpingly.ngrok-free.dev/api/payment/webhook`
4. ✅ Events subscribed: `payment.succeeded`, `payment.failed`
5. ⏳ Restart backend server
6. ⏳ Test payment flow

---

## Testing

After adding credentials:

1. **Start backend:**
   ```bash
   npm run dev:server
   ```

2. **Check logs for:**
   ```
   [Dodo] Creating checkout session: ...
   [DODO][CHECKOUT] order_id=...
   ```

3. **Test payment:**
   - Open paywall
   - Select plan
   - Should redirect to Dodo checkout page

---

**Credentials Added:** January 21, 2026
