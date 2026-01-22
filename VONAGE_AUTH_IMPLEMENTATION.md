# Vonage OTP Authentication Implementation

## Overview

Complete migration from Firebase Phone Auth to Vonage Verify API for OTP authentication. All OTP operations are server-side only with no client-side secrets.

## Architecture

```
Frontend (React) → Backend API → Vonage Verify API → SMS
                              ↓
                         Supabase (User Storage)
```

## Security Features

✅ **Server-side only secrets** - Vonage API keys never exposed to client  
✅ **Rate limiting** - IP-based (5 req/15min) + Phone-based (3 req/15min)  
✅ **Attempt tracking** - Max 3 OTP verification attempts per request  
✅ **OTP expiry** - 5 minutes TTL  
✅ **No reCAPTCHA** - Not required with Vonage  
✅ **No Firebase** - Completely removed  

## Files Created

### Backend

1. **`server/utils/rateLimiter.ts`**
   - IP and phone number rate limiting
   - Automatic cleanup of expired entries
   - Block duration after limit exceeded

2. **`server/services/vonage.ts`**
   - Vonage Verify API wrapper
   - `sendOTP()` - Sends 6-digit OTP via SMS
   - `verifyOTP()` - Verifies OTP code
   - Phone number normalization

3. **`server/utils/otpStorage.ts`**
   - Temporary storage for request_id → phone mapping
   - TTL-based expiry (5 minutes)
   - Attempt tracking (max 3 attempts)

4. **`server/utils/supabaseAdmin.ts`**
   - Supabase Admin API helper
   - Creates/gets users with phone authentication
   - Issues session tokens

5. **`server/routes/auth.ts`** (Updated)
   - `POST /api/auth/send-otp` - Send OTP endpoint
   - `POST /api/auth/verify-otp` - Verify OTP endpoint
   - Removed Firebase endpoints

### Frontend

1. **`client/src/lib/vonageAuth.ts`**
   - Client-side helper for Vonage OTP
   - `sendOTP()` - Calls backend to send OTP
   - `verifyOTP()` - Calls backend to verify OTP

2. **`client/src/pages/LoginPage.tsx`** (Updated)
   - Removed Firebase/reCAPTCHA code
   - Uses Vonage endpoints

3. **`client/src/pages/SignupPage.tsx`** (Updated)
   - Removed Firebase/reCAPTCHA code
   - Uses Vonage endpoints

4. **`client/index.html`** (Updated)
   - Removed reCAPTCHA container

### Removed Files

- `client/src/lib/firebase.ts` - Deleted
- `client/src/lib/phoneAuth.ts` - Deleted

## Environment Variables Required

Add to `.env`:

```env
# Vonage API Credentials (server-side only)
VONAGE_API_KEY=your_vonage_api_key
VONAGE_API_SECRET=your_vonage_api_secret

# Supabase (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## API Endpoints

### POST `/api/auth/send-otp`

**Request:**
```json
{
  "phoneNumber": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Rate Limits:**
- IP: 5 requests per 15 minutes
- Phone: 3 requests per 15 minutes

### POST `/api/auth/verify-otp`

**Request:**
```json
{
  "phoneNumber": "+919876543210",
  "otpCode": "123456",
  "name": "John Doe",  // Required for signup
  "email": "john@example.com"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "premiumUser": true,
    "onboardingComplete": true,
    "persona": "sweet_supportive"
  },
  "sessionToken": "base64_encoded_token"
}
```

**Attempt Limits:**
- Max 3 verification attempts per OTP
- OTP expires after 5 minutes

## Error Handling

### Rate Limit Exceeded (429)
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 900  // seconds
}
```

### Invalid OTP (400)
```json
{
  "error": "Invalid OTP code",
  "remainingAttempts": 2
}
```

### OTP Expired (400)
```json
{
  "error": "OTP request not found or expired. Please request a new OTP."
}
```

### Max Attempts Exceeded (429)
```json
{
  "error": "Maximum verification attempts exceeded. Please request a new OTP."
}
```

## Frontend Usage

### Login Flow

```typescript
import { sendOTP, verifyOTP } from '@/lib/vonageAuth';

// Step 1: Send OTP
await sendOTP('+919876543210');

// Step 2: Verify OTP
const { user, sessionToken } = await verifyOTP(
  '+919876543210',
  '123456'
);
```

### Signup Flow

```typescript
// Step 1: Send OTP
await sendOTP('+919876543210');

// Step 2: Verify OTP with user details
const { user, sessionToken } = await verifyOTP(
  '+919876543210',
  '123456',
  'John Doe',  // name
  'john@example.com'  // email
);
```

## Production Considerations

1. **Replace in-memory storage with Redis** for distributed systems
2. **Add monitoring** for rate limit violations
3. **Set up alerts** for Vonage API errors
4. **Rotate API keys** periodically
5. **Monitor SMS costs** and set budget alerts

## Testing

1. Use Vonage test numbers (if available) for development
2. Test rate limiting by sending multiple requests
3. Test OTP expiry by waiting 5+ minutes
4. Test attempt limits by entering wrong OTP 3 times
5. Verify user creation in Supabase after successful signup

## Migration Checklist

- [x] Create rate limiting utility
- [x] Create Vonage service wrapper
- [x] Create OTP storage utility
- [x] Create Supabase Admin helper
- [x] Create send-otp endpoint
- [x] Create verify-otp endpoint
- [x] Update LoginPage
- [x] Update SignupPage
- [x] Remove Firebase code
- [x] Remove reCAPTCHA container
- [ ] Add Vonage API credentials to `.env`
- [ ] Test end-to-end flow
- [ ] Deploy to production
