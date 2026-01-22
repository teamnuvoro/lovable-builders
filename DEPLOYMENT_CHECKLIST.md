# Deployment Checklist - Render + Dodo Payments

## ✅ Pre-Deployment

- [x] Code pushed to GitHub
- [x] All secrets removed from code (using .gitignore)
- [x] Database migration file ready
- [x] Production credentials obtained

---

## Step 1: Render Setup

### Create Web Service:
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository: `lovable-builders`
- [ ] Select branch: `main`

### Configure Service:
- [ ] Name: `riya-ai-companion` (or your choice)
- [ ] Region: Choose closest to users
- [ ] Build Command: `npm install && npm run build && npm run build:server`
- [ ] Start Command: `npm run start`
- [ ] Environment: `Node` (latest LTS)

---

## Step 2: Environment Variables

Add ALL these in Render Dashboard → Environment:

### Dodo Payments (Required):
```env
DODO_PAYMENTS_API_KEY=mZkpUls52vn8MgzT.SuRBQ2lv4-95CiSAZzLfe8-cFnaj9ZXeosytCzYVCTZ0bleg
DODO_ENV=live_mode
DODO_WEBHOOK_SECRET=whsec_bBYSPrL9eB3UhzNBa/S4Ya2LMUE5T8tW
DODO_PRODUCT_ID_MONTHLY=pdt_0NWqJe1actbDDuGrTMWMb
```

### URLs (Update AFTER deployment with your Render URL):
```env
BASE_URL=https://your-app-name.onrender.com
PAYMENT_RETURN_URL=https://your-app-name.onrender.com/payment/return
DODO_WEBHOOK_URL=https://your-app-name.onrender.com/api/payment/webhook
```

### System:
```env
NODE_ENV=production
PORT=10000
```

### Supabase (if using):
```env
SUPABASE_URL=https://xgraxcgavqeyqfwimbwt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

---

## Step 3: Deploy

- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Note your Render URL (e.g., `riya-ai-companion.onrender.com`)

---

## Step 4: Update URLs

After deployment, update environment variables with your actual Render URL:

1. **In Render Dashboard:**
   - Go to your service → Environment
   - Update `BASE_URL` with your Render URL
   - Update `PAYMENT_RETURN_URL` with your Render URL
   - Update `DODO_WEBHOOK_URL` with your Render URL
   - Save (will trigger redeploy)

2. **In Dodo Dashboard:**
   - Go to Dodo Dashboard → Webhooks
   - Edit your webhook endpoint
   - Update URL to: `https://your-app-name.onrender.com/api/payment/webhook`
   - Save

---

## Step 5: Database Migration

- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Run migration: `supabase/migrations/20250122_add_dodo_order_id.sql`
- [ ] Verify migration succeeded

---

## Step 6: Verification

### Check Service:
- [ ] Service is running (green status in Render)
- [ ] Logs show: `🚀 Server running on port 10000`
- [ ] No errors in logs

### Test Payment:
- [ ] Visit your deployed app
- [ ] Try to create a payment
- [ ] Check logs for errors
- [ ] Verify redirect to Dodo checkout works

### Test Webhook:
- [ ] Complete a test payment
- [ ] Check Render logs for webhook event
- [ ] Verify user upgraded to premium
- [ ] Check Dodo Dashboard → Webhooks → Logs

---

## Step 7: Monitor

- [ ] Watch first few payments closely
- [ ] Check webhook delivery logs
- [ ] Monitor for any errors
- [ ] Verify premium unlock works

---

## Troubleshooting

### Build Fails:
- Check Node version (should be 20.x)
- Check build logs for specific errors
- Verify all dependencies in package.json

### Service Won't Start:
- Check PORT is set to 10000
- Check NODE_ENV=production
- Check logs for startup errors

### Webhook Not Working:
- Verify DODO_WEBHOOK_URL is correct
- Verify webhook URL in Dodo Dashboard
- Check Render logs for webhook events
- Ensure service is publicly accessible

### Payment Creation Fails:
- Check all Dodo env vars are set
- Verify DODO_PRODUCT_ID_MONTHLY is correct
- Check Render logs for errors

---

## Quick Reference

**Repository:** https://github.com/teamnuvoro/lovable-builders  
**Render Dashboard:** https://dashboard.render.com  
**Dodo Dashboard:** https://dashboard.dodopayments.com  
**Supabase Dashboard:** https://supabase.com/dashboard

---

**Status:** Ready for deployment! 🚀
