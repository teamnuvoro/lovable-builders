# Twilio SMS/OTP Setup Guide

This guide will help you set up Twilio for SMS-based OTP authentication.

## 🎯 What You Need

1. **Twilio Account** (Free trial available)
2. **Phone Number** (Twilio provides one for free)
3. **API Credentials** (Account SID & Auth Token)

---

## 📋 Step-by-Step Setup

### 1. Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

### 2. Get Your Credentials

1. Log in to [Twilio Console](https://console.twilio.com/)
2. On the dashboard, you'll see:
   - **Account SID** (e.g., `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token** (click to reveal)
3. Copy both values

### 3. Get a Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. For free trial:
   - Select your country
   - Choose "SMS" capability
   - Click "Search"
   - Select a number and click "Buy"
3. Your number will be in format: `+1234567890`

### 4. Configure Environment Variables

Add these to your `.env` file:

```env
# Twilio SMS/OTP Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Example:**
```env
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

### 5. Restart Your Server

```bash
npm run dev
```

---

## 🧪 Testing

### Development Mode (No Twilio Required)

If you **don't** add Twilio credentials, the app runs in **dev mode**:
- OTP is printed in the console
- OTP is shown in the UI
- No SMS is sent
- Perfect for testing!

### Production Mode (With Twilio)

Once you add Twilio credentials:
- Real SMS messages are sent
- OTP is **not** shown in UI
- Users receive SMS on their phone

---

## 💰 Twilio Free Trial Limits

- **$15.50 free credit** (enough for ~500 SMS)
- Can only send to **verified phone numbers**
- To send to any number, upgrade to paid account

### Verify Test Phone Numbers

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** → **Manage** → **Verified Caller IDs**
3. Click **Add a new number**
4. Enter the phone number you want to test with
5. Verify via SMS or call

---

## 🔧 Troubleshooting

### "Failed to send OTP"

**Possible causes:**
1. Invalid Twilio credentials
2. Phone number not verified (free trial)
3. Insufficient balance
4. Invalid phone number format

**Solutions:**
- Check credentials in `.env`
- Verify test phone numbers in Twilio Console
- Use international format: `+919876543210` (not `9876543210`)
- Check Twilio logs: [Console → Monitor → Logs](https://console.twilio.com/monitor/logs/sms)

### OTP Not Received

1. Check phone number format (must include country code: `+91...`)
2. Verify the number in Twilio Console (free trial)
3. Check Twilio SMS logs for delivery status
4. Ensure phone has signal and can receive SMS

### "Unverified Number" Error

- **Free trial limitation**: Can only send to verified numbers
- **Solution**: Verify the number in Twilio Console or upgrade account

---

## 📱 Phone Number Format

Always use **international format**:

✅ **Correct:**
- `+919876543210` (India)
- `+14155552671` (USA)
- `+447911123456` (UK)

❌ **Incorrect:**
- `9876543210` (missing country code)
- `09876543210` (leading zero)
- `+91 98765 43210` (spaces - will be auto-removed)

---

## 🚀 Going to Production

### 1. Upgrade Twilio Account

- Remove free trial restrictions
- Add payment method
- Get higher rate limits

### 2. Security Best Practices

- **Never commit** `.env` file to Git
- Use environment variables in production
- Rotate Auth Token regularly
- Monitor usage and set spending limits

### 3. Rate Limiting

Add rate limiting to prevent abuse:
- Max 3 OTP requests per phone number per hour
- Max 5 failed verification attempts
- Implement CAPTCHA for suspicious activity

---

## 📊 Cost Estimation

**Twilio SMS Pricing (India):**
- ~₹0.50 per SMS
- 1000 users/month = ₹500-1000/month

**Optimization Tips:**
- Cache OTPs for 10 minutes (avoid resend spam)
- Use voice OTP as fallback (cheaper in some regions)
- Consider email OTP for non-critical flows

---

## 🔗 Useful Links

- [Twilio Console](https://console.twilio.com/)
- [Twilio SMS Logs](https://console.twilio.com/monitor/logs/sms)
- [Twilio Pricing](https://www.twilio.com/sms/pricing)
- [Twilio Node.js SDK Docs](https://www.twilio.com/docs/libraries/node)
- [Verify Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)

---

## 📝 Example Flow

1. **User enters phone number** → `+919876543210`
2. **Server generates OTP** → `123456`
3. **Twilio sends SMS** → "Your Riya AI verification code is: 123456. Valid for 10 minutes."
4. **User enters OTP** → `123456`
5. **Server verifies** → Account created ✅

---

## 🎉 You're All Set!

Your OTP authentication is now configured! Users can sign up and log in using their phone numbers.

**Next Steps:**
1. Test signup flow: `http://localhost:3000/signup`
2. Test login flow: `http://localhost:3000/login`
3. Monitor Twilio logs for any issues

Need help? Check the troubleshooting section above! 🚀

