# Switch from Mock to Real Cashfree Payments

## Steps to Enable Real Payments

### 1. Disable Mock Mode

Remove or comment out `MOCK_PAYMENTS` from `.env`:

```bash
# Comment out or remove this line:
# MOCK_PAYMENTS=true
```

Or set it to false:
```bash
MOCK_PAYMENTS=false
```

### 2. Ensure Cashfree Credentials are Set

Make sure your `.env` has:
```bash
CASHFREE_APP_ID=your_production_app_id
CASHFREE_SECRET_KEY=your_production_secret_key
CASHFREE_ENV=PRODUCTION
```

### 3. Whitelist Your Domain

For production, whitelist your domain in Cashfree:
- Go to: https://merchant.cashfree.com/developers/whitelisting
- Add your production domain (e.g., `https://yourdomain.com`)
- Wait for approval

For local testing with ngrok:
- Keep ngrok running: `ngrok http 8080`
- Whitelist the ngrok URL in Cashfree dashboard
- Set `NGROK_URL` in `.env`

### 4. Restart Backend

```bash
./start-dev.sh
```

### 5. Test Payment Flow

1. Go to your app
2. Click "Upgrade"
3. Select a plan
4. Complete payment in Cashfree checkout
5. User should be upgraded automatically after payment

## How It Works

### Payment Flow:
1. **Create Order** → Backend creates order in Cashfree
2. **User Pays** → Cashfree checkout handles payment
3. **Callback** → User redirected to `/payment/callback?orderId=...`
4. **Verify** → Backend verifies payment with Cashfree API
5. **Upgrade** → User is upgraded to premium automatically

### Upgrade Triggers:
- **Database Triggers**: Automatically upgrade when subscription becomes 'active'
- **Verify Endpoint**: Manually upgrades user if triggers don't fire
- **Webhook**: Cashfree webhook also triggers upgrade (if configured)

## Troubleshooting

### Payment not upgrading?
1. Check backend logs for upgrade messages
2. Verify payment status in Cashfree dashboard
3. Check database: `subscriptions` table should have `status='active'`
4. Check database: `users` table should have `premium_user=true`

### Still seeing "FREE PLAN"?
1. Hard refresh browser: `Cmd+Shift+R`
2. Check `/api/user/usage` endpoint returns `premiumUser: true`
3. Verify user ID matches in payment and user tables

