# Render Deployment Guide - Dodo Payments Integration

## Prerequisites

✅ Code pushed to GitHub  
✅ Dodo Payments production credentials ready  
✅ Database migration ready

---

## Step 1: Connect Repository to Render

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Sign in or create account

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your code

---

## Step 2: Configure Build Settings

### Build Command:
```bash
npm install
```

### Start Command:
```bash
npm run start
```

Or if you have a specific start script:
```bash
node server/index.js
```

### Environment:
- **Node:** Select latest LTS version (e.g., Node 20.x)

---

## Step 3: Add Environment Variables

Add ALL these environment variables in Render Dashboard → Environment:

### Required Dodo Payments Variables:
```env
DODO_PAYMENTS_API_KEY=mZkpUls52vn8MgzT.SuRBQ2lv4-95CiSAZzLfe8-cFnaj9ZXeosytCzYVCTZ0bleg
DODO_ENV=live_mode
DODO_WEBHOOK_SECRET=whsec_bBYSPrL9eB3UhzNBa/S4Ya2LMUE5T8tW
DODO_PRODUCT_ID_MONTHLY=pdt_0NWqJe1actbDDuGrTMWMb
DODO_WEBHOOK_URL=https://your-app-name.onrender.com/api/payment/webhook
```

### Production URLs:
```env
BASE_URL=https://your-app-name.onrender.com
PAYMENT_RETURN_URL=https://your-app-name.onrender.com/payment/return
```

### Supabase (if using):
```env
SUPABASE_URL=https://xgraxcgavqeyqfwimbwt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Other Required Variables:
```env
NODE_ENV=production
PORT=10000
```

**Important:** Replace `your-app-name.onrender.com` with your actual Render app URL.

---

## Step 4: Update Dodo Webhook URL

After deployment, update the webhook URL in Dodo Dashboard:

1. Go to Dodo Dashboard → Webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://your-app-name.onrender.com/api/payment/webhook`
4. Save

---

## Step 5: Run Database Migration

After deployment, run the database migration in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration from: `supabase/migrations/20250122_add_dodo_order_id.sql`

This adds:
- `dodo_order_id` column to subscriptions table
- Makes `cashfree_order_id` nullable

---

## Step 6: Verify Deployment

### Check Logs:
1. Go to Render Dashboard → Your Service → Logs
2. Look for:
   ```
   🚀 Server running on port 10000
   [Dodo] Environment variables check: ...
   ```

### Test Payment Flow:
1. Visit your deployed app
2. Try to create a payment
3. Check logs for any errors
4. Verify webhook receives events

---

## Step 7: Monitor Webhooks

### Check Dodo Dashboard:
1. Go to Dodo Dashboard → Webhooks → Logs
2. Verify webhook deliveries are successful
3. Check for any failed deliveries

### Check Render Logs:
1. Monitor Render logs for webhook events
2. Look for: `[Dodo Webhook] ✅ User upgraded to premium`

---

## Troubleshooting

### Issue: Webhook not receiving events
- **Check:** Webhook URL is correct in Dodo Dashboard
- **Check:** Render service is publicly accessible
- **Check:** Webhook secret matches in both places

### Issue: Payment creation fails
- **Check:** `DODO_PAYMENTS_API_KEY` is set correctly
- **Check:** `DODO_PRODUCT_ID_MONTHLY` is set
- **Check:** `DODO_ENV=live_mode` is set

### Issue: Premium not unlocking
- **Check:** Webhook logs in Render
- **Check:** Database has `premium_user: true` after payment
- **Check:** `subscription_expiry` is set correctly

### Issue: Build fails
- **Check:** Node version is correct
- **Check:** All dependencies are in `package.json`
- **Check:** Build command is correct

---

## Environment Variables Checklist

Before deploying, ensure these are set in Render:

- [ ] `DODO_PAYMENTS_API_KEY`
- [ ] `DODO_ENV=live_mode`
- [ ] `DODO_WEBHOOK_SECRET`
- [ ] `DODO_PRODUCT_ID_MONTHLY`
- [ ] `DODO_WEBHOOK_URL` (with your Render URL)
- [ ] `BASE_URL` (with your Render URL)
- [ ] `PAYMENT_RETURN_URL` (with your Render URL)
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` (or your chosen port)
- [ ] `SUPABASE_URL` (if using Supabase)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (if using Supabase)

---

## Post-Deployment Steps

1. ✅ Update Dodo webhook URL to Render URL
2. ✅ Run database migration in Supabase
3. ✅ Test payment flow end-to-end
4. ✅ Monitor first few payments
5. ✅ Check webhook delivery logs

---

## Important Notes

- **HTTPS Required:** Render provides HTTPS automatically
- **Webhook URL:** Must be publicly accessible (Render provides this)
- **Database:** Run migration before processing real payments
- **Monitoring:** Watch logs for first few payments

---

**Ready to deploy!** Follow the steps above and your app will be live on Render. 🚀
