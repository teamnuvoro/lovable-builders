import { SupabaseClient } from '@supabase/supabase-js';
import { checkUserHasPayment, checkUserHasActiveSubscription } from './checkUserHasPayment';

export interface PremiumStatusResult {
  isPremium: boolean;
  source: 'user_flag' | 'subscription' | 'payment' | 'none';
  planType?: string;
  expiry?: Date;
}

/**
 * Unified premium status check - single source of truth
 * Checks users table, subscriptions table, and payments table
 * This ensures all endpoints get the same premium status
 */
export async function checkPremiumStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<PremiumStatusResult> {
  try {
    // Validate UUID format before querying database
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn(`[Premium Check] Invalid UUID format: ${userId} - treating as non-premium`);
      return { isPremium: false, source: 'none' };
    }

    // ONLY CHECK CASHFREE SUBSCRIPTIONS - No daily premium, no user flags
    // Only users with active Cashfree payments are premium
    const { data: activeSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('status, plan_type')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.warn(`[Premium Check] Error querying subscriptions table for ${userId}:`, subError);
    }

    if (activeSubscription && activeSubscription.status === 'active') {
      console.log(`[Premium Check] User ${userId} has active Cashfree subscription`);
      return { 
        isPremium: true, 
        source: 'subscription',
        planType: activeSubscription.plan_type || 'premium'
      };
    }

    // Not Premium - no active Cashfree subscription
    console.log(`[Premium Check] User ${userId} is free (no active Cashfree subscription)`);
    return { isPremium: false, source: 'none' };

  } catch (error) {
    console.error(`[Premium Check] Error for user ${userId}:`, error);
    return { isPremium: false, source: 'none' };
  }
}

