# 🔍 Supabase SMS OTP Not Arriving - Debug Guide

## Problem
You see "OTP Sent" message but no SMS is received on your phone.

## Common Causes & Solutions

### 1. ✅ Check Supabase Dashboard Configuration

**Go to:** Supabase Dashboard → Authentication → Providers → Phone

**Verify:**
- [ ] Phone provider is **ENABLED** (toggle ON)
- [ ] External provider is set to **"vonage"**
- [ ] **Vonage API Key** is set: `a4c85a24`
- [ ] **Vonage API Secret** is set: `pfPsA8tMfbSpO9SN`
- [ ] Click **"Save"** button (important!)

### 2. ✅ Check Vonage Account Status

**Go to:** [Vonage Dashboard](https://dashboard.nexmo.com/)

**Check:**
- [ ] Account has **SMS balance** (credits)
- [ ] Account is **not suspended**
- [ ] API credentials are **active**
- [ ] Phone number is **verified** in Vonage

### 3. ✅ Check Phone Number Format

**Correct format:** `+918828447880` (E.164 format with country code)

**Wrong formats:**
- ❌ `8828447880` (missing +91)
- ❌ `918828447880` (missing +)
- ❌ `+91 8828447880` (has spaces)

### 4. ✅ Check Supabase Logs

**Go to:** Supabase Dashboard → Logs → Auth Logs

**Look for:**
- OTP send attempts
- Error messages
- Vonage API errors

### 5. ✅ Test Vonage Directly

You can test if Vonage is working by checking your Vonage dashboard:
- Go to Vonage Dashboard → Messages → Outbound
- Check if any SMS attempts appear
- If no attempts appear, Supabase isn't calling Vonage

### 6. ✅ Check Browser Console

**Open:** Browser DevTools → Console

**Look for:**
- `[Supabase Auth] Sending OTP to: +918828447880`
- `[Supabase Auth] OTP sent successfully`
- Any error messages

### 7. ✅ Common Issues

#### Issue: "Phone provider is disabled"
**Fix:** Enable phone provider in Supabase Dashboard

#### Issue: "SMS provider not configured"
**Fix:** Add Vonage credentials in Supabase Dashboard

#### Issue: "Invalid phone number"
**Fix:** Ensure phone is in E.164 format: `+918828447880`

#### Issue: "Rate limit exceeded"
**Fix:** Wait 15 minutes and try again

#### Issue: "Insufficient balance"
**Fix:** Add credits to your Vonage account

### 8. ✅ Alternative: Check Supabase Auth Logs

**Go to:** Supabase Dashboard → Logs → Auth Logs

**Filter by:**
- Event type: `otp`
- Phone number: Your phone number

**Check for:**
- `otp_sent` events
- Error messages
- Provider errors

### 9. ✅ Test with Different Phone Number

Try with a different phone number to see if it's:
- Phone-specific issue
- Account-wide issue

### 10. ✅ Verify Vonage API Credentials

**Test credentials:**
```bash
# These should match what's in Supabase Dashboard
API Key: a4c85a24
API Secret: pfPsA8tMfbSpO9SN
```

**If credentials are wrong:**
- Update in Supabase Dashboard
- Save changes
- Try again

## Quick Checklist

- [ ] Phone provider enabled in Supabase
- [ ] Vonage credentials added in Supabase
- [ ] Clicked "Save" in Supabase Dashboard
- [ ] Phone number in E.164 format (+91...)
- [ ] Vonage account has balance
- [ ] Checked Supabase Auth Logs
- [ ] Checked browser console for errors
- [ ] Waited 1-2 minutes (SMS can be delayed)

## Still Not Working?

1. **Check Supabase Dashboard → Logs → Auth Logs**
   - Look for error messages
   - Check if OTP send is even attempted

2. **Check Vonage Dashboard**
   - Go to Messages → Outbound
   - See if SMS attempts are being made

3. **Contact Support**
   - Supabase Support: If Supabase logs show errors
   - Vonage Support: If Vonage dashboard shows no attempts

## Debug Mode

Add this to see more details:
```javascript
// In browser console
localStorage.setItem('supabase_debug', 'true');
```

Then check console for detailed logs.
