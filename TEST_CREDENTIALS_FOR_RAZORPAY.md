# Test Credentials for Razorpay Verification

## Overview
This document provides test/dummy credentials for third-party teams (like Razorpay) to test the Riya AI authentication flow without needing real phone numbers or SMS delivery.

## Test Credentials

### Default Test Phone Number
```
+919999999999
```
or
```
919999999999
```

### Default Test OTP
```
123456
```

### Default Test Email
```
test@riya.ai
```

### Default Test Name
```
Test User
```

## How to Use

### For Signup/Registration:
1. **Phone Number**: Use `+919999999999` or `919999999999`
2. **Email**: Use `test@riya.ai` (or any email)
3. **Name**: Use `Test User` (or any name)
4. **OTP**: The system will automatically return `123456` as the OTP (no SMS sent)
5. **Enter OTP**: Use `123456` to verify

### For Login:
1. **Phone Number**: Use `+919999999999` or `919999999999`
2. **OTP**: The system will automatically return `123456` as the OTP (no SMS sent)
3. **Enter OTP**: Use `123456` to verify

## Customization

You can customize the test credentials by setting environment variables:

```bash
# Set custom test phone number
TEST_PHONE_NUMBER=+911234567890

# Set custom test OTP
TEST_OTP=000000

# Set custom test email
TEST_EMAIL=razorpay@test.com

# Set custom test name
TEST_NAME=Razorpay Tester
```

## Important Notes

1. **No SMS Sent**: When using test credentials, no actual SMS is sent via Twilio. The OTP is returned directly in the API response.

2. **Hash Verification Bypassed**: For test numbers, the OTP hash verification is bypassed - you just need to use the correct test OTP.

3. **Works in Production**: Test credentials work in both development and production environments.

4. **Multiple Uses**: The same test credentials can be used multiple times - there's no limit.

5. **User Creation**: Test users will be created in the database just like real users, but with the test phone number.

## API Response

When using test credentials, the API response will include:

```json
{
  "success": true,
  "message": "Test OTP: 123456 (Test number - no SMS sent)",
  "devMode": true,
  "isTestNumber": true,
  "otp": "123456",
  "hash": "...",
  "expiresAt": 1234567890
}
```

Notice that:
- `isTestNumber: true` indicates test mode
- `otp` is included in the response (normally hidden in production)
- `devMode: true` indicates no SMS was sent

## Testing Flow

### Complete Signup Flow:
1. POST `/api/auth/send-otp`
   - Body: `{ "phoneNumber": "+919999999999", "email": "test@riya.ai", "name": "Test User" }`
   - Response includes `otp: "123456"`

2. POST `/api/auth/verify-otp`
   - Body: `{ "phoneNumber": "+919999999999", "otp": "123456", "hash": "...", "expiresAt": ..., "email": "test@riya.ai", "name": "Test User" }`
   - Creates user account

### Complete Login Flow:
1. POST `/api/auth/login`
   - Body: `{ "phoneNumber": "+919999999999" }`
   - Response includes `otp: "123456"`

2. POST `/api/auth/verify-login-otp`
   - Body: `{ "phoneNumber": "+919999999999", "otp": "123456", "hash": "...", "expiresAt": ... }`
   - Returns user session

## Security

⚠️ **Important**: These test credentials are for testing purposes only. In production:
- Test credentials should only be used by authorized testing teams
- Consider restricting test credentials to specific IP addresses or environments
- Monitor usage of test credentials to detect abuse

## Troubleshooting

### OTP not working?
- Make sure you're using the exact test phone number: `+919999999999` or `919999999999`
- Make sure you're using the exact test OTP: `123456`
- Check server logs for `[TEST MODE]` messages

### User already exists?
- Test users are created in the database like real users
- If a test user already exists, use the login flow instead of signup
- Or use a different email/name combination

### Still having issues?
- Check that environment variables are set correctly (if using custom values)
- Verify the phone number format matches exactly (with or without +)
- Check server logs for detailed error messages

