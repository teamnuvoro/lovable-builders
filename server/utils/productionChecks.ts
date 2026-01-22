/**
 * Production Safety Checks
 * 
 * These checks ensure the server is properly configured for production
 * and will fail fast if critical configuration is missing.
 */

export const IS_DEV = process.env.NODE_ENV !== 'production';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Assert that a value exists, throw error if not
 */
function assert(value: any, message: string): void {
  if (!value) {
    throw new Error(`❌ PRODUCTION SAFETY CHECK FAILED: ${message}`);
  }
}

/**
 * Run production safety checks at server startup
 * 
 * In production, these checks MUST pass or server will not start.
 * In development, warnings are logged but server continues.
 */
export function runProductionSafetyChecks(): void {
  console.log('🔍 Running production safety checks...');
  console.log(`   Environment: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  
  if (IS_PRODUCTION) {
    // PRODUCTION: Fail fast if critical config is missing
    console.log('🔒 Production mode detected - enforcing strict checks...');
    
    try {
      // 1. BASE_URL must be set (no ngrok in production)
      assert(
        process.env.BASE_URL && !process.env.BASE_URL.includes('ngrok'),
        'BASE_URL must be set to production domain (not ngrok)'
      );
      console.log(`   ✅ BASE_URL: ${process.env.BASE_URL}`);
      
      // 2. CASHFREE_WEBHOOK_URL must be set
      assert(
        process.env.CASHFREE_WEBHOOK_URL && !process.env.CASHFREE_WEBHOOK_URL.includes('ngrok'),
        'CASHFREE_WEBHOOK_URL must be set to production webhook endpoint (not ngrok)'
      );
      console.log(`   ✅ CASHFREE_WEBHOOK_URL: ${process.env.CASHFREE_WEBHOOK_URL}`);
      
      // 3. Cashfree credentials must be production keys
      const appId = process.env.CASHFREE_APP_ID || '';
      assert(
        appId && !appId.toUpperCase().includes('TEST'),
        'CASHFREE_APP_ID must be production keys (not test keys)'
      );
      console.log(`   ✅ Cashfree App ID: ${appId.substring(0, 8)}...`);
      
      // 4. No backdoor users allowed
      console.log('   ✅ Backdoor users disabled in production');
      
      // 5. Database must be configured
      assert(
        process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Supabase credentials must be configured'
      );
      console.log('   ✅ Database configured');
      
      console.log('✅ All production safety checks passed');
      
    } catch (error: any) {
      console.error('');
      console.error('🔥 ============================================');
      console.error('🔥 PRODUCTION SAFETY CHECK FAILED');
      console.error('🔥 ============================================');
      console.error(`🔥 ${error.message}`);
      console.error('🔥');
      console.error('🔥 Server will NOT start in production with missing configuration.');
      console.error('🔥 Please fix the configuration and restart.');
      console.error('🔥 ============================================');
      console.error('');
      throw error; // Fail fast - don't start server
    }
  } else {
    // DEVELOPMENT: Log warnings but continue
    console.log('⚠️  Development mode - some checks are relaxed');
    
    // Guard: Warn if production Cashfree keys detected in dev mode
    if (process.env.CASHFREE_ENV === 'PRODUCTION') {
      console.warn('   ⚠️  WARNING: Production Cashfree keys detected in dev mode');
      console.warn('   ⚠️  Payments are disabled in dev - use sandbox keys if needed');
    }
    
    // Guard: Fail if dev mode tries to enable payments via env var
    if (process.env.ENABLE_DEV_PAYMENTS === 'true') {
      throw new Error('Payments cannot be enabled in dev mode. Use production mode for payment testing.');
    }
    
    if (!process.env.BASE_URL) {
      console.warn('   ⚠️  BASE_URL not set - using ngrok fallback');
    }
    
    if (!process.env.CASHFREE_WEBHOOK_URL) {
      console.warn('   ⚠️  CASHFREE_WEBHOOK_URL not set - using ngrok fallback');
    }
    
    if (process.env.NGROK_URL) {
      console.log(`   ℹ️  Using ngrok URL: ${process.env.NGROK_URL}`);
    }
    
    console.log('✅ Development mode checks complete (warnings only)');
  }
}

/**
 * Validate user ID for production
 * In production, only valid UUIDs are allowed
 */
export function validateUserIdForProduction(userId: string, context: string): void {
  if (!IS_PRODUCTION) {
    return; // Skip in dev mode
  }
  
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  
  if (!isValidUUID) {
    console.error(`❌ Production: Invalid user ID in ${context}: ${userId}`);
    throw new Error(`Invalid user ID. Payments require authenticated users with valid accounts.`);
  }
}

/**
 * Check if backdoor user is allowed (only in dev)
 */
export function isBackdoorUserAllowed(userId: string): boolean {
  return IS_DEV && (userId === 'backdoor-user-id' || userId === '00000000-0000-0000-0000-000000000001');
}
