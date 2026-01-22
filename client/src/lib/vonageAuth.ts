/**
 * Vonage OTP Authentication Helper
 * 
 * Client-side helper for Vonage OTP authentication
 * All actual OTP sending/verification happens server-side
 */

import { apiRequest } from './queryClient';

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+')) {
    if (/^\d{10}$/.test(cleaned)) {
      cleaned = `+91${cleaned}`;
    } else if (/^91\d{10}$/.test(cleaned)) {
      cleaned = `+${cleaned}`;
    } else if (/^\d+$/.test(cleaned)) {
      cleaned = `+91${cleaned}`;
    }
  }
  
  return cleaned;
}

/**
 * Send OTP to phone number
 */
export async function sendOTP(phoneNumber: string): Promise<void> {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  const response = await apiRequest('POST', '/api/auth/send-otp', {
    phoneNumber: normalized,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send OTP');
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  phoneNumber: string,
  otpCode: string,
  name?: string,
  email?: string
): Promise<{ user: any; sessionToken: string }> {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  const response = await apiRequest('POST', '/api/auth/verify-otp', {
    phoneNumber: normalized,
    otpCode,
    name,
    email,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to verify OTP');
  }
  
  const data = await response.json();
  return {
    user: data.user,
    sessionToken: data.sessionToken,
  };
}
