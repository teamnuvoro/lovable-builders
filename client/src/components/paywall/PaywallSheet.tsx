import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { analytics } from "@/lib/analytics";
import { trackPlanSelected } from "@/utils/amplitudeTracking";

// Declare Cashfree SDK types (matching official documentation)
// According to https://www.cashfree.com/docs/payments/online/web/redirect
declare global {
  interface Window {
    Cashfree: (config: { mode: 'production' | 'sandbox' }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: '_self' | '_blank' | '_top' | '_modal' | HTMLElement;
      }) => Promise<{
        error?: { message: string };
        redirect?: boolean;
      }>;
    };
  }
}

interface PaywallSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageCount?: number;
}

// No SDK needed - Cashfree uses simple redirect URLs

export function PaywallSheet({ open, onOpenChange, messageCount }: PaywallSheetProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [sdkBlocked, setSdkBlocked] = useState(false);
  const sdkCheckAttempts = useRef(0);
  const sdkWarningShown = useRef(false);
  const [cachedOrder, setCachedOrder] = useState<{ orderId: string; paymentSessionId: string; timestamp: number; planType: 'monthly' } | null>(null);
  const { toast } = useToast();

  // Check if Cashfree SDK is loaded
  useEffect(() => {
    const checkSDK = () => {
      if (typeof window !== 'undefined' && (window as any).Cashfree) {
        return true;
      } else {
        return false;
      }
    };

    // Check immediately
    if (checkSDK()) {
      return;
    }

    // Also check periodically in case SDK loads after component mounts
    const interval = setInterval(() => {
      if (checkSDK()) {
        clearInterval(interval);
        return;
      }

      sdkCheckAttempts.current += 1;
      if (!sdkWarningShown.current && sdkCheckAttempts.current >= 6) {
        sdkWarningShown.current = true;
        console.warn('⚠️ Cashfree SDK still not loaded - hosted checkout fallback will be used if needed');
      }
    }, 500);
    
    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const { data: paymentConfig } = useQuery<{
    paymentProvider: string;
    currency: string;
    plans: { monthly: number };
    keyId?: string;
    paymentsEnabled?: boolean;
    paymentsDisabledReason?: string;
  }>({
    queryKey: ["/api/payment/config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/payment/config");
      return response.json();
    },
    staleTime: Infinity,
  });

  const { user } = useAuth();
  
  const createOrderMutation = useMutation({
    mutationFn: async (planType: 'monthly') => {
      if (!user?.id) {
        throw new Error('Please login to continue with payment');
      }
      
      const response = await apiRequest('POST', '/api/payment/create-order', { 
        planType,
        userId: user.id
      });
      return response.json();
    },
  });

  const planAmount = paymentConfig?.plans?.monthly ?? 99;

  const handleSelectPlan = async () => {
    const planType: 'monthly' = 'monthly';
    try {
      if (paymentConfig?.paymentsEnabled === false) {
        toast({
          title: "Payments Disabled",
          description: paymentConfig.paymentsDisabledReason || "Payments are disabled in development mode.",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);

      analytics.track("checkout_started", { plan: planType, amount: planAmount });
      trackPlanSelected(planType, planAmount, 30); // 30 days for monthly

      // Check for cached order (reuse if created within last 15 minutes and same plan)
      const now = Date.now();
      const ORDER_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
      
      if (cachedOrder && 
          cachedOrder.planType === planType &&
          (now - cachedOrder.timestamp) < ORDER_CACHE_DURATION) {
        console.log("♻️ Reusing cached order:", cachedOrder.orderId);
        console.log("♻️ Order age:", Math.round((now - cachedOrder.timestamp) / 1000), "seconds");
        
        // Use cached order data - skip to checkout
        const orderData = {
          order_id: cachedOrder.orderId,
          checkout_url: cachedOrder.paymentSessionId, // Reuse field name for compatibility
        };
        
        // Proceed directly to checkout with cached order
        await proceedToCheckout(orderData);
        return;
      }

      // 1. Call backend to create Dodo checkout session (only if no valid cache)
      const orderData = await createOrderMutation.mutateAsync(planType);
      
      // Cache the order for reuse
      if (orderData.order_id && orderData.checkout_url) {
        setCachedOrder({
          orderId: orderData.order_id,
          paymentSessionId: orderData.checkout_session_id || orderData.checkout_url,
          timestamp: now,
          planType: planType,
        });
        console.log("💾 Cached order for reuse:", orderData.order_id);
      }

      // Validate order data
      if (orderData.error) {
        console.error("Detailed Error:", orderData);
        toast({
          title: "Payment Error",
          description: orderData.details || "Failed to create checkout session",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (!orderData.checkout_url || !orderData.order_id) {
        console.error("Missing checkout_url or order_id", orderData);
        toast({
          title: "Payment Error",
          description: "Payment configuration error. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Proceed to checkout with order data
      await proceedToCheckout(orderData);

    } catch (error: any) {
      console.error('Payment error:', error);
      console.error('Payment error details:', error?.details);
      console.error('Payment error internal:', error?.internalError);

      let errorMessage = "Failed to initiate payment";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.details) {
        errorMessage = typeof error.details === 'string' ? error.details : error.details?.details || error.details?.message || "Payment failed";
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Check if user is not logged in
      if (!user?.id) {
        errorMessage = "Please login to continue with payment";
      }

      // Check for payment service errors (user-friendly message)
      if (errorMessage?.includes('Dodo Payments') || errorMessage?.includes('checkout session')) {
        errorMessage = "Payment service temporarily unavailable. Please try again or contact support.";
        console.error('[DODO][ERROR] Payment error detected - showing user-friendly message');
      }

      // In development, show internal error for debugging
      if (import.meta.env.DEV && error?.internalError) {
        console.error('[DODO][ERROR] Internal error (dev only):', error.internalError);
      }

      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Separate function to handle checkout (reusable for cached orders)
  // Dodo Payments uses checkout_url (no SDK needed)
  const proceedToCheckout = async (orderData: { order_id: string; checkout_url: string }) => {
    // Cashfree Checkout - redirect to Cashfree hosted checkout page
    // Use Cashfree SDK for checkout (recommended method)
    // Determine mode: use env var if set, otherwise default to sandbox in dev, production in prod
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    const cashfreeMode = import.meta.env.VITE_CASHFREE_MODE || (isDevelopment ? 'sandbox' : 'production');
    
    if (!orderData.checkout_url) {
      throw new Error('Missing checkout_url');
    }

    console.log("[DODO][CHECKOUT]");
    console.log("  order_id=" + orderData.order_id);
    console.log("  checkout_url=" + orderData.checkout_url);

    // Dodo Payments: Simple redirect to checkout URL (no SDK needed)
    toast({
      title: "Opening Secure Checkout",
      description: "Redirecting to secure payment page...",
      duration: 2000,
    });
    
    // Redirect to Dodo checkout page
    setTimeout(() => {
      window.location.href = orderData.checkout_url;
    }, 500);
  };

  // Clear cached order when paywall closes
  useEffect(() => {
    if (!open) {
      setCachedOrder(null);
      setSdkBlocked(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        {import.meta.env.DEV && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
              🟡 DEV MODE – Payments are disabled in development
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              To test payments, use production mode with real user authentication
            </p>
          </div>
        )}
        <DialogHeader className="text-center space-y-3 pb-4">
          <DialogTitle className="text-2xl font-bold">
            {messageCount !== undefined ? "Oops! Your Free Chats Are Done." : "Unlock Premium Features"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {messageCount !== undefined 
              ? <>You've used your 20 free messages. <span className="font-bold text-foreground">Unlock unlimited chats</span> with Riya by choosing a pass below.</>
              : "Unlock unlimited chats and voice calls with Riya by choosing a pass below."}
          </DialogDescription>
        </DialogHeader>

        {sdkBlocked && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
              ⚠️ Payment Blocked by Browser Privacy Settings
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
              Your browser's privacy settings are blocking the payment system. You can:
            </p>
            <div className="space-y-2">
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1 mb-3">
                <li>Disable Brave Shields (if using Brave browser)</li>
                <li>Disable ad blockers (uBlock, AdBlock, etc.)</li>
                <li>Try in incognito/private mode</li>
                <li>Or use a different browser</li>
              </ul>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                💡 Don't worry - we'll automatically redirect you to a secure checkout page if needed.
              </p>
            </div>
          </div>
        )}

        <div className="py-4">
          {/* Monthly Plan */}
          <Card className="p-6 border-2 border-primary bg-primary/5 relative flex flex-col shadow-lg max-w-md mx-auto">
            <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
              PREMIUM
            </Badge>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-primary">Monthly Premium</h3>
                <p className="text-sm text-muted-foreground">Unlimited access for a full month</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">₹{planAmount}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>

              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span>Unlimited messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span>Unlimited voice calls</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span>Priority responses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span>Early feature access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleSelectPlan}
              className="w-full mt-6"
              size="lg"
              disabled={isProcessing || sdkBlocked}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                `Get Premium - ₹${planAmount}/month`
              )}
            </Button>
          </Card>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💳</span>
              <span>UPI / Cards / NetBanking</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🇮🇳</span>
              <span>RBI-compliant</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by Dodo Payments • Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
