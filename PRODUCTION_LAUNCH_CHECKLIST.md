# 🚀 Production Launch Checklist

## 🔐 Security

- [ ] Webhook signature verification enabled and tested
- [ ] All secrets stored in environment variables (no hardcoded keys)
- [ ] No API keys exposed in frontend code
- [ ] Rate limiting enabled on payment APIs
- [ ] HTTPS enforced on all production endpoints
- [ ] CORS properly configured for production domain
- [ ] SQL injection protection verified (parameterized queries)
- [ ] XSS protection verified (input sanitization)

## 💳 Payments

- [ ] Order reuse logic enabled (prevents duplicate orders)
- [ ] Hosted checkout fallback working (for blocked SDKs)
- [ ] SDK block detection UI implemented
- [ ] Webhook → Database → Frontend sync verified
- [ ] Payment verification polling working correctly
- [ ] Test successful payment flow end-to-end
- [ ] Test failed payment flow end-to-end
- [ ] Test payment timeout scenarios
- [ ] Verify Cashfree production credentials are active
- [ ] Verify Cashfree webhook URL is configured in dashboard

## 🌐 Infrastructure

- [ ] Remove ngrok URLs from environment
- [ ] Set `BASE_URL` to production domain
- [ ] Set `CASHFREE_WEBHOOK_URL` to production webhook endpoint
- [ ] Verify `NODE_ENV=production` is set
- [ ] HTTPS certificate valid and auto-renewing
- [ ] Domain DNS configured correctly
- [ ] CDN configured (if applicable)
- [ ] Database backups enabled
- [ ] Monitoring and alerting set up

## 🧪 Testing

- [ ] Chrome (no extensions) - payment flow works
- [ ] Brave (shields ON) - hosted checkout fallback works
- [ ] Mobile browser (Chrome/Safari) - payment flow works
- [ ] Slow network - payment verification polling works
- [ ] Payment success - user upgraded correctly
- [ ] Payment failure - error handling works
- [ ] Payment timeout - user sees appropriate message
- [ ] Webhook delayed - polling catches payment
- [ ] Multiple rapid clicks - order reuse prevents spam

## 🧹 Code Cleanup

- [ ] Remove all debug console.logs (or use proper logging library)
- [ ] Remove dev-only flags and backdoor logic
- [ ] Lock pricing server-side (no client-side price manipulation)
- [ ] Disable duplicate order creation (order reuse working)
- [ ] Remove test/mock payment code
- [ ] Remove unused environment variables
- [ ] Clean up commented-out code
- [ ] Verify no sensitive data in error messages

## 📊 Monitoring & Analytics

- [ ] Payment success tracking implemented
- [ ] Payment failure tracking implemented
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] User analytics tracking verified
- [ ] Payment conversion funnel tracked

## 🔄 Post-Launch

- [ ] Monitor first 10 real payments
- [ ] Verify webhooks are being received
- [ ] Check database for correct subscription records
- [ ] Verify premium status updates correctly
- [ ] Monitor error rates and logs
- [ ] Check Cashfree dashboard for order status
- [ ] Verify customer support process for payment issues

## ✅ Final Verification

- [ ] All checklist items completed
- [ ] Code reviewed by team
- [ ] Staging environment tested thoroughly
- [ ] Production deployment plan documented
- [ ] Rollback plan prepared
- [ ] Support team briefed on payment flow
- [ ] Customer support email configured (support@riya.ai)

---

## 🚨 Critical Pre-Launch Items

1. **Remove Backdoor Logic**: Ensure all `backdoor-user-id` and dev user logic is disabled in production
2. **Set Production Environment**: `NODE_ENV=production` must be set
3. **Webhook URL**: Must be configured in Cashfree dashboard pointing to production
4. **Domain Whitelisting**: Cashfree domain whitelisting configured (if required)
5. **Test Real Payment**: Make at least one real payment in production to verify end-to-end flow

---

## 📝 Notes

- Keep this checklist updated as you complete items
- Review before every production deployment
- Document any production-specific configurations
