import Vapi from "@vapi-ai/web";

let vapi: Vapi | null = null;
let active = false;
let currentPublicKey: string | null = null;

// Get SDK version for debugging
const SDK_VERSION = (Vapi as any).version || "unknown";

// Helper to detect billing/wallet errors (Vapi returns 400, not 402/403)
export function isBillingError(error: any): boolean {
  const errorMessageText = 
    error?.error?.message?.message || 
    error?.error?.error?.message || 
    error?.error?.message ||
    error?.message ||
    '';
  
  if (typeof errorMessageText !== 'string') return false;
  
  const walletBalancePatterns = [
    'Wallet Balance',
    'Purchase More Credits',
    'Upgrade Your Plan',
    'insufficient',
    'balance'
  ];
  
  return walletBalancePatterns.some(pattern => 
    errorMessageText.toLowerCase().includes(pattern.toLowerCase())
  );
}

export function getVapi() {
  // CRITICAL: Use the public key from the new account with credits
  // New public key: 39e4fcbf-b56e-4b48-ab5e-be7a092c2305
  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY || '39e4fcbf-b56e-4b48-ab5e-be7a092c2305';
  
  // CRITICAL: Recreate Vapi instance if key changed (forces new connection with credits)
  if (!vapi || currentPublicKey !== publicKey) {
    console.log(`[vapiCallManager] ===== CREATING VAPI INSTANCE =====`);
    console.log(`[vapiCallManager] Environment Variable: ${import.meta.env.VITE_VAPI_PUBLIC_KEY || 'NOT SET'}`);
    console.log(`[vapiCallManager] Using Public Key: ${publicKey}`);
    console.log(`[vapiCallManager] Expected Key (new account): 39e4fcbf-b56e-4b48-ab5e-be7a092c2305`);
    console.log(`[vapiCallManager] Keys Match: ${publicKey === '39e4fcbf-b56e-4b48-ab5e-be7a092c2305'}`);
    console.log(`[vapiCallManager] Key Length: ${publicKey.length} (should be 36)`);
    
    if (vapi) {
      console.log('[vapiCallManager] Key changed, destroying old instance');
      try {
        vapi.stop();
      } catch (e) {
        // Ignore stop errors during cleanup
      }
    }
    
    // Create new instance with the key
    vapi = new Vapi(publicKey);
    currentPublicKey = publicKey;
    
    console.log(`[vapiCallManager] Vapi SDK version: ${SDK_VERSION}`);
    console.log(`[vapiCallManager] Vapi instance created successfully`);
    console.log(`[vapiCallManager] ⚠️  If you see -0.12 balance error, this key is linked to wrong account`);
    console.log(`[vapiCallManager] ⚠️  Check Vapi dashboard: which public key has 9.70 credits?`);
    console.log(`[vapiCallManager] ====================================`);
    
    // Reset active flag when call ends naturally
    vapi.on("call-end", () => {
      console.log("[vapiCallManager] Call ended naturally, resetting active flag");
      active = false;
    });
  }
  return vapi;
}

export async function startCall(config: any) {
  if (active) {
    console.warn("[vapiCallManager] Call already active, ignoring start request");
    return;
  }

  try {
    // Log exact payload being sent
    console.log("[vapiCallManager] ===== CALL START REQUEST =====");
    console.log("[vapiCallManager] SDK Version:", SDK_VERSION);
    console.log("[vapiCallManager] Config Shape:", {
      hasAssistant: 'assistant' in config,
      hasName: 'name' in config,
      hasInstructions: 'instructions' in config,
      hasModel: 'model' in config,
      hasVoice: 'voice' in config,
      hasTranscriber: 'transcriber' in config,
      topLevelKeys: Object.keys(config),
    });
    console.log("[vapiCallManager] Full Config:", JSON.stringify(config, null, 2));
    console.log("[vapiCallManager] Active State:", active);
    console.log("[vapiCallManager] ===============================");

    active = true;
    const vapiInstance = getVapi();
    
    // Set up error listener BEFORE starting to catch async errors
    const errorHandler = (error: any) => {
      console.error("[vapiCallManager] ===== ASYNC ERROR EVENT =====");
      console.error("[vapiCallManager] Error Type:", error?.constructor?.name);
      console.error("[vapiCallManager] Error Message:", error?.message);
      console.error("[vapiCallManager] Error Status:", error?.status);
      console.error("[vapiCallManager] Error Code:", error?.code);
      console.error("[vapiCallManager] Error Type (from error.type):", error?.type);
      console.error("[vapiCallManager] Error Stage (from error.stage):", error?.stage);
      
      // CRITICAL: Detect billing errors explicitly
      if (isBillingError(error)) {
        console.error("[vapiCallManager] ⚠️  BILLING ERROR DETECTED - Wallet balance insufficient");
        console.error("[vapiCallManager] ⚠️  This is NOT a code issue - add credits to Vapi account");
      }
      
      console.error("[vapiCallManager] Full Error Object:", error);
      console.error("[vapiCallManager] Error JSON:", JSON.stringify(error, null, 2));
      console.error("[vapiCallManager] =============================");
      active = false;
    };
    
    vapiInstance.on("error", errorHandler);
    
    try {
      await vapiInstance.start(config);
      console.log("[vapiCallManager] Call started successfully");
      
      // Remove error handler after successful start (error events will be handled by component)
      setTimeout(() => {
        vapiInstance.off("error", errorHandler);
      }, 1000);
    } catch (startError: any) {
      vapiInstance.off("error", errorHandler);
      throw startError;
    }
  } catch (error: any) {
    active = false;
    console.error("[vapiCallManager] ===== CALL START ERROR =====");
    console.error("[vapiCallManager] Error Type:", error?.constructor?.name);
    console.error("[vapiCallManager] Error Message:", error?.message);
    console.error("[vapiCallManager] Error Status:", error?.status);
    console.error("[vapiCallManager] Error Code:", error?.code);
    
    // CRITICAL: Detect billing errors explicitly
    if (isBillingError(error)) {
      console.error("[vapiCallManager] ⚠️  BILLING ERROR DETECTED - Wallet balance insufficient");
      console.error("[vapiCallManager] ⚠️  This is NOT a code issue - add credits to Vapi account");
    }
    
    console.error("[vapiCallManager] Full Error Object:", error);
    if (error?.response) {
      console.error("[vapiCallManager] Error Response:", error.response);
    }
    if (error?.request) {
      console.error("[vapiCallManager] Error Request:", error.request);
    }
    console.error("[vapiCallManager] =============================");
    throw error;
  }
}

export async function stopCall() {
  if (!vapi || !active) {
    console.log("[vapiCallManager] Stop call called but no active call");
    return;
  }
  console.log("[vapiCallManager] Stopping call...");
  active = false;
  await vapi.stop();
  console.log("[vapiCallManager] Call stopped");
}

// Force reset Vapi instance (useful when key changes or credits are added)
export function resetVapiInstance() {
  console.log("[vapiCallManager] ===== FORCE RESETTING VAPI INSTANCE =====");
  if (vapi) {
    try {
      console.log("[vapiCallManager] Stopping existing Vapi instance...");
      vapi.stop();
    } catch (e) {
      console.warn("[vapiCallManager] Error stopping Vapi:", e);
    }
  }
  vapi = null;
  currentPublicKey = null;
  active = false;
  console.log("[vapiCallManager] Vapi instance completely reset");
  console.log("[vapiCallManager] Next getVapi() will create fresh instance with new key");
  console.log("[vapiCallManager] ==========================================");
}
