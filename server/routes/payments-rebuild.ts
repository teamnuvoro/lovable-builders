import { Router, Request, Response } from 'express';
import { supabase, isSupabaseConfigured } from '../supabase';
import crypto from 'crypto';

const router = Router();

// =====================================================
// HELPER: Get Cashfree API base URL
// =====================================================
function getCashfreeBaseUrl(): string {
  const env = process.env.CASHFREE_ENV || 'PRODUCTION';
  return env === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

// =====================================================
// HELPER: Verify Cashfree webhook signature
// =====================================================
function verifyCashfreeSignature(
  body: string,
  timestamp: string,
  signature: string
): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) {
    console.error('[Webhook] CASHFREE_SECRET_KEY not configured');
    return false;
  }

  const signedString = `${timestamp}.${body}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedString)
    .digest('base64');

  return signature === expectedSignature;
}

// =====================================================
// FLOW 2: Initiate Payment
// POST /api/payments/initiate
// =====================================================
router.post('/api/payments/initiate', async (req: Request, res: Response) => {
  try {
    const { userId, planType, userPhone } = req.body;

    // Validate inputs
    if (!userId || !planType || !userPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['daily', 'weekly'].includes(planType)) {
      return res.status(400).json({ error: 'Invalid plan type. Must be "daily" or "weekly"' });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // ===== STEP 1: Check for existing pending transaction (prevent double payment) =====
    const { data: existingPending } = await supabase
      .from('payment_transactions')
      .select('id, cashfree_order_id, created_at')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingPending) {
      console.log('[Payment Initiate] Reusing existing pending transaction:', existingPending.cashfree_order_id);
      // Return existing transaction
      const { data: existingTxn } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', existingPending.id)
        .single();

      return res.json({
        success: true,
        transaction_id: existingPending.id,
        order_id: existingPending.cashfree_order_id,
        message: 'Reusing existing pending transaction'
      });
    }

    // ===== STEP 2: Determine amount (in paise) =====
    const amounts = {
      daily: 9900,   // ₹99 = 9900 paise
      weekly: 49900  // ₹499 = 49900 paise
    };

    const amountPaise = amounts[planType as keyof typeof amounts];
    const amountINR = amountPaise / 100;

    // ===== STEP 3: Generate unique order ID =====
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ===== STEP 4: Create pending transaction record =====
    const { data: transaction, error: txnError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        cashfree_order_id: orderId,
        plan_type: planType,
        amount_paise: amountPaise,
        status: 'pending'
      })
      .select()
      .single();

    if (txnError || !transaction) {
      console.error('[Payment Initiate] Failed to create transaction:', txnError);
      return res.status(500).json({ error: 'Failed to create transaction record' });
    }

    console.log('[Payment Initiate] Created transaction:', transaction.id, 'Order:', orderId);

    // ===== STEP 5: Call Cashfree API to create order =====
    const cashfreeBaseUrl = getCashfreeBaseUrl();
    const appUrl = process.env.BASE_URL || process.env.NGROK_URL || 'http://localhost:8080';

    const cashfreeResponse = await fetch(`${cashfreeBaseUrl}/orders`, {
      method: 'POST',
      headers: {
        'X-Api-Version': '2023-08-01',
        'X-Client-Id': process.env.CASHFREE_APP_ID!,
        'X-Client-Secret': process.env.CASHFREE_SECRET_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amountINR,
        order_currency: 'INR',
        customer_details: {
          customer_id: userId,
          customer_phone: userPhone,
          customer_email: `user_${userId}@app.local`
        },
        order_meta: {
          return_url: `${appUrl}/payment-callback?transaction_id=${transaction.id}`,
          notify_url: `${appUrl}/api/payment-webhook`
        }
      })
    });

    const cashfreeData = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      console.error('[Payment Initiate] Cashfree API error:', cashfreeData);
      
      // Mark transaction as failed
      await supabase
        .from('payment_transactions')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', transaction.id);

      return res.status(500).json({ 
        error: 'Failed to create Cashfree order',
        details: cashfreeData 
      });
    }

    // ===== STEP 6: Return payment link to frontend =====
    return res.json({
      success: true,
      transaction_id: transaction.id,
      payment_link: cashfreeData.payment_link || cashfreeData.data?.payment_link,
      order_id: orderId,
      amount: amountINR,
      plan_type: planType
    });

  } catch (error: any) {
    console.error('[Payment Initiate] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// =====================================================
// FLOW 3: Payment Webhook Handler
// POST /api/payment-webhook
// =====================================================
router.post('/api/payment-webhook', async (req: Request, res: Response) => {
  try {
    // ===== STEP 1: Verify webhook signature =====
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;
    const body = JSON.stringify(req.body);

    if (!signature || !timestamp) {
      console.error('[Webhook] Missing signature or timestamp');
      return res.status(400).json({ error: 'Missing signature or timestamp' });
    }

    const isValid = verifyCashfreeSignature(body, timestamp, signature);
    if (!isValid) {
      console.error('[Webhook] ⚠️ SIGNATURE MISMATCH - REJECTING');
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    console.log('[Webhook] ✅ Signature verified');

    // ===== STEP 2: Extract payment data =====
    const { data } = req.body;
    const orderStatus = data?.order?.order_status;
    const orderId = data?.order?.order_id;
    const cfPaymentId = data?.payment?.cf_payment_id;

    console.log(`[Webhook] Processing payment: ${orderId}, Status: ${orderStatus}`);

    if (!orderId) {
      return res.status(400).json({ error: 'Missing order_id' });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // ===== STEP 3: Fetch pending transaction from DB =====
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('cashfree_order_id', orderId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !transaction) {
      console.log('[Webhook] ⚠️ No pending transaction found for order:', orderId);
      // Still return 200 so Cashfree doesn't retry
      return res.status(200).json({ 
        success: false, 
        message: 'Transaction not found or already processed' 
      });
    }

    const userId = transaction.user_id;
    const planType = transaction.plan_type;

    // ===== STEP 4: Verify payment status =====
    if (orderStatus !== 'PAID') {
      // Payment failed or pending
      await supabase
        .from('payment_transactions')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      console.log('[Webhook] ❌ Payment failed for order:', orderId);
      return res.status(200).json({ success: false, message: 'Payment not completed' });
    }

    // ===== STEP 5: Double-check with Cashfree API (redundancy) =====
    const cashfreeBaseUrl = getCashfreeBaseUrl();
    const verifyResponse = await fetch(`${cashfreeBaseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'X-Api-Version': '2023-08-01',
        'X-Client-Id': process.env.CASHFREE_APP_ID!,
        'X-Client-Secret': process.env.CASHFREE_SECRET_KEY!
      }
    });

    const verifyData = await verifyResponse.json();
    const verifiedStatus = verifyData.order_status || verifyData.data?.order_status;

    if (verifiedStatus !== 'PAID' && verifiedStatus !== 'ACTIVE') {
      console.log('[Webhook] ⚠️ Cashfree API verification failed. Status:', verifiedStatus);
      return res.status(200).json({ success: false, message: 'Payment verification failed' });
    }

    // ===== STEP 6: Calculate subscription end time =====
    const now = new Date();
    let subscriptionEndTime: Date;

    if (planType === 'daily') {
      subscriptionEndTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours
    } else if (planType === 'weekly') {
      subscriptionEndTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    } else {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // ===== STEP 7: Update transaction as success (idempotent) =====
    const { error: updateTxnError } = await supabase
      .from('payment_transactions')
      .update({
        status: 'success',
        cashfree_payment_id: cfPaymentId,
        payment_timestamp: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', transaction.id)
      .eq('status', 'pending'); // Only update if still pending (idempotent)

    if (updateTxnError) {
      console.error('[Webhook] Error updating transaction:', updateTxnError);
      return res.status(500).json({ error: 'Failed to update transaction' });
    }

    // ===== STEP 8: Get old tier for logging =====
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    const oldTier = userData?.subscription_tier || 'free';

    // ===== STEP 9: Update user subscription =====
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        subscription_tier: planType,
        subscription_start_time: now.toISOString(),
        subscription_end_time: subscriptionEndTime.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', userId);

    if (updateUserError) {
      console.error('[Webhook] Error updating user:', updateUserError);
      return res.status(500).json({ error: 'Failed to update user subscription' });
    }

    // ===== STEP 10: Log to subscription history =====
    const { error: historyError } = await supabase
      .from('subscription_history')
      .insert({
        user_id: userId,
        old_tier: oldTier,
        new_tier: planType,
        reason: 'payment_success',
        transaction_id: transaction.id
      });

    if (historyError) {
      console.error('[Webhook] Error logging subscription history:', historyError);
      // Don't fail - we already updated the important stuff
    }

    console.log(`[Webhook] ✅ SUCCESS: User ${userId} upgraded to ${planType} until ${subscriptionEndTime.toISOString()}`);

    // ===== RETURN 200 TO CASHFREE =====
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      user_id: userId,
      subscription_end_time: subscriptionEndTime.toISOString()
    });

  } catch (error: any) {
    console.error('[Webhook] Error:', error);
    // Always return 200 on error so Cashfree doesn't retry infinitely
    return res.status(200).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// =====================================================
// GET /api/transaction/:id
// Get transaction status for payment callback page
// =====================================================
router.get('/api/transaction/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get user subscription status
    const { data: user } = await supabase
      .from('users')
      .select('subscription_tier, subscription_end_time')
      .eq('id', transaction.user_id)
      .single();

    return res.json({
      status: transaction.status,
      plan_type: transaction.plan_type,
      subscription_tier: user?.subscription_tier,
      subscription_end_time: user?.subscription_end_time,
      user_tier: user?.subscription_tier
    });

  } catch (error: any) {
    console.error('[Transaction Status] Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// =====================================================
// GET /api/user/subscription
// Get current subscription tier and expiry
// =====================================================
router.get('/api/user/subscription', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_tier, subscription_start_time, subscription_end_time')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if subscription expired
    let isExpired = false;
    if (user.subscription_tier !== 'free' && user.subscription_end_time) {
      isExpired = new Date(user.subscription_end_time) <= new Date();
    }

    return res.json({
      tier: user.subscription_tier,
      start_time: user.subscription_start_time,
      end_time: user.subscription_end_time,
      is_expired: isExpired,
      is_active: !isExpired && user.subscription_tier !== 'free'
    });

  } catch (error: any) {
    console.error('[Subscription Status] Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;

