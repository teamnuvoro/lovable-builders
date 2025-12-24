# Cashfree Local Development Setup

## ✅ What I've Done

1. **Updated `.env` file** with your production keys:
   - `CASHFREE_APP_ID=your_cashfree_app_id`
   - `CASHFREE_SECRET_KEY=your_cashfree_secret_key`
   - `CASHFREE_ENV=PRODUCTION`

2. **Updated payment route** to use production keys (hardcoded as backup)

3. **Fixed returnUrl** to use `http://localhost:8080` (matches your frontend)

## ⚠️ REQUIRED: Whitelist Localhost in Cashfree

**Cashfree Production mode requires all return URLs to be whitelisted.**

### Steps to Whitelist:

1. **Go to Cashfree Merchant Dashboard:**
   - Visit: https://merchant.cashfree.com/developers
   - Or: https://www.cashfree.com/developers

2. **Navigate to Whitelisting:**
   - Look for "Whitelisting" or "Domain Whitelisting" section
   - Or go to: https://merchant.cashfree.com/developers/whitelisting

3. **Add Localhost Domain:**
   - Add: `http://localhost:8080`
   - Also add: `http://localhost:3000` (for backend callbacks)
   - Save the changes

4. **Wait for Propagation:**
   - Changes can take 5-10 minutes to propagate
   - Try the payment flow again after waiting

### Alternative: Use Production Domain

If you have a production domain already whitelisted (like `https://riya-ai.site`), you can temporarily use that for testing by updating the returnUrl in `server/routes/payment.ts` line 135.

## 🧪 Testing After Whitelisting

1. **Restart your backend server:**
   ```bash
   ./start-dev.sh
   ```

2. **Refresh your frontend** (hard refresh: `Cmd+Shift+R`)

3. **Try the payment flow:**
   - Click "Upgrade"
   - Select a plan
   - Complete payment

## 📝 Notes

- The keys are now hardcoded in `server/routes/payment.ts` as a backup
- The `.env` file also has the keys
- Both frontend and backend use `http://localhost:8080` for returnUrl
- Once whitelisted, payments should work in production mode

## 🔍 Troubleshooting

If you still see the whitelisting error:
1. Double-check the domain is exactly `http://localhost:8080` (no trailing slash)
2. Wait 10-15 minutes after whitelisting
3. Check Cashfree dashboard to confirm the domain is saved
4. Try clearing browser cache and cookies


