# Alternative Payment Testing Approach

## Option 1: Use Cashfree TEST/SANDBOX Mode (Recommended)

**TEST mode doesn't require whitelisting!** Perfect for local development.

### Steps:

1. **Get TEST credentials from Cashfree:**
   - Go to: https://merchant.cashfree.com
   - Switch to "Test Mode" (button in top right)
   - Go to Developers > API Keys
   - Copy your TEST App ID and TEST Secret Key

2. **Update .env file:**
   ```bash
   CASHFREE_ENV=TEST
   CASHFREE_APP_ID=your_test_app_id_here
   CASHFREE_SECRET_KEY=your_test_secret_key_here
   ```

3. **Restart backend:**
   ```bash
   ./start-dev.sh
   ```

4. **Test payment:**
   - Access via `http://localhost:8080` (no ngrok needed!)
   - Use test payment methods (Cashfree provides test cards)
   - No whitelisting required!

---

## Option 2: Mock Payment Flow (Skip Cashfree Entirely)

For testing the upgrade flow without any payment gateway:

1. **Enable mock mode:**
   ```bash
   # Add to .env
   MOCK_PAYMENTS=true
   ```

2. **The backend will:**
   - Skip Cashfree API calls
   - Automatically mark payments as successful
   - Trigger the upgrade flow
   - Perfect for testing database triggers and user upgrades

---

## Option 3: Use Production Domain (If You Have One)

If you have a production domain already whitelisted:

1. **Update .env:**
   ```bash
   BASE_URL=https://your-production-domain.com
   ```

2. **Access via production domain** (even locally, if DNS points to localhost)

---

## Quick Switch Script

I can create a script to easily switch between TEST and PRODUCTION modes. Would you like me to do that?

