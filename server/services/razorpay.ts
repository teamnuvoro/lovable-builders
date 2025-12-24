import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export interface CreateRazorpayOrderParams {
  amount: number; // Amount in paise (e.g., 1900 for ₹19)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(params: CreateRazorpayOrderParams): Promise<RazorpayOrderResponse> {
  try {
    const razorpay = getRazorpayInstance();
    
    const options = {
      amount: params.amount, // Amount in paise
      currency: params.currency || 'INR',
      receipt: params.receipt || `receipt_${Date.now()}`,
      notes: params.notes || {},
    };

    console.log('[Razorpay] Creating order:', {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
    });

    const order = await razorpay.orders.create(options);
    
    console.log('[Razorpay] Order created successfully:', order.id);
    return order as RazorpayOrderResponse;
  } catch (error: any) {
    console.error('[Razorpay] Error creating order:', error);
    throw new Error(`Failed to create Razorpay order: ${error.message || 'Unknown error'}`);
  }
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(params: VerifyPaymentParams): boolean {
  try {
    const { orderId, paymentId, signature } = params;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error('[Razorpay] Key secret not configured');
      return false;
    }

    // Create the signature string
    const signatureString = `${orderId}|${paymentId}`;
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(signatureString)
      .digest('hex');

    // Compare signatures
    const isValid = expectedSignature === signature;
    
    if (!isValid) {
      console.error('[Razorpay] Signature verification failed');
      console.log('[Razorpay] Expected:', expectedSignature);
      console.log('[Razorpay] Received:', signature);
    } else {
      console.log('[Razorpay] ✅ Signature verified successfully');
    }

    return isValid;
  } catch (error) {
    console.error('[Razorpay] Signature verification error:', error);
    return false;
  }
}

export interface RazorpayPaymentStatus {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  description: string | null;
  created_at: number;
}

/**
 * Get payment status from Razorpay
 */
export async function getRazorpayPaymentStatus(paymentId: string): Promise<RazorpayPaymentStatus> {
  try {
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(paymentId);
    
    return payment as RazorpayPaymentStatus;
  } catch (error: any) {
    console.error('[Razorpay] Error fetching payment status:', error);
    throw new Error(`Failed to get payment status: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get order details from Razorpay
 */
export async function getRazorpayOrder(orderId: string): Promise<RazorpayOrderResponse> {
  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.fetch(orderId);
    
    return order as RazorpayOrderResponse;
  } catch (error: any) {
    console.error('[Razorpay] Error fetching order:', error);
    throw new Error(`Failed to get order: ${error.message || 'Unknown error'}`);
  }
}

