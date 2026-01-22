/**
 * Supabase Phone OTP Authentication Helper
 * 
 * Uses Supabase's built-in phone authentication with Vonage
 */

import { supabase } from './supabase';

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
 * Send OTP to phone number using Supabase
 */
export async function sendOTP(phoneNumber: string, metadata?: { name?: string; email?: string }): Promise<void> {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  console.log('[Supabase Auth] Sending OTP to:', normalized);
  console.log('[Supabase Auth] Metadata:', metadata);
  
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: normalized,
    options: {
      data: metadata || {},
    },
  });
  
  if (error) {
    console.error('[Supabase Auth] Send OTP error:', error);
    console.error('[Supabase Auth] Error details:', {
      status: error.status,
      message: error.message,
      name: error.name,
    });
    
    // Provide more specific error messages
    if (error.status === 403) {
      throw new Error('Phone authentication is not enabled or SMS provider is not configured. Please check your Supabase settings.');
    } else if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.message?.includes('Invalid')) {
      throw new Error('Invalid phone number format. Please use a valid phone number.');
    } else if (error.message?.includes('SMS') || error.message?.includes('provider')) {
      throw new Error('SMS provider error. Please check your Vonage configuration in Supabase Dashboard.');
    }
    
    throw new Error(error.message || 'Failed to send OTP');
  }
  
  console.log('[Supabase Auth] OTP sent successfully');
  console.log('[Supabase Auth] Response data:', data);
  
  // Check if there's a message ID or any delivery info
  if (data) {
    console.log('[Supabase Auth] Full response:', JSON.stringify(data, null, 2));
  }
  
  // Note: Supabase doesn't return the OTP in the response for security
  // The OTP is sent via SMS only
  // If SMS doesn't arrive, check:
  // 1. Supabase Dashboard → Logs → Auth Logs
  // 2. Vonage Dashboard → Messages → Outbound
  // 3. Verify Vonage credentials are saved in Supabase Dashboard
}

/**
 * Verify OTP code using Supabase
 */
export async function verifyOTP(phoneNumber: string, otpCode: string): Promise<{ session: any; user: any }> {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  console.log('[Supabase Auth] Verifying OTP for:', normalized);
  
  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token: otpCode,
    type: 'sms',
  });
  
  if (error) {
    console.error('[Supabase Auth] Verify OTP error:', error);
    
    // Provide more specific error messages
    if (error.status === 403) {
      throw new Error('Phone authentication is not enabled or SMS provider is not configured. Please check your Supabase settings.');
    } else if (error.message?.includes('Invalid token') || error.message?.includes('expired')) {
      throw new Error('OTP code has expired or is invalid. Please request a new one.');
    } else if (error.message?.includes('not found')) {
      throw new Error('No OTP request found. Please request a new OTP.');
    }
    
    throw new Error(error.message || 'Failed to verify OTP');
  }
  
  if (!data.session) {
    throw new Error('No session returned from verification');
  }
  
  console.log('[Supabase Auth] OTP verified successfully');
  
  return {
    session: data.session,
    user: data.user,
  };
}

/**
 * Create or update user profile in Supabase after OTP verification
 */
export async function createOrUpdateUserProfile(
  userId: string,
  profileData: {
    name: string;
    email: string;
    phoneNumber: string;
  }
): Promise<any> {
  // Check if user profile exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (existingUser) {
    // Update existing user
    const { data, error } = await supabase
      .from('users')
      .update({
        name: profileData.name,
        email: profileData.email,
        phone_number: profileData.phoneNumber,
        phone_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('[Supabase Auth] Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
    
    return data;
  } else {
    // Create new user profile
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: profileData.name,
        email: profileData.email,
        phone_number: profileData.phoneNumber,
        phone_confirmed_at: new Date().toISOString(),
        gender: 'prefer_not_to_say',
        persona: 'sweet_supportive',
        premium_user: false,
        subscription_plan: null,
        subscription_expiry: null,
        subscription_tier: null,
        subscription_start_time: null,
        subscription_end_time: null,
        locale: 'en-US',
        onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('[Supabase Auth] Error creating user profile:', error);
      
      // Handle duplicate email/phone errors
      if (error.code === '23505') {
        if (error.message?.includes('email')) {
          throw new Error('An account with this email already exists. Please login instead.');
        } else if (error.message?.includes('phone_number')) {
          throw new Error('An account with this phone number already exists. Please login instead.');
        }
      }
      
      throw new Error('Failed to create user profile');
    }
    
    // Initialize usage stats
    await supabase
      .from('usage_stats')
      .insert({
        user_id: userId,
        total_messages: 0,
        total_call_seconds: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    return data;
  }
}
