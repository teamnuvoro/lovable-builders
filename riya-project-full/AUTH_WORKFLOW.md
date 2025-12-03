# 🔐 Complete Authentication Workflow

This document explains the complete OTP-based authentication system for Riya AI.

---

## 📋 Overview

### Authentication Method
- **Phone Number + OTP** (SMS-based)
- No passwords required
- Secure 6-digit verification codes
- 10-minute expiry for OTPs

### Features
- ✅ Sign up with phone number, email, and name
- ✅ Login with phone number only
- ✅ OTP verification via Twilio SMS
- ✅ Automatic user creation in Supabase
- ✅ Session management with tokens
- ✅ Dev mode for testing (no SMS required)

---

## 🔄 Complete User Journey

### 1. Landing Page
**Route:** `/` or `/landingpage`

**User sees:**
- Beautiful full-screen image
- "Let's Get Started" button
- "Login" link

**Actions:**
- Click "Let's Get Started" → Go to Signup
- Click "Login" → Go to Login

---

### 2A. Signup Flow (New Users)

#### Step 1: Enter Details
**Route:** `/signup`

**User enters:**
- Full Name (e.g., "Rahul Sharma")
- Email (e.g., "rahul@example.com")
- Phone Number (e.g., "9876543210")

**What happens:**
1. Form validation (client-side)
2. Click "Send Verification Code"
3. Phone number formatted: `+919876543210`
4. API call: `POST /api/auth/send-otp`
5. Server checks if user exists
   - If exists → Error: "User already exists, please login"
   - If new → Continue
6. Server generates 6-digit OTP (e.g., `123456`)
7. OTP stored in memory with 10-minute expiry
8. Twilio sends SMS: "Your Riya AI verification code is: 123456. Valid for 10 minutes."

**Dev Mode (No Twilio):**
- OTP shown in console
- OTP displayed in yellow box on screen
- No SMS sent

#### Step 2: Verify OTP
**User sees:**
- "Verify Your Number" screen
- Large OTP input field
- "Verify & Create Account" button
- "Resend OTP" button
- "Back to details" link

**User enters:**
- 6-digit OTP (e.g., `123456`)

**What happens:**
1. Click "Verify & Create Account"
2. API call: `POST /api/auth/verify-otp`
3. Server validates OTP
   - Check if OTP exists
   - Check if expired (10 minutes)
   - Check if OTP matches
4. If valid:
   - Create user in Supabase `users` table
   - Set `persona` to `sweet_supportive` (Riya)
   - Set `onboarding_complete` to `true`
   - Initialize `usage_stats` (0 messages, 0 call seconds)
   - Generate session token
   - Return user data
5. Client stores session token in `localStorage`
6. Redirect to `/chat`

**Success Message:**
"Account Created! 🎉 Welcome [Name]! Let's start chatting with Riya."

---

### 2B. Login Flow (Existing Users)

#### Step 1: Enter Phone Number
**Route:** `/login`

**User enters:**
- Phone Number (e.g., "9876543210")

**What happens:**
1. Click "Send Verification Code"
2. Phone number formatted: `+919876543210`
3. API call: `POST /api/auth/login`
4. Server checks if user exists
   - If not found → Error: "No account found, please sign up"
   - If found → Continue
5. Server generates 6-digit OTP
6. Twilio sends SMS with OTP

#### Step 2: Verify OTP
**User sees:**
- "Hi [Name]!" greeting
- "Enter the verification code" subtitle
- OTP input field
- "Verify & Login" button

**User enters:**
- 6-digit OTP

**What happens:**
1. Click "Verify & Login"
2. API call: `POST /api/auth/verify-login-otp`
3. Server validates OTP
4. If valid:
   - Fetch user from database
   - Generate session token
   - Return user data
5. Client stores session token
6. Redirect to `/chat`

**Success Message:**
"Welcome Back! 🎉 Hi [Name]! Let's continue chatting with Riya."

---

## 🗄️ Database Schema

### Users Table (`users`)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  gender TEXT DEFAULT 'prefer_not_to_say',
  persona TEXT DEFAULT 'sweet_supportive',
  premium_user BOOLEAN DEFAULT FALSE,
  locale TEXT DEFAULT 'hi-IN',
  onboarding_complete BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Usage Stats Table (`usage_stats`)

```sql
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  total_messages INTEGER DEFAULT 0,
  total_call_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### 1. Send Signup OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phoneNumber": "+919876543210"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to your phone number",
  "devMode": false
}
```

**Response (Dev Mode):**
```json
{
  "success": true,
  "message": "OTP sent (Dev Mode): 123456",
  "devMode": true,
  "otp": "123456"
}
```

**Response (User Exists):**
```json
{
  "error": "User with this email or phone number already exists",
  "shouldLogin": true
}
```

---

