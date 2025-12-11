import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Check if user has any successful payments
 * This is the source of truth for premium access
 */
export async function checkUserHasPayment(
  supabase: SupabaseClient,
  userId: string
): Promise<{ hasPayment: boolean; planType?: string; latestPaymentDate?: Date }> {
  try {
    // Check for successful payments
    const { data: payments, error } = await supabase
      .from('payments')
      .select('plan_type, created_at, status')
      .eq('user_id', userId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn(`[Payment Check] Error checking payments for user ${userId}:`, error);
      return { hasPayment: false };
    }

    if (payments && payments.length > 0) {
      const latestPayment = payments[0];
      return {
        hasPayment: true,
        planType: latestPayment.plan_type || 'daily',
        latestPaymentDate: new Date(latestPayment.created_at)
      };
    }

    return { hasPayment: false };
  } catch (error) {
    console.error(`[Payment Check] Unexpected error for user ${userId}:`, error);
    return { hasPayment: false };
  }
}

/**
 * Check if user has active subscription (alternative check)
 */
export async function checkUserHasActiveSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, status, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1);

    if (error) {
      console.warn(`[Subscription Check] Error for user ${userId}:`, error);
      return false;
    }

    if (subscriptions && subscriptions.length > 0) {
      const subscription = subscriptions[0];
      // Check if subscription hasn't expired
      if (subscription.expires_at) {
        const expiry = new Date(subscription.expires_at);
        return expiry > new Date();
      }
      return true; // Active subscription without expiry
    }

    return false;
  } catch (error) {
    console.error(`[Subscription Check] Unexpected error for user ${userId}:`, error);
    return false;
  }
}

