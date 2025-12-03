# 🔧 FIX 503 ERROR - Cashfree Credentials Missing

## ✅ Good News:

The Premium button works! ✅
The paywall opens! ✅
Cashfree integration is ready! ✅

## ❌ Problem:

"Cashfree credentials missing" - You need to add API keys to .env

---

## 🚀 FIX IT NOW (3 Minutes):

### Step 1: Get Cashfree Test Credentials

1. **Open browser:** https://www.cashfree.com/
2. **Click:** "Sign Up" (top-right)
3. **Complete registration** (use your email)
4. **Login to dashboard:** https://merchant.cashfree.com/merchants/login
5. **Navigate to:** Developers → API Keys (left sidebar)
6. **You'll see:**
   - App ID (starts with TEST...)
   - Secret Key (long string)
7. **Click "Copy"** for both

### Step 2: Add to .env File

**Open this file:**
```
/Users/joshuavaz/Documents/project1/riya-project-full/.env
```

**Add these lines at the bottom:**
```env
# Cashfree Payment Gateway
CASHFREE_APP_ID=TEST_your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_MODE=sandbox
CASHFREE_ENV=TEST
VITE_CASHFREE_MODE=sandbox
```

**Replace:**
- `TEST_your_app_id_here` with your actual App ID
- `your_secret_key_here` with your actual Secret Key

**Save the file!**

### Step 3: Restart Server

```bash
Ctrl+C
npm run dev
```

### Step 4: Test Payment

1. Refresh browser: `Cmd+Shift+R`
2. Go to: `localhost:3000/chat`
3. Click golden **"Premium"** button (top-right)
4. Click **"Get Daily Pass"** or **"Get Weekly Pass"**
5. Cashfree checkout will open! ✅
6. Use test card: **4111 1111 1111 1111**
7. CVV: **123**, Expiry: **12/25**
8. OTP: **123456**
9. Payment succeeds! ✅
10. You're premium! 🎉

---

## 📋 Example .env Entry:

```env
CASHFREE_APP_ID=TEST_123abc456def789ghi
CASHFREE_SECRET_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234
CASHFREE_MODE=sandbox
CASHFREE_ENV=TEST
VITE_CASHFREE_MODE=sandbox
```

---

## ✅ After Adding Credentials:

### Server will show:
```
[Cashfree] ✅ Credentials validated successfully
[Server] Payment routes registered
```

### When you click "Get Daily Pass":
```
[Payment] Order created: order_1234567890_abcd1234
[Cashfree] Creating order: {...}
[Cashfree] Order creation response: { status: 200, ok: true }
```

### Cashfree checkout will open in popup! 🎉

---

## 🎯 What You're Missing:

Just **2 values** in .env:
1. CASHFREE_APP_ID
2. CASHFREE_SECRET_KEY

That's it!

---

## 🔥 DO IT NOW:

1. **Get credentials:** https://www.cashfree.com/
2. **Add to .env**
3. **Restart server**
4. **Test payment**
5. **Done!** 💳✨

---

**Get your Cashfree credentials and payments will work immediately!**
