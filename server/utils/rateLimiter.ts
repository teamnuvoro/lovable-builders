/**
 * Rate Limiter for OTP requests
 * 
 * Security: Prevents OTP spam by limiting requests per IP and phone number
 * - IP-based: Max 5 requests per 15 minutes
 * - Phone-based: Max 3 requests per 15 minutes
 * 
 * Uses in-memory storage with automatic cleanup (production should use Redis)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

// In-memory storage (use Redis in production for distributed systems)
const ipLimits = new Map<string, RateLimitEntry>();
const phoneLimits = new Map<string, RateLimitEntry>();

// Configuration
const IP_LIMIT = 5; // Max requests per IP
const PHONE_LIMIT = 3; // Max requests per phone number
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes block after limit exceeded

/**
 * Get client IP address from request
 */
function getClientIP(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Check if a key is rate limited
 */
function checkLimit(
  key: string,
  limit: number,
  storage: Map<string, RateLimitEntry>
): { allowed: boolean; remaining: number; resetAt: number; blocked: boolean } {
  const now = Date.now();
  const entry = storage.get(key);

  // Check if blocked
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      blocked: true,
    };
  }

  // Clean up expired entries
  if (entry && entry.resetAt < now) {
    storage.delete(key);
  }

  // No entry or expired - allow
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    storage.set(key, newEntry);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: newEntry.resetAt,
      blocked: false,
    };
  }

  // Within window - check count
  if (entry.count >= limit) {
    // Block for extended period
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      blocked: true,
    };
  }

  // Increment count
  entry.count++;
  storage.set(key, entry);

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
    blocked: false,
  };
}

/**
 * Rate limit middleware for OTP requests
 * Checks both IP and phone number limits
 */
export function rateLimitOTP(req: any, phoneNumber: string): {
  allowed: boolean;
  error?: string;
  retryAfter?: number;
} {
  const ip = getClientIP(req);
  const normalizedPhone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');

  // Check IP limit
  const ipCheck = checkLimit(ip, IP_LIMIT, ipLimits);
  if (!ipCheck.allowed) {
    const retryAfter = Math.ceil((ipCheck.resetAt - Date.now()) / 1000);
    return {
      allowed: false,
      error: ipCheck.blocked
        ? 'Too many requests from this IP. Please try again later.'
        : 'Rate limit exceeded. Please try again later.',
      retryAfter,
    };
  }

  // Check phone limit
  const phoneCheck = checkLimit(normalizedPhone, PHONE_LIMIT, phoneLimits);
  if (!phoneCheck.allowed) {
    const retryAfter = Math.ceil((phoneCheck.resetAt - Date.now()) / 1000);
    return {
      allowed: false,
      error: phoneCheck.blocked
        ? 'Too many OTP requests for this number. Please try again later.'
        : 'Rate limit exceeded for this phone number. Please try again later.',
      retryAfter,
    };
  }

  return { allowed: true };
}

/**
 * Clean up old entries (call periodically in production)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  
  for (const [key, entry] of ipLimits.entries()) {
    if (entry.resetAt < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
      ipLimits.delete(key);
    }
  }
  
  for (const [key, entry] of phoneLimits.entries()) {
    if (entry.resetAt < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
      phoneLimits.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);