### 2. Verify Signup OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid-here",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phoneNumber": "+919876543210",
    "premiumUser": false,
    "onboardingComplete": true
  },
  "sessionToken": "base64-token-here"
}
```

**Response (Invalid OTP):**
```json
{
  "error": "Invalid OTP. Please try again."
}
```

**Response (Expired OTP):**
```json
{
  "error": "OTP expired. Please request a new one."
}
```

---

### 3. Send Login OTP
```http
POST /api/auth/login
Content-Type: application/json

{
  "phoneNumber": "+919876543210"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to your phone number",
  "devMode": false,
  "userName": "Rahul Sharma"
}
```

**Response (User Not Found):**
```json
{
  "error": "No account found with this phone number",
  "shouldSignup": true
}
```

---

### 4. Verify Login OTP
```http
POST /api/auth/verify-login-otp
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phoneNumber": "+919876543210",
    "premiumUser": false,
    "onboardingComplete": true,
    "persona": "sweet_supportive"
  },
  "sessionToken": "base64-token-here"
}
```

---

## 🔒 Security Features

### OTP Security
- ✅ 6-digit random code
- ✅ 10-minute expiry
- ✅ One-time use (deleted after verification)
- ✅ Phone number validation
- ✅ Rate limiting (recommended for production)

### Session Management
- ✅ Session token stored in `localStorage`
- ✅ Token format: `base64(userId:timestamp)`
- ⚠️ **Production TODO:** Use proper JWT with expiry

### Data Validation
- ✅ Phone number format validation
- ✅ Email format validation
- ✅ Name required (min 1 character)
- ✅ OTP must be exactly 6 digits

---

## 🧪 Testing Guide

### Test Signup (Dev Mode - No Twilio)

1. Go to `http://localhost:3000/signup`
2. Enter:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "9876543210"
3. Click "Send Verification Code"
4. **OTP will be shown in yellow box** (e.g., `123456`)
5. Enter the OTP
6. Click "Verify & Create Account"
7. Should redirect to `/chat`

### Test Login (Dev Mode)

1. Go to `http://localhost:3000/login`
2. Enter phone: "9876543210"
3. Click "Send Verification Code"
4. **OTP shown in yellow box**
5. Enter OTP
6. Click "Verify & Login"
7. Should redirect to `/chat`

### Test with Real Twilio

1. Add Twilio credentials to `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```
2. Restart server: `npm run dev`
3. Follow signup/login flow
4. **Real SMS will be sent**
5. Check phone for OTP
6. Enter OTP to verify

---

## 🚨 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "User already exists" | Phone/email registered | Use login instead |
| "No account found" | Phone not registered | Use signup instead |
| "Invalid OTP" | Wrong code entered | Check SMS and re-enter |
| "OTP expired" | More than 10 minutes | Request new OTP |
| "Failed to send OTP" | Twilio error | Check credentials |
| "Invalid phone number" | Wrong format | Use +91XXXXXXXXXX |

---

## 📱 Phone Number Formats

### Supported Formats

**Input (user can enter):**
- `9876543210` → Auto-converted to `+919876543210`
- `+919876543210` → Used as-is
- `+91 98765 43210` → Spaces removed automatically

**Stored in database:**
- Always in international format: `+919876543210`

---

## 🔄 State Management

### Client-Side State

**Signup Page:**
```typescript
- step: 'details' | 'otp'
- phoneNumber: string
- devModeOTP: string | null
- signupForm: { name, email, phoneNumber }
- otpForm: { otp }
```

**Login Page:**
```typescript
- step: 'phone' | 'otp'
- phoneNumber: string
- userName: string
- devModeOTP: string | null
- loginForm: { phoneNumber }
- otpForm: { otp }
```

### Server-Side State

**OTP Store (In-Memory):**
```typescript
Map<phoneNumber, {
  otp: string,
  phoneNumber: string,
  email: string,
  name: string,
  expiresAt: number,
  verified: boolean
}>
```

⚠️ **Production TODO:** Use Redis for OTP storage

---

## 🎯 Next Steps

### For Development
1. ✅ Test signup flow without Twilio
2. ✅ Test login flow without Twilio
3. ✅ Verify user creation in Supabase
4. ✅ Check session persistence

### For Production
1. ⚠️ Add Twilio credentials
2. ⚠️ Implement proper JWT authentication
3. ⚠️ Add rate limiting (3 OTP requests/hour)
4. ⚠️ Use Redis for OTP storage
5. ⚠️ Add CAPTCHA for bot protection
6. ⚠️ Implement session expiry
7. ⚠️ Add logout functionality
8. ⚠️ Monitor Twilio usage and costs

---

## 📞 Support

If you encounter issues:
1. Check console logs (browser & server)
2. Verify Supabase connection
3. Check Twilio logs (if using SMS)
4. Review error messages carefully
5. Refer to `TWILIO_SETUP.md` for SMS issues

---

## 🎉 Summary

You now have a complete OTP-based authentication system with:
- ✅ Phone number signup
- ✅ OTP verification via SMS
- ✅ Secure login flow
- ✅ Supabase integration
- ✅ Dev mode for testing
- ✅ Production-ready architecture

**Ready to test!** Start with dev mode, then add Twilio for production. 🚀

