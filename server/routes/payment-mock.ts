import { Router, Request, Response } from 'express';
import { supabase, isSupabaseConfigured } from '../supabase';

const router = Router();
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * MOCK PAYMENT MODE - Bypasses Cashfree entirely for local testing
 * 
 * To enable:
 * 1. Set MOCK_PAYMENTS=true in .env
 * 2. This route will simulate successful payments
 * 3. Perfect for testing upgrade triggers and database flows
 */

// Mock payment config
router.get('/api/payment/config', (_req: Request, res: Response) => {
  res.json({
    cashfreeMode: 'mock',
    currency: 'INR',
    plans: {
      daily: 19,
      weekly: 49,
    },
  });
});

// Mock create order - immediately returns success
router.post('/api/payment/create-order', async (req: Request, res: Response) => {
  try {
    const { planType } = req.body;
    const userId = (req as any).session?.userId || req.body.userId || DEV_USER_ID;

    if (!planType || !['daily', 'weekly'].includes(planType)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    console.log('🎭 [MOCK PAYMENT] Creating mock order for user:', userId, 'plan:', planType);

    const plans = { daily: 19, weekly: 49 };
    const amount = plans[planType];
    const orderId = `mock_order_${Date.now()}_${userId.slice(0, 8)}`;

    // Immediately mark as successful in database
    if (isSupabaseConfigured) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (planType === 'weekly' ? 7 : 1));

      // Create subscription
      await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_type: planType,
        amount: amount,
        currency: 'INR',
        status: 'active',
        cashfree_order_id: orderId,
        started_at: startDate.toISOString(),
        expires_at: endDate.toISOString(),
        created_at: new Date().toISOString(),
      });

      // Create payment record
      await supabase.from('payments').insert({
        user_id: userId,
        amount: amount,
        currency: 'INR',
        cashfree_order_id: orderId,
        status: 'success',
        payment_method: 'mock',
        created_at: new Date().toISOString(),
      });

      console.log('✅ [MOCK PAYMENT] Payment and subscription created successfully');
    }

    // Return mock response
    res.json({
      order_id: orderId,
      payment_session_id: `mock_session_${orderId}`,
      amount,
      currency: 'INR',
      planType,
      mock: true, // Flag to indicate this is a mock payment
    });
  } catch (error: any) {
    console.error('[MOCK PAYMENT] Error:', error);
    res.status(500).json({ error: 'Failed to create mock order', details: error.message });
  }
});

// Mock verify payment - always returns success
router.post('/api/payment/verify', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const userId = (req as any).session?.userId || req.body.userId || DEV_USER_ID;

    console.log('🎭 [MOCK PAYMENT] Verifying mock order:', orderId);

    if (isSupabaseConfigured) {
      // Check if payment exists
      const { data: payment } = await supabase
        .from('payments')
        .select('*, subscriptions(*)')
        .eq('cashfree_order_id', orderId)
        .eq('user_id', userId)
        .single();

      if (payment && payment.status === 'success') {
        return res.json({
          success: true,
          orderId,
          planType: payment.subscriptions?.[0]?.plan_type || 'daily',
          endDate: payment.subscriptions?.[0]?.expires_at,
        });
      }
    }

    // Default success for mock
    res.json({
      success: true,
      orderId,
      planType: 'daily',
      mock: true,
    });
  } catch (error: any) {
    console.error('[MOCK PAYMENT] Verify error:', error);
    res.status(500).json({ error: 'Failed to verify mock payment', details: error.message });
  }
});

export default router;

