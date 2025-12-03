# 💳 START ACCEPTING PAYMENTS NOW!

## ✅ Cashfree is FULLY INTEGRATED!

Everything is ready. You just need to add your credentials!

---

## 🚀 DO THESE 3 THINGS:

### 1. GET CASHFREE TEST CREDENTIALS (2 minutes)

**Go to:** https://www.cashfree.com/
**Sign up** for free account
**Login to:** https://merchant.cashfree.com/merchants/login
**Navigate to:** Developers → API Keys
**Copy these 2 things:**
   - App ID (looks like: TEST_123abc...)
   - Secret Key (long string)

---

### 2. ADD TO YOUR .ENV FILE (1 minute)

**Open:** `/Users/joshuavaz/Documents/project1/riya-project-full/.env`

**Add these lines:**
```
CASHFREE_APP_ID=TEST_paste_your_app_id_here
CASHFREE_SECRET_KEY=paste_your_secret_key_here
CASHFREE_MODE=sandbox
CASHFREE_ENV=TEST
VITE_CASHFREE_MODE=sandbox
```

**Save the file!**

---

### 3. CREATE SUBSCRIPTIONS TABLE IN SUPABASE (1 minute)

**Go to:** https://supabase.com/dashboard
**Select** your project (xgraxcgavqeyqfwimbwt)
**Click:** SQL Editor (left sidebar)
**Copy this SQL:**

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('daily', 'weekly')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  cashfree_order_id TEXT UNIQUE NOT NULL,
  cashfree_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_order ON subscriptions(cashfree_order_id);
```

**Paste in SQL Editor**
**Click RUN**
**Done!** ✅

---

## 🔄 RESTART SERVER:

```bash
Ctrl+C
npm run dev
```

---

## 🧪 TEST PAYMENT:

1. **Go to chat:** localhost:3000/chat
2. **Send 100 messages** (to hit free limit)
3. **Paywall popup appears**
4. **Click "Daily Pass" (₹19)**
5. **Cashfree checkout opens**
6. **Use TEST CARD:**
   ```
   Card Number: 4111 1111 1111 1111
   CVV: 123
   Expiry: 12/25
   OTP: 123456
   ```
7. **Click Pay**
8. **✅ PAYMENT SUCCESS!**
9. **You're now PREMIUM!**
10. **Send unlimited messages!**

---

## 📊 WHAT HAPPENS:

```
User sends 100 messages
    ↓
Paywall appears
    ↓
User selects Daily/Weekly plan
    ↓
Cashfree checkout opens
    ↓
User enters test card
    ↓
Payment succeeds
    ↓
User upgraded to PREMIUM ✅
    ↓
Unlimited messages!
```

---

## ✅ FILES ALREADY CREATED:

1. ✅ `server/routes/payment.ts` - Payment APIs
2. ✅ `server/cashfree.ts` - Cashfree integration  
3. ✅ `server/index.ts` - Routes registered
4. ✅ `client/index.html` - Cashfree SDK loaded
5. ✅ `client/src/components/paywall/PaywallSheet.tsx` - UI
6. ✅ `supabase-subscriptions-table.sql` - Database schema

---

## 🎯 CHECKLIST:

- [ ] Get Cashfree App ID and Secret Key
- [ ] Add to .env file
- [ ] Create subscriptions table in Supabase
- [ ] Restart server
- [ ] Test with test card
- [ ] ✅ Start accepting payments!

---

## 🔥 THAT'S IT!

Just 3 steps and you're accepting payments!

**Get Cashfree credentials now:** https://www.cashfree.com/

---

## 💰 PRICING:

**Daily Pass:** ₹19 (20 messages, 24 hours)
**Weekly Pass:** ₹49 (200 messages, 7 days)

**Cashfree Fee:** ~2% per transaction
**Your earnings:**
- Daily: ~₹18.50
- Weekly: ~₹48

---

**GET YOUR CASHFREE CREDENTIALS AND START EARNING!** 💳✨
