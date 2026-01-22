# 📱 SMS Not Arriving - Step-by-Step Debug

## Current Status
✅ Supabase API call is **succeeding** (no errors)
❌ SMS is **not arriving** on your phone

This means the issue is with **SMS delivery**, not the API call.

## Step 1: Check Supabase Auth Logs (MOST IMPORTANT)

1. Go to: **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Look for entries with:
   - Phone: `+918828447880`
   - Event: `otp_sent` or `otp_verification`
3. Check for **error messages** in the logs
4. Look for **Vonage API errors**

**What to look for:**
- ✅ `otp_sent` = Supabase tried to send
- ❌ `provider_error` = Vonage rejected the request
- ❌ `insufficient_balance` = Vonage account has no credits
- ❌ `invalid_credentials` = Vonage API key/secret wrong

## Step 2: Check Vonage Dashboard

1. Go to: [Vonage Dashboard](https://dashboard.nexmo.com/)
2. Navigate to: **Messages** → **Outbound**
3. Check if **any SMS attempts** appear for your phone number
4. If **NO attempts appear**, Supabase isn't calling Vonage (config issue)
5. If **attempts appear but failed**, check the error message

**What to check:**
- [ ] Account balance (top right corner)
- [ ] Outbound messages (should show attempts)
- [ ] Error messages (if any)

## Step 3: Verify Supabase Phone Provider Settings

1. Go to: **Supabase Dashboard** → **Authentication** → **Providers** → **Phone**
2. Verify these settings:

```
External Provider: vonage
Vonage API Key: a4c85a24
Vonage API Secret: pfPsA8tMfbSpO9SN
```

3. **IMPORTANT:** Click **"Save"** button (even if values look correct)
4. Wait 30 seconds for changes to propagate

## Step 4: Test Vonage Credentials Directly

You can test if Vonage credentials work by checking your Vonage account:

1. Go to Vonage Dashboard → **Settings** → **API Credentials**
2. Verify the API Key matches: `a4c85a24`
3. Check if account is **active** (not suspended)

## Step 5: Check Phone Number Format

Your phone number should be: `+918828447880`

**Verify:**
- ✅ Starts with `+`
- ✅ Has country code `91`
- ✅ 10 digits after country code
- ✅ No spaces or special characters

## Step 6: Common Issues & Fixes

### Issue: "No SMS attempts in Vonage Dashboard"
**Cause:** Supabase isn't calling Vonage
**Fix:**
1. Double-check Vonage credentials in Supabase
2. Click "Save" in Supabase Dashboard
3. Wait 1-2 minutes
4. Try again

### Issue: "SMS attempts appear but failed"
**Cause:** Vonage delivery issue
**Fix:**
1. Check error message in Vonage Dashboard
2. Common errors:
   - "Insufficient balance" → Add credits
   - "Invalid destination" → Check phone number format
   - "Account suspended" → Contact Vonage support

### Issue: "Account has no balance"
**Cause:** Vonage account needs credits
**Fix:**
1. Go to Vonage Dashboard
2. Add SMS credits/balance
3. Try again

### Issue: "SMS delayed"
**Cause:** Network delays
**Fix:**
- Wait 2-3 minutes
- Check spam folder
- Try resending

## Step 7: Alternative - Check Supabase Response

In browser console, you should see:
```
[Supabase Auth] Response data: {...}
```

Check if there's a `message_id` or delivery status in the response.

## Step 8: Contact Support

If still not working:

1. **Supabase Support:** If Supabase logs show errors
   - Go to Supabase Dashboard → Support
   - Include Auth Logs screenshot

2. **Vonage Support:** If Vonage dashboard shows no attempts
   - Contact Vonage support
   - Ask why SMS isn't being sent

## Quick Test

1. Check Supabase Auth Logs → Look for errors
2. Check Vonage Dashboard → Look for SMS attempts
3. If neither shows anything → Config issue in Supabase
4. If Vonage shows attempts but failed → Vonage account issue

## Most Likely Causes (in order)

1. **Vonage credentials not saved in Supabase** (60% chance)
   - Fix: Go to Supabase → Phone provider → Click "Save"

2. **Vonage account has no balance** (25% chance)
   - Fix: Add credits to Vonage account

3. **Phone number format issue** (10% chance)
   - Fix: Ensure `+918828447880` format

4. **SMS delay** (5% chance)
   - Fix: Wait 2-3 minutes, check spam
