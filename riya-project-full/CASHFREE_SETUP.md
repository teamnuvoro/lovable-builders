# 💳 Cashfree Payment Gateway Setup

## Complete Integration Guide

Your app now has **full Cashfree payment integration** for premium subscriptions!

---

## 🎯 What's Integrated:

### Features:
✅ **Payment Plans:**
   - Daily Pass: ₹19 (20 messages)
   - Weekly Pass: ₹49 (200 messages)

✅ **Payment Flow:**
   1. User hits message/call limit
   2. Paywall popup appears
   3. User selects plan
   4. Cashfree checkout opens
   5. User completes payment
   6. Webhook updates user to premium
   7. User gets unlimited access

✅ **Backend Integration:**
   - Order creation API
   - Payment verification API
   - Webhook handling
   - Database updates
   - Premium status activation

✅ **Frontend Integration:**
   - Paywall sheet component
   - Cashfree SDK loaded
   - Payment callback page
   - Error handling

---

## 🚀 Quick Setup (5 Minutes):

### Step 1: Get Cashfree Credentials

1. **Sign up at Cashfree:**
   - Go to: https://www.cashfree.com/
   - Click "Sign Up" (free account)
   - Complete registration

2. **Get Test Credentials:**
   - Go to: https://merchant.cashfree.com/merchants/login
   - Login to dashboard
   - Go to: **Developers** → **API Keys**
   - Copy:
     - **App ID** (starts with `TEST...` for sandbox)
     - **Secret Key**

### Step 2: Add to .env File

Add these lines to your `.env` file:

```env
# Cashfree Payment Gateway
CASHFREE_APP_ID=TEST_your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_MODE=sandbox
CASHFREE_ENV=TEST

# Frontend Cashfree Mode
VITE_CASHFREE_MODE=sandbox
```

### Step 3: Restart Server

```bash
Ctrl+C
npm run dev
```

### Step 4: Test Payment

1. Go to chat: `localhost:3000/chat`
2. Send 100+ messages (to hit limit)
3. Paywall popup appears
4. Click "Daily Pass" or "Weekly Pass"
5. Cashfree checkout opens
6. Use test card: **4111 1111 1111 1111**
7. CVV: **123**, Expiry: Any future date
8. Complete payment
9. ✅ User upgraded to premium!

---

## 🧪 Test Cards (Sandbox Mode):

### Success:
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
OTP: 123456
```

### Failure (for testing):
```
Card: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
```

---

## 📋 API Endpoints:

### 1. Get Payment Config
```http
GET /api/payment/config
```

Response:
```json
{
  "cashfreeMode": "sandbox",
  "currency": "INR",
  "plans": {
    "daily": 19,
    "weekly": 49
  }
}
```

### 2. Create Payment Order
```http
POST /api/payment/create-order
Content-Type: application/json

{
  "planType": "daily"
}
```

Response:
```json
{
  "orderId": "order_1234567890_abcd1234",
  "paymentSessionId": "session_xyz...",
  "amount": 19,
  "currency": "INR",
  "planType": "daily"
}
```

### 3. Verify Payment
```http
POST /api/payment/verify
Content-Type: application/json

{
  "orderId": "order_1234567890_abcd1234"
}
```

Response:
```json
{
  "success": true,
  "status": "PAID",
  "orderId": "order_1234567890_abcd1234",
  "message": "Payment successful! You are now a premium user."
}
```

### 4. Webhook (Cashfree calls this)
```http
POST /api/payment/webhook
```

---

## 🗄️ Database Tables:

### subscriptions table:
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_type TEXT,
  amount DECIMAL,
  currency TEXT,
  cashfree_order_id TEXT UNIQUE,
  cashfree_payment_id TEXT,
  status TEXT,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

Run this in Supabase SQL Editor if table doesn't exist!

---

## 🔄 Payment Flow:

```
User hits limit
    ↓
Paywall popup opens
    ↓
User selects plan (Daily/Weekly)
    ↓
Frontend: POST /api/payment/create-order
    ↓
Backend: Creates order in Cashfree
    ↓
Backend: Stores order in Supabase (status: pending)
    ↓
Backend: Returns paymentSessionId
    ↓
Frontend: Opens Cashfree checkout
    ↓
User completes payment
    ↓
Cashfree: Redirects to /payment/callback
    ↓
Frontend: POST /api/payment/verify
    ↓
Backend: Checks payment status with Cashfree
    ↓
Backend: Updates subscription (status: active)
    ↓
Backend: Updates user (premium_user: true)
    ↓
Frontend: Shows success message
    ↓
User redirected to chat with premium access!
```

---

## 🔐 Webhook Setup (Optional but Recommended):

### For Production:

1. **Get ngrok** (for local testing):
```bash
brew install ngrok
ngrok http 3000
```

2. **Copy ngrok URL:**
```
https://abc123.ngrok.io
```

3. **Add to .env:**
```env
CASHFREE_WEBHOOK_URL=https://abc123.ngrok.io/api/payment/webhook
```

4. **Configure in Cashfree Dashboard:**
   - Go to: Developers → Webhooks
   - Add webhook URL: `https://abc123.ngrok.io/api/payment/webhook`
   - Select events: `PAYMENT_SUCCESS_WEBHOOK`

---

## 🐛 Troubleshooting:

### "Payment service not configured"
**Solution:** Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to .env

### "Authentication failed"
**Solution:** 
- Verify credentials are correct
- Check you're using TEST credentials for sandbox mode
- Regenerate keys in Cashfree dashboard

### "Failed to create payment session"
**Solution:**
- Check Cashfree dashboard is accessible
- Verify API keys are active
- Check network connection

### Payment succeeds but user not upgraded
**Solution:**
- Check webhook is configured
- Check Supabase connection
- Look for errors in server logs

---

## 💰 Pricing:

### Cashfree Fees:
- **Domestic Cards:** 2% + GST
- **UPI:** 0.5% + GST
- **Wallets:** 2% + GST

### Example:
- Daily Pass (₹19): Fee ~₹0.50
- Weekly Pass (₹49): Fee ~₹1.30

---

## 📊 Testing Checklist:

- [ ] Added Cashfree credentials to .env
- [ ] Restarted server
- [ ] Paywall appears when limit reached
- [ ] Can select Daily/Weekly plan
- [ ] Cashfree checkout opens
- [ ] Test payment with 4111 1111 1111 1111
- [ ] Payment succeeds
- [ ] User upgraded to premium
- [ ] Can send unlimited messages
- [ ] Subscription saved in Supabase

---

## 🎉 You're Ready!

Your payment system is fully integrated and ready to use!

**Test it now:**
1. Add Cashfree credentials to .env
2. Restart server
3. Test payment flow
4. Start earning! 💰

---

## 📞 Support:

**Need help?**
- Check server logs for errors
- Verify Cashfree dashboard
- Test with sandbox cards first
- Check Supabase subscriptions table

**Cashfree Docs:**
- https://docs.cashfree.com/docs/payment-gateway
- https://docs.cashfree.com/docs/test-cards

---

**Add your Cashfree credentials and start accepting payments!** 🚀💳

