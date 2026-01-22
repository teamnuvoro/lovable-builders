import { Router, Request, Response } from 'express';
import { supabase, isSupabaseConfigured } from '../supabase';
import * as crypto from 'crypto';
import { rateLimitOTP } from '../utils/rateLimiter';
import { sendOTP as vonageSendOTP, verifyOTP as vonageVerifyOTP, normalizePhoneNumber } from '../services/vonage';
import { storeOTPRequest, getOTPRequest, incrementAttempt, removeOTPRequest } from '../utils/otpStorage';
import { createOrGetUserByPhone } from '../utils/supabaseAdmin';

const router = Router();

// Old Twilio-based endpoints removed - using Vonage Verify API instead

// GET /api/auth/check - Check if user is authenticated (stub for now)
router.get('/api/auth/check', async (req: Request, res: Response) => {
    // In production, verify JWT token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ authenticated: false });
    }

    // For now, just return authenticated if header exists
    res.json({ authenticated: true });
});

// POST /api/auth/logout - Logout user
router.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
        // Clear session
        if ((req as any).session) {
            (req as any).session = null;
        }

        console.log('[Auth] User logged out');
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
        console.error('[Auth] Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// =====================================================
// VONAGE OTP AUTHENTICATION (Production)
// =====================================================

/**
 * POST /api/auth/send-otp
 * 
 * Send OTP via Vonage Verify API
 * 
 * Security:
 * - Rate limiting (IP + phone)
 * - Server-side only (no client secrets)
 * - Request ID stored temporarily for verification
 * 
 * Body: { phoneNumber: string }
 * Response: { success: boolean, message: string }
 */
router.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Normalize phone number
    const normalized = normalizePhoneNumber(phoneNumber);
    
    // Validate phone format (basic check)
    if (!/^\+91\d{10}$/.test(normalized)) {
      return res.status(400).json({ error: 'Invalid phone number format. Please use 10-digit Indian number.' });
    }

    // Rate limiting
    const rateLimit = rateLimitOTP(req, normalized);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: rateLimit.error,
        retryAfter: rateLimit.retryAfter,
      });
    }

    // Check if Vonage is configured
    if (!process.env.VONAGE_API_KEY || !process.env.VONAGE_API_SECRET) {
      console.error('[Send OTP] Vonage credentials not configured');
      return res.status(500).json({ error: 'OTP service not configured' });
    }

    // Send OTP via Vonage
    let requestId: string;
    try {
      requestId = await vonageSendOTP(normalized);
    } catch (error: any) {
      console.error('[Send OTP] Vonage error:', error);
      return res.status(500).json({ error: error.message || 'Failed to send OTP' });
    }

    // Store request_id for verification
    storeOTPRequest(normalized, requestId);

    console.log('[Send OTP] OTP sent to:', normalized);

    res.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error: any) {
    console.error('[Send OTP] Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

/**
 * POST /api/auth/verify-otp
 * 
 * Verify OTP and authenticate user
 * 
 * Security:
 * - Server-side verification only
 * - Max 3 attempts per OTP
 * - Creates/updates Supabase user
 * - Returns session token
 * 
 * Body: { phoneNumber: string, otpCode: string, name?: string, email?: string }
 * Response: { success: boolean, user: object, sessionToken: string }
 */
router.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otpCode, name, email } = req.body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!otpCode || typeof otpCode !== 'string' || !/^\d{6}$/.test(otpCode)) {
      return res.status(400).json({ error: 'OTP code must be 6 digits' });
    }

    // Normalize phone number
    const normalized = normalizePhoneNumber(phoneNumber);

    // Get stored request_id
    const otpRequest = getOTPRequest(normalized);
    if (!otpRequest) {
      return res.status(400).json({
        error: 'OTP request not found or expired. Please request a new OTP.',
      });
    }

    // Check attempt limit
    if (otpRequest.attemptCount >= otpRequest.maxAttempts) {
      return res.status(429).json({
        error: 'Maximum verification attempts exceeded. Please request a new OTP.',
      });
    }

    // Increment attempt count
    const attemptsExceeded = incrementAttempt(normalized);
    if (attemptsExceeded) {
      return res.status(429).json({
        error: 'Maximum verification attempts exceeded. Please request a new OTP.',
      });
    }

    // Verify OTP with Vonage
    let isValid: boolean;
    try {
      isValid = await vonageVerifyOTP(otpRequest.requestId, otpCode);
    } catch (error: any) {
      console.error('[Verify OTP] Vonage error:', error);
      
      // Don't reveal if it's expired vs invalid - generic message
      if (error.message?.includes('expired')) {
        removeOTPRequest(normalized);
        return res.status(400).json({ error: 'OTP code has expired. Please request a new one.' });
      }
      
      return res.status(400).json({ error: error.message || 'Invalid OTP code' });
    }

    if (!isValid) {
      const remainingAttempts = otpRequest.maxAttempts - otpRequest.attemptCount;
      return res.status(400).json({
        error: 'Invalid OTP code',
        remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0,
      });
    }

    // OTP verified - create or get user
    try {
      const { user, sessionToken } = await createOrGetUserByPhone(normalized, name, email);

      // Remove OTP request (successful verification)
      removeOTPRequest(normalized);

      console.log('[Verify OTP] User authenticated:', user.id);

        res.json({
            success: true,
        message: 'OTP verified successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phone_number,
                premiumUser: user.premium_user,
                onboardingComplete: user.onboarding_complete,
          persona: user.persona,
            },
            sessionToken,
        });
    } catch (error: any) {
      console.error('[Verify OTP] Error creating/getting user:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already exists')) {
        return res.status(409).json({ 
          error: error.message,
          shouldLogin: true 
        });
      }
      
      if (error.message?.includes('No account found') || error.message?.includes('Please signup')) {
        return res.status(404).json({ 
          error: error.message,
          shouldSignup: true 
        });
      }
      
      return res.status(500).json({ error: error.message || 'Failed to authenticate user' });
    }
  } catch (error: any) {
    console.error('[Verify OTP] Error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

export default router;

