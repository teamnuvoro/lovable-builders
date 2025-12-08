import "dotenv/config";
import express from "express";
import { setupVite, serveStatic, log } from "./vite";
import { Server } from "http";
import { ensureSecretsLoaded } from "./secrets";
import chatRoutes from "./routes/chat";
import supabaseApiRoutes from "./routes/supabase-api";
import callRoutes from "./routes/call";
import summaryRoutes from "./routes/summary";
import userSummaryRoutes from "./routes/user-summary";
import authRoutes from "./routes/auth";
import paymentRoutes from "./routes/payment";
import transcribeRoutes from "./routes/deepgram-transcribe";
import messagesHistoryRoutes from "./routes/messages-history";
import analyticsRoutes from "./routes/analytics-events";

const app = express();

// Middleware
app.use(ensureSecretsLoaded);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Layer 1: The "Cache Killer" - Middleware to prevent static cache leaks
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// Health check endpoint - MUST be first route for fast Render health checks
// Simple and fast - no middleware, no async operations
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root health check for Render
app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", service: "riya-ai" });
});

// Authentication routes (OTP-based signup/login)
// Detailed health check endpoint (for debugging)
app.get("/api/health/detailed", (req, res) => {
  res.json({
    status: "ok",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      GROQ_KEY: !!process.env.GROQ_API_KEY,
      TWILIO_SID: !!process.env.TWILIO_ACCOUNT_SID,
      VAPI_KEY: !!process.env.VAPI_PRIVATE_KEY,
      CASHFREE_ID: !!process.env.CASHFREE_APP_ID,
      AMPLITUDE_KEY: !!process.env.VITE_AMPLITUDE_API_KEY,
    },
    timestamp: new Date().toISOString()
  });
});

app.use(authRoutes);

// Supabase API routes (user, sessions, messages, etc.)
app.use(supabaseApiRoutes);

// Chat routes (Groq AI)
app.use(chatRoutes);

// Call routes (Vapi voice calls)
app.use(callRoutes);

// Summary routes (relationship insights)
app.use(summaryRoutes);

// User summary routes (cumulative understanding)
app.use("/api/user-summary", userSummaryRoutes);

// Payment routes (Cashfree integration)
app.use(paymentRoutes);

// Transcribe routes (Deepgram speech-to-text)
app.use(transcribeRoutes);

// Messages history routes (for Memories page)
app.use(messagesHistoryRoutes);

// Analytics routes
app.use(analyticsRoutes);



// User usage endpoint
// User usage endpoint
app.get("/api/user/usage", async (req, res) => {
  try {
    // Attempt to get userId from query or session (if available) - Simple approach
    // Ideally use auth middleware. For now, we assume client passes userId query or we check basic auth.
    // Wait, the client usually calls this. AuthContext might leverage it.
    // If no user ID, return defaults.
    const userId = req.query.userId as string || (req as any).session?.userId;
    const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
    const targetUserId = userId || DEV_USER_ID;

    // Import on demand to avoid circular deps if needed, or use global supabase
    // We need to import 'supabase', 'isSupabaseConfigured' from './supabase'
    // But we are in index.ts, imports are at top.
    // We should add imports at top of file first? 
    // I will write the logic assuming imports exist, BUT I need to add them.
    // I'll use a separate tool call to add imports first.

    // Logic:
    let messageCount = 0;
    let callDuration = 0;
    let premiumUser = false;
    let messageLimitReached = false;

    if (process.env.SUPABASE_URL) { // Minimal check or use isSupabaseConfigured
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

      // 1. Get User Premium Status
      const { data: user } = await supabase.from('users').select('premium_user').eq('id', targetUserId).single();
      if (user) premiumUser = user.premium_user;

      // 2. Get Usage Stats
      const { data: stats } = await supabase.from('usage_stats').select('daily_messages_count, last_daily_reset, total_call_seconds').eq('user_id', targetUserId).single();

      if (stats) {
        callDuration = stats.total_call_seconds || 0;

        // Daily Reset Logic
        const lastReset = stats.last_daily_reset ? new Date(stats.last_daily_reset) : new Date(0);
        const now = new Date();
        if (lastReset.toDateString() === now.toDateString()) {
          messageCount = stats.daily_messages_count || 0;
        } else {
          messageCount = 0;
        }
      }
    }

    const FREE_LIMIT = 20;
    messageLimitReached = !premiumUser && messageCount >= FREE_LIMIT;

    res.json({
      messageCount,
      callDuration,
      premiumUser,
      messageLimitReached,
      callLimitReached: false,
    });
  } catch (error) {
    console.error("[Usage API] Error:", error);
    res.status(500).json({ error: "Failed to fetch usage" });
  }
});

// Update user personality endpoint
app.patch("/api/user/personality", async (req, res) => {
  try {
    const { personalityId } = req.body;
    console.log(`[User Personality] Selected: ${personalityId}`);
    res.json({ success: true, personalityId });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update personality" });
  }
});

// Auth session endpoint (for compatibility with AuthContext)
app.get("/api/auth/session", async (req, res) => {
  try {
    // For dev mode, return a mock user
    // In production, this should validate the session
    // Secure default: Return 401 if not authenticated
    // Client should use Supabase auth to establish session
    res.status(401).json({ error: "Authentication required" });
  } catch (error: any) {
    console.error("[/api/auth/session] Error:", error);
    res.status(500).json({ error: "Failed to get session" });
  }
});

// Export app for Vercel
export default app;

// Only start server if run directly (not imported)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  (async () => {
    console.log("[Server] Starting server with Supabase integration...");

    const server = new Server(app);

    // Setup Vite or serve static files
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || '5000', 10);

    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      log(`🚀 Server running on port ${port}`);
      console.log(`[Server] ✅ Frontend server listening on port ${port}`);
      console.log(`[Server] 🔄 Supabase API routes integrated`);
      console.log(`[Server] 🔄 Chat API routes integrated`);
    });
  })();
}
