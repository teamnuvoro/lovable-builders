/**
 * OTP Request Storage
 * 
 * Temporarily stores Vonage request_id mapped to phone numbers
 * Used to verify OTP requests match the original send-otp call
 * 
 * Security: Prevents OTP replay attacks and ensures request_id belongs to the phone number
 * 
 * Production: Use Redis with TTL instead of in-memory storage
 */

interface OTPRequest {
  requestId: string;
  phoneNumber: string;
  createdAt: number;
  expiresAt: number;
  attemptCount: number;
  maxAttempts: number;
}

// In-memory storage (use Redis in production)
const otpRequests = new Map<string, OTPRequest>();

// Configuration
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFICATION_ATTEMPTS = 3;

/**
 * Normalize phone number for storage key
 */
function normalizeKey(phoneNumber: string): string {
  return phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
}

/**
 * Store OTP request
 * 
 * @param phoneNumber - Phone number
 * @param requestId - Vonage request_id
 */
export function storeOTPRequest(phoneNumber: string, requestId: string): void {
  const key = normalizeKey(phoneNumber);
  const now = Date.now();
  
  // Cancel previous OTP if exists
  const existing = otpRequests.get(key);
  if (existing) {
    console.log('[OTP Storage] Replacing existing OTP request for:', phoneNumber);
  }
  
  otpRequests.set(key, {
    requestId,
    phoneNumber,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    attemptCount: 0,
    maxAttempts: MAX_VERIFICATION_ATTEMPTS,
  });
  
  console.log('[OTP Storage] Stored request_id for:', phoneNumber, 'expires in', OTP_EXPIRY_MS / 1000, 'seconds');
}

/**
 * Get stored request_id for phone number
 * 
 * @param phoneNumber - Phone number
 * @returns request_id or null if not found/expired
 */
export function getOTPRequest(phoneNumber: string): OTPRequest | null {
  const key = normalizeKey(phoneNumber);
  const request = otpRequests.get(key);
  
  if (!request) {
    return null;
  }
  
  // Check expiry
  if (Date.now() > request.expiresAt) {
    console.log('[OTP Storage] Request expired for:', phoneNumber);
    otpRequests.delete(key);
    return null;
  }
  
  return request;
}

/**
 * Increment attempt count for OTP verification
 * Returns true if attempts exceeded
 */
export function incrementAttempt(phoneNumber: string): boolean {
  const key = normalizeKey(phoneNumber);
  const request = otpRequests.get(key);
  
  if (!request) {
    return false;
  }
  
  request.attemptCount++;
  
  if (request.attemptCount >= request.maxAttempts) {
    console.log('[OTP Storage] Max attempts reached for:', phoneNumber);
    // Don't delete - keep it to show error message
    return true;
  }
  
  return false;
}

/**
 * Remove OTP request (after successful verification or expiry)
 */
export function removeOTPRequest(phoneNumber: string): void {
  const key = normalizeKey(phoneNumber);
  otpRequests.delete(key);
  console.log('[OTP Storage] Removed request for:', phoneNumber);
}

/**
 * Clean up expired requests
 */
export function cleanupExpiredRequests(): void {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, request] of otpRequests.entries()) {
    if (now > request.expiresAt) {
      otpRequests.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log('[OTP Storage] Cleaned up', cleaned, 'expired requests');
  }
}

// Cleanup every minute
setInterval(cleanupExpiredRequests, 60 * 1000);
