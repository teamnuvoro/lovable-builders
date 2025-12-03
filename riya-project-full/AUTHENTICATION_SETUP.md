# 🔐 Authentication Setup Guide

## Complete OTP-Based Authentication Workflow

This app uses **phone number + OTP** authentication powered by **Twilio SMS** and **Supabase** for data storage.

---

## 📋 Features

✅ **Signup Flow:**
1. User enters: Name, Email, Phone Number
2. OTP sent via Twilio SMS to phone
3. User verifies OTP
4. Account created in Supabase
5. Auto-login and redirect to chat

✅ **Login Flow:**
1. User enters phone number
2. System checks if account exists
3. OTP sent to registered phone
4. User verifies OTP
5. Session created and redirect to chat

✅ **Security:**
- OTP expires in 10 minutes
- Phone number validation
- Duplicate account prevention
- Session token management

---

## 🚀 Quick Start (Dev Mode)

### Without Twilio (Development)

The app works **without Twilio** in development mode:

```bash
# Just start the app
npm run dev
```

**What happens:**
- OTPs are printed in the **terminal console**
- OTPs are shown in the **API response** (visible in browser dev tools)
- No SMS sent (perfect for testing)

**Example terminal output:**
```
[DEV MODE] OTP for +919876543210: 123456
```

---

## 📱 Production Setup (Twilio SMS)

### Step 1: Get Twilio Credentials

1. **Sign up at Twilio:**
   - Go to: https://www.twilio.com/try-twilio
   - Sign up for free account
   - Get $15 free credit

2. **Get your credentials:**
   - Go to: https://console.twilio.com/
   - Copy these 3 values:
     - **Account SID** (starts with `AC...`)
     - **Auth Token** (secret key)
     - **Phone Number** (your Twilio number, format: `+1234567890`)

### Step 2: Add to .env File

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Restart Server

```bash
npm run dev
```

**Now OTPs will be sent via SMS! 📲**

---

## 🗄️ Database Setup (Supabase)

### Required Tables

The authentication system uses these Supabase tables:

#### 1. `users` table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  gender TEXT DEFAULT 'prefer_not_to_say',
  persona TEXT DEFAULT 'sweet_supportive',
  premium_user BOOLEAN DEFAULT false,
  locale TEXT DEFAULT 'hi-IN',
  onboarding_complete BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `usage_stats` table
```sql
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_messages INTEGER DEFAULT 0,
  total_call_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Setup in Supabase:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Run the SQL above
5. Tables created! ✅

---

## 🔄 Complete User Journey

### New User Signup

```
Landing Page
    ↓ Click "Let's Get Started"
Signup Form (Name, Email, Phone)
    ↓ Click "Get Verification Code"
OTP Sent via SMS (or shown in dev mode)
    ↓ Enter 6-digit OTP
OTP Verified
    ↓
Account Created in Supabase
    ↓
Success Screen (2 seconds)
    ↓
Redirect to Chat with Riya 💬
```

### Existing User Login

```
Landing Page
    ↓ Click "Login"
Login Form (Phone Number)
    ↓ Click "Send Verification Code"
System checks if user exists
    ↓
OTP Sent via SMS
    ↓ Enter 6-digit OTP
OTP Verified
    ↓
Session Created
    ↓
Redirect to Chat 💬
```

---

## 🧪 Testing the Flow

### Test Signup (Dev Mode)

1. Go to: http://localhost:3000/signup
2. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Phone: `9876543210`
3. Click "Get Verification Code"
4. **Check terminal** for OTP (e.g., `123456`)
5. Enter OTP
6. ✅ Account created!

### Test Login

1. Go to: http://localhost:3000/login
2. Enter phone: `9876543210`
3. Click "Send Verification Code"
4. **Check terminal** for OTP
5. Enter OTP
6. ✅ Logged in!

---

## 🛠️ API Endpoints

### Signup Flow

#### 1. Send OTP for Signup
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+919876543210"
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

**Response (Production):**
```json
{
  "success": true,
  "message": "OTP sent to your phone number",
  "devMode": false
}
```

#### 2. Verify OTP and Create Account
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "premiumUser": false,
    "onboardingComplete": true
  },
  "sessionToken": "base64-token-here"
}
```

### Login Flow

#### 1. Send OTP for Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phoneNumber": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent (Dev Mode): 654321",
  "devMode": true,
  "otp": "654321",
  "userName": "John Doe"
}
```

#### 2. Verify Login OTP
```http
POST /api/auth/verify-login-otp
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "otp": "654321"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "premiumUser": false,
    "persona": "sweet_supportive"
  },
  "sessionToken": "base64-token-here"
}
```

---

## 🔒 Security Features

### OTP Security
- ✅ 6-digit random OTP
- ✅ 10-minute expiration
- ✅ One-time use only
- ✅ Deleted after verification

### Phone Number Validation
- ✅ International format required (`+919876543210`)
- ✅ Auto-adds `+91` for Indian numbers
- ✅ Duplicate prevention

### Session Management
- ✅ Session token stored in localStorage
- ✅ Token includes user ID + timestamp
- ✅ Base64 encoded

---

## 📊 Database Storage

### What Gets Saved in Supabase

**On Signup:**
```sql
INSERT INTO users (name, email, phone_number, persona, premium_user, onboarding_complete)
VALUES ('John Doe', 'john@example.com', '+919876543210', 'sweet_supportive', false, true);

INSERT INTO usage_stats (user_id, total_messages, total_call_seconds)
VALUES ('user-uuid', 0, 0);
```

**Data Stored:**
- ✅ Name, Email, Phone Number
- ✅ Default persona: `sweet_supportive` (Riya)
- ✅ Premium status: `false` (free tier)
- ✅ Onboarding: `true` (skip persona selection)
- ✅ Usage stats initialized to 0

---

## 🐛 Troubleshooting

### Issue: "Failed to send OTP"

**Solution:**
1. Check if Twilio credentials are correct
2. Verify phone number format (`+919876543210`)
3. Check Twilio account balance
4. Use dev mode for testing (remove Twilio env vars)

### Issue: "User already exists"

**Solution:**
- This phone/email is registered
- Use the **Login** page instead
- Or use a different phone/email

### Issue: "OTP expired"

**Solution:**
- OTPs expire after 10 minutes
- Click "Resend OTP" to get a new code

### Issue: "Invalid OTP"

**Solution:**
- Double-check the 6-digit code
- Make sure you're entering the latest OTP
- In dev mode, check terminal for correct OTP

---

## 🎯 Next Steps

1. ✅ **Test signup flow** in dev mode
2. ✅ **Test login flow** in dev mode
3. 📱 **Add Twilio credentials** for production
4. 🗄️ **Verify Supabase tables** are created
5. 🚀 **Deploy and test** with real SMS

---

## 📞 Support

**Need help?**
- Check terminal logs for OTP (dev mode)
- Verify Supabase connection
- Test with Twilio Console (send test SMS)
- Check browser console for API errors

---

## 🎉 You're All Set!

Your authentication system is ready:
- ✅ OTP-based signup
- ✅ OTP-based login
- ✅ Supabase storage
- ✅ Twilio SMS (optional)
- ✅ Dev mode for testing

**Start the app and test it out! 🚀**

```bash
npm run dev
```

Then visit: http://localhost:3000

