// Middleware to extract user ID from Supabase JWT token or session

import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xgraxcgavqeyqfwimbwt.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Create a Supabase client for verifying tokens
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  // 1. Try to get from session (if using session-based auth)
  if ((req as any).session?.userId) {
    return (req as any).session.userId;
  }

  // 2. Try to get from Authorization header (Supabase JWT)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      // Verify and decode the JWT token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        return user.id;
      }
    } catch (error) {
      console.warn('[getUserId] Error decoding token:', error);
    }
  }

  // 3. Try to get from request body (some endpoints send userId)
  if (req.body?.userId) {
    return req.body.userId;
  }

  // 4. Try to get from query params
  if (req.query?.userId) {
    return req.query.userId as string;
  }

  return null;
}


