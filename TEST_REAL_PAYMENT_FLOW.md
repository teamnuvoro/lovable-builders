# Test Real Cashfree Payment Flow

## ✅ Setup Complete

1. **User set to free plan** (phone: 8828447880)
2. **Real Cashfree payments enabled** (PRODUCTION mode)
3. **Mock mode disabled**
4. **Ngrok URL configured** for HTTPS whitelisting

## 🧪 Testing Steps

### Step 1: Start ngrok (if not running)
```bash
ngrok http 8080
```
Keep this running in a separate terminal.

### Step 2: Verify ngrok URL is whitelisted
- Go to: https://merchant.cashfree.com/developers/whitelisting
- Make sure `https://prosurgical-nia-carpingly.ngrok-free.dev` is whitelisted

### Step 3: Login to App
- Phone: `8828447880`
- You should see "FREE PLAN" status

### Step 4: Send Messages
- Send messages until you hit the **20 message limit**
- After 20th message → Chat will be **LOCKED**
- Paywall will appear

### Step 5: Make Payment
- Click "Upgrade" or the paywall button
- Select plan:
  - **Daily**: ₹19 (24 hours access)
  - **Weekly**: ₹49 (7 days access)
- Cashfree checkout will open
- Complete payment using test cards:
  - Card: `4111 1111 1111 1111`
  - CVV: Any 3 digits
  - Expiry: Any future date
  - Name: Any name

### Step 6: Verify Upgrade
- After payment → Redirected to `/payment/callback`
- User should be **automatically upgraded**
- Chat should **unlock immediately**
- Status should show "PREMIUM (DAILY)" or "PREMIUM (WEEKLY)"

### Step 7: Test Expiry (Optional)
- Daily plan expires after 24 hours
- Weekly plan expires after 7 days
- After expiry → User auto-downgrades to free
- Back to 20 free messages

## 🔍 What to Check

### Backend Logs
Look for:
- `🚀 Sending request to Cashfree:` - Order creation
- `✅ User upgraded to premium:` - Upgrade success
- `🌐 [Payment] Using returnUrl base:` - Should show ngrok URL

### Database
Check:
- `users` table: `premium_user = true`, `subscription_expiry` set
- `subscriptions` table: `status = 'active'`
- `payments` table: `status = 'success'`

### Frontend
- Status changes from "FREE PLAN" to "PREMIUM"
- Chat unlocks immediately
- Can send unlimited messages

## 🐛 Troubleshooting

### Payment fails with "Broken Link"
- **Fix**: Whitelist ngrok URL in Cashfree dashboard
- Or use production domain if available

### User not upgrading
- Check backend logs for errors
- Verify payment status in Cashfree dashboard
- Check database triggers are working

### Chat still locked
- Hard refresh: `Cmd+Shift+R`
- Check `/api/user/usage` returns `premiumUser: true`
- Verify `subscription_expiry` is in future

## 📝 Test Cards (Cashfree Test Mode)

If using TEST mode instead:
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date
- OTP: `123456` (if required)

## ✅ Success Criteria

1. ✅ User can send 20 free messages
2. ✅ Chat locks after 20 messages
3. ✅ Payment flow works with Cashfree
4. ✅ User upgrades automatically after payment
5. ✅ Chat unlocks immediately
6. ✅ Premium status shows in UI
7. ✅ Unlimited messages for premium users
8. ✅ Auto-downgrade after expiry (24h/7 days)

