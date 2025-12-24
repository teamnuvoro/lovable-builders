# Enable Real Cashfree Payments

## Current Status

✅ User set to free plan (phone: 8828447880)
✅ Mock mode is disabled (MOCK_PAYMENTS not set)
✅ Cashfree credentials are configured

## Configuration Check

Your `.env` should have:
```bash
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=PRODUCTION
```

## Return URL Configuration

For local testing with ngrok:
```bash
NGROK_URL=https://prosurgical-nia-carpingly.ngrok-free.dev
```

**IMPORTANT:** Make sure this URL is whitelisted in Cashfree dashboard!

## Testing Flow

1. **Login** with phone: `8828447880`
2. **Send 20 messages** → Chat will lock
3. **Click "Upgrade"** → Paywall opens
4. **Select plan** (Daily ₹19 or Weekly ₹49)
5. **Complete payment** in Cashfree checkout
6. **User auto-upgrades** → Chat unlocks immediately
7. **Access expires** after 24h (daily) or 7 days (weekly)

## Payment Flow

```
User clicks "Upgrade"
    ↓
Backend creates Cashfree order
    ↓
Frontend opens Cashfree checkout
    ↓
User completes payment
    ↓
Cashfree redirects to: /payment/callback?orderId=...
    ↓
Backend verifies payment
    ↓
User upgraded automatically
    ↓
Chat unlocks immediately
```

## Troubleshooting

### Payment fails with "Broken Link" error
- Make sure ngrok URL is whitelisted in Cashfree
- Or use production domain if available

### User not upgrading after payment
- Check backend logs for upgrade messages
- Verify payment status in Cashfree dashboard
- Check database: `subscriptions` table should have `status='active'`

### Chat still locked after payment
- Hard refresh browser: `Cmd+Shift+R`
- Check `/api/user/usage` returns `premiumUser: true`
- Verify `subscription_expiry` is set correctly

