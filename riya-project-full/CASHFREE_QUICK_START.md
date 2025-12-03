# 🚀 Cashfree Payment - Quick Start

## ✅ What's Been Integrated:

1. ✅ Payment routes created (`server/routes/payment.ts`)
2. ✅ Cashfree SDK integration (`server/cashfree.ts`)
3. ✅ Order creation API
4. ✅ Payment verification API
5. ✅ Webhook handling
6. ✅ Premium user upgrade logic
7. ✅ Frontend paywall component (already exists)
8. ✅ Cashfree SDK loaded in HTML

---

## 🎯 Setup in 3 Steps:

### Step 1: Get Cashfree Credentials (2 minutes)

1. Go to: https://www.cashfree.com/
2. Sign up (free)
3. Login to dashboard: https://merchant.cashfree.com/
4. Go to: **Developers** → **API Keys**
5. Copy:
   - **App ID** (starts with `TEST...`)
   - **Secret Key**

### Step 2: Add to .env (1 minute)

```env
# Cashfree Payment Gateway
CASHFREE_APP_ID=TEST_your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_MODE=sandbox
CASHFREE_ENV=TEST
VITE_CASHFREE_MODE=sandbox
```

### Step 3: Create Database Table (1 minute)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **SQL Editor**
4. Copy contents of `supabase-subscriptions-table.sql`
5. Paste and click **RUN**
6. Table created! ✅

### Step 4: Restart Server

```bash
Ctrl+C
npm run dev
```

---

## 🧪 Test Payment (Sandbox Mode):

1. **Go to chat:** `localhost:3000/chat`
2. **Send 100+ messages** (to hit free limit)
3. **Paywall appears** with plans:
   - Daily Pass: ₹19
   - Weekly Pass: ₹49
4. **Click a plan**
5. **Cashfree checkout opens**
6. **Use test card:**
   ```
   Card: 4111 1111 1111 1111
   CVV: 123
   Expiry: 12/25
   OTP: 123456
   ```
7. **Complete payment**
8. **✅ You're now premium!**
9. **Send unlimited messages!**

---

## 📊 What Happens:

### When User Pays:
1. Order created in Cashfree
2. Order saved in Supabase `subscriptions` table
3. User completes payment
4. Payment verified with Cashfree API
5. Subscription status → `active`
6. User `premium_user` → `true`
7. User gets unlimited access!

### Database Updates:
```sql
-- subscriptions table
INSERT INTO subscriptions (
  user_id, plan_type, amount, 
  cashfree_order_id, status
) VALUES (
  'user-uuid', 'daily', 19,
  'order_123', 'pending'
);

-- After payment
UPDATE subscriptions 
SET status = 'active', cashfree_payment_id = 'cf_123'
WHERE cashfree_order_id = 'order_123';

-- users table
UPDATE users 
SET premium_user = true
WHERE id = 'user-uuid';
```

---

## ✅ Files Created/Updated:

### Backend:
- ✅ `server/routes/payment.ts` (NEW - payment APIs)
- ✅ `server/cashfree.ts` (updated - webhook verification)
- ✅ `server/index.ts` (updated - payment routes registered)

### Database:
- ✅ `supabase-subscriptions-table.sql` (NEW - table schema)

### Documentation:
- ✅ `CASHFREE_SETUP.md` (NEW - complete guide)
- ✅ `CASHFREE_QUICK_START.md` (THIS FILE - quick reference)

---

## 🎯 Current Status:

### ✅ Ready to Use:
- Payment API endpoints
- Order creation
- Payment verification
- Webhook handling
- Premium upgrades
- Database integration

### 🔧 Needs Configuration:
- Cashfree credentials (get from dashboard)
- Subscriptions table (run SQL script)

---

## 🚀 Next Steps:

1. **Get Cashfree credentials** (2 min)
2. **Add to .env** (1 min)
3. **Create subscriptions table** (1 min)
4. **Restart server**
5. **Test payment** (2 min)
6. **Done!** 🎉

---

## 💡 Pro Tips:

### For Testing:
- Use sandbox mode
- Use test cards
- Check Cashfree dashboard for orders
- Check Supabase for subscription records

### For Production:
- Change `CASHFREE_MODE=production`
- Use production credentials
- Set up webhook with ngrok/public URL
- Test thoroughly before launch

---

**Add Cashfree credentials and you're ready to accept payments!** 💳✨
