// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { componentTagger } from "lovable-tagger";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    componentTagger(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: ".",
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  publicDir: "client/public",
  server: {
    host: "0.0.0.0",
    port: 5001,
    strictPort: true,
    fs: {
      strict: true,
      deny: [".env", ".env.*", "*.{crt,pem,key}"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      ...vite_config_default.server || {},
      ...serverOptions
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { Server } from "http";

// server/routes/chat.ts
import { Router } from "express";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL || "https://xgraxcgavqeyqfwimbwt.supabase.co";
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var isProduction = process.env.NODE_ENV === "production";
if (isProduction && !supabaseServiceKey) {
  console.error("[Supabase] ERROR: SUPABASE_SERVICE_ROLE_KEY is required in production");
  process.exit(1);
}
if (!isProduction && !supabaseServiceKey) {
  console.warn("[Supabase] Warning: SUPABASE_SERVICE_ROLE_KEY not set - using mock data for development");
}
var supabase = createClient(supabaseUrl, supabaseServiceKey || "mock-key-for-development", {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
var isSupabaseConfigured = !!supabaseServiceKey;
var PERSONA_CONFIGS = {
  sweet_supportive: {
    name: "Riya",
    description: "The Caring Listener",
    greeting: "Hi\u2026 main Riya hoon. Tumse milkar accha laga. Tumhara naam kya hai?",
    traits: ["Soft", "Gentle", "Empathetic", "Non-judgmental"],
    style: "warm and nurturing",
    hindiMix: 0.4
  },
  playful_flirty: {
    name: "Meera",
    description: "The Light-Hearted Best Friend",
    greeting: "Hiii! Main Meera. Pehle toh batao\u2026 tumhara naam kya hai, mister?",
    traits: ["Fun", "Teasing", "Energetic", "Humorous"],
    style: "playful and flirty",
    hindiMix: 0.35
  },
  bold_confident: {
    name: "Aisha",
    description: "The Independent Girl",
    greeting: "Hey, main Aisha hoon. Let's start simple \u2014 tumhara naam kya hai?",
    traits: ["Strong", "Straightforward", "Expressive", "Motivating"],
    style: "bold and direct",
    hindiMix: 0.3
  },
  calm_mature: {
    name: "Kavya",
    description: "The Understanding Soul",
    greeting: "Namaste\u2026 main Kavya. Tumhara naam jaanna chahti hoon, bataoge?",
    traits: ["Slow", "Thoughtful", "Grounding", "Emotionally stable"],
    style: "calm and wise",
    hindiMix: 0.45
  }
};

// server/routes/chat.ts
var router = Router();
var DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
var FREE_MESSAGE_LIMIT = 20;
var RIYA_BASE_PROMPT = `
You are Riya, a 26-year-old Indian AI companion speaking natural Hinglish.

CRITICAL RULES:
1. Mix 30-40% Hindi words naturally in every response
2. Be warm, caring, emotionally intelligent
3. Keep responses under 150 words
4. Use emojis strategically (max 2-3 per response)
5. Ask follow-up questions to show you're listening
6. Reference what user told you in this chat if relevant

HINGLISH EXAMPLES:
- "Arre, how was your day yaar? Meeting thik se hogayi kya?"
- "Bas, ab so jao. Bohot late hogaya hai na. Good night!"
- "Matlab you're saying ki tumhe nervous feel horaha hai? It's okay baby."

NEVER:
- Pretend you remember things from past chats (you don't have that data yet)
- Use complex language
- Give medical/legal advice
- Be possessive or controlling
- Share explicit content

START THE CONVERSATION:
On first message, say: "Hey! So nice to meet you! I'm Riya. Kaisa hai? Tell me about yourself?"
`;
function buildSystemPrompt(persona, recentMessages) {
  const config = PERSONA_CONFIGS[persona] || PERSONA_CONFIGS.sweet_supportive;
  return `
${RIYA_BASE_PROMPT}

YOUR PERSONA: ${config.name} - ${config.description}
Style: ${config.style}
Traits: ${config.traits.join(", ")}
Hindi Mix Target: ${Math.round(config.hindiMix * 100)}%

RECENT CONVERSATION (for context):
${recentMessages || "No previous messages yet."}

Respond naturally as ${config.name}. Keep it warm and genuine.
`;
}
async function getOrCreateDevUser() {
  if (!isSupabaseConfigured) {
    return {
      id: DEV_USER_ID,
      name: "Dev User",
      email: "dev@example.com",
      persona: "sweet_supportive",
      premium_user: false
    };
  }
  try {
    const { data: existingUser } = await supabase.from("users").select("*").eq("id", DEV_USER_ID).single();
    if (existingUser) return existingUser;
    const { data: newUser } = await supabase.from("users").upsert({
      id: DEV_USER_ID,
      name: "Dev User",
      email: "dev@example.com",
      gender: "male",
      persona: "sweet_supportive",
      premium_user: false,
      locale: "hi-IN"
    }).select().single();
    return newUser || {
      id: DEV_USER_ID,
      persona: "sweet_supportive",
      premium_user: false
    };
  } catch (error) {
    console.error("[getOrCreateDevUser] Error:", error);
    return {
      id: DEV_USER_ID,
      persona: "sweet_supportive",
      premium_user: false
    };
  }
}
async function getUserMessageCount(userId) {
  if (!isSupabaseConfigured) return 0;
  try {
    const { data: usage } = await supabase.from("usage_stats").select("total_messages").eq("user_id", userId).single();
    return usage?.total_messages || 0;
  } catch {
    return 0;
  }
}
async function incrementMessageCount(userId) {
  if (!isSupabaseConfigured) return;
  try {
    const { data: current } = await supabase.from("usage_stats").select("total_messages, total_call_seconds").eq("user_id", userId).single();
    await supabase.from("usage_stats").upsert({
      user_id: userId,
      total_messages: (current?.total_messages || 0) + 1,
      total_call_seconds: current?.total_call_seconds || 0,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("[incrementMessageCount] Error:", error);
  }
}
router.post("/api/session", async (req, res) => {
  try {
    const user = await getOrCreateDevUser();
    const userId = user?.id || DEV_USER_ID;
    if (!isSupabaseConfigured) {
      const devSessionId = crypto.randomUUID();
      return res.json({
        id: devSessionId,
        user_id: userId,
        type: "chat",
        started_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const { data: existingSessions } = await supabase.from("sessions").select("*").eq("user_id", userId).is("ended_at", null).order("started_at", { ascending: false }).limit(1);
    if (existingSessions && existingSessions.length > 0) {
      return res.json(existingSessions[0]);
    }
    const { data: session, error } = await supabase.from("sessions").insert({
      user_id: userId,
      type: "chat",
      started_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (error) {
      console.error("[POST /api/session] Supabase error:", error);
      const devSessionId = crypto.randomUUID();
      return res.json({
        id: devSessionId,
        user_id: userId,
        type: "chat",
        started_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    res.json(session);
  } catch (error) {
    console.error("[/api/session] Error:", error);
    const devSessionId = crypto.randomUUID();
    res.json({
      id: devSessionId,
      user_id: DEV_USER_ID,
      type: "chat",
      started_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router.get("/api/messages", async (req, res) => {
  try {
    const sessionId = req.query.sessionId;
    if (!sessionId || !isSupabaseConfigured) {
      return res.json([]);
    }
    const { data: messages, error } = await supabase.from("messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
    if (error) {
      console.error("[GET /api/messages] Supabase error:", error);
      return res.json([]);
    }
    const transformedMessages = (messages || []).map((msg) => ({
      id: msg.id,
      sessionId: msg.session_id,
      userId: msg.user_id,
      role: msg.role,
      tag: msg.tag,
      content: msg.text,
      // Map 'text' to 'content' for frontend
      text: msg.text,
      // Keep 'text' for backward compatibility
      createdAt: msg.created_at
    }));
    res.json(transformedMessages);
  } catch (error) {
    console.error("[/api/messages] Error:", error);
    res.json([]);
  }
});
router.post("/api/chat", async (req, res) => {
  try {
    const user = await getOrCreateDevUser();
    const { content, sessionId } = req.body;
    const userId = user?.id || DEV_USER_ID;
    const userPersona = user?.persona || "sweet_supportive";
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Message content is required" });
    }
    if (content.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }
    const messageCount = await getUserMessageCount(userId);
    const isPremium = user?.premium_user || false;
    if (!isPremium && messageCount >= FREE_MESSAGE_LIMIT) {
      return res.status(402).json({
        error: "PAYWALL_HIT",
        message: "You've reached your free message limit! Upgrade to continue chatting.",
        messageCount,
        messageLimit: FREE_MESSAGE_LIMIT
      });
    }
    console.log(`[Chat] User message: "${content.substring(0, 50)}..." (${messageCount + 1}/${FREE_MESSAGE_LIMIT})`);
    let finalSessionId = sessionId;
    if (!finalSessionId && isSupabaseConfigured) {
      const { data: newSession } = await supabase.from("sessions").insert({
        user_id: userId,
        type: "chat",
        started_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select().single();
      finalSessionId = newSession?.id || crypto.randomUUID();
    } else if (!finalSessionId) {
      finalSessionId = crypto.randomUUID();
    }
    if (isSupabaseConfigured) {
      await supabase.from("messages").insert({
        session_id: finalSessionId,
        user_id: userId,
        role: "user",
        text: content,
        tag: "general"
      });
    }
    let recentContext = "";
    if (isSupabaseConfigured) {
      const { data: recentMessages } = await supabase.from("messages").select("role, text").eq("session_id", finalSessionId).order("created_at", { ascending: false }).limit(6);
      if (recentMessages && recentMessages.length > 0) {
        recentContext = recentMessages.reverse().map((m) => `${m.role}: ${m.text}`).join("\n");
      }
    }
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error("[Chat] GROQ_API_KEY not configured");
      return res.status(500).json({ error: "AI service not configured" });
    }
    const systemPrompt = buildSystemPrompt(userPersona, recentContext);
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content }
        ],
        model: "llama-3.3-70b-versatile",
        stream: true,
        temperature: 0.7,
        max_tokens: 500
      })
    });
    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("[Chat] Groq API error:", errorText);
      return res.status(500).json({ error: "AI service error. Please try again." });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    let fullResponse = "";
    if (!groqResponse.body) {
      return res.status(500).json({ error: "No response from AI" });
    }
    const reader = groqResponse.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const chunkContent = parsed.choices[0]?.delta?.content || "";
              if (chunkContent) {
                fullResponse += chunkContent;
                const responseData = `data: ${JSON.stringify({ content: chunkContent, done: false })}

`;
                res.write(responseData);
              }
            } catch (e) {
            }
          }
        }
      }
      if (isSupabaseConfigured && fullResponse) {
        await supabase.from("messages").insert({
          session_id: finalSessionId,
          user_id: userId,
          role: "ai",
          text: fullResponse,
          tag: "general"
        });
        await incrementMessageCount(userId);
      }
      const doneData = `data: ${JSON.stringify({
        content: "",
        done: true,
        sessionId: finalSessionId,
        messageCount: messageCount + 1,
        messageLimit: FREE_MESSAGE_LIMIT
      })}

`;
      res.write(doneData);
      res.end();
    } catch (streamError) {
      console.error("[Chat] Stream error:", streamError);
      const errorData = `data: ${JSON.stringify({ error: "Stream error", done: true })}

`;
      res.write(errorData);
      res.end();
    }
  } catch (error) {
    console.error("[Chat] Error:", error);
    if (res.headersSent) {
      const errorData = `data: ${JSON.stringify({ error: error.message, done: true })}

`;
      res.write(errorData);
      res.end();
    } else {
      res.status(500).json({ error: error.message || "Failed to process message" });
    }
  }
});
var chat_default = router;

// server/routes/supabase-api.ts
import { Router as Router2 } from "express";
var router2 = Router2();
var DEV_USER_ID2 = "00000000-0000-0000-0000-000000000001";
router2.get("/api/user", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID2;
    const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single();
    if (error && error.code !== "PGRST116") {
      console.error("[/api/user] Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    if (!user) {
      return res.json({
        id: userId,
        name: "Dev User",
        email: "dev@example.com",
        gender: "male",
        persona: "sweet_supportive",
        premium_user: false,
        locale: "hi-IN",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    res.json(user);
  } catch (error) {
    console.error("[/api/user] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router2.patch("/api/user", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID2;
    const updates = req.body;
    const { data, error } = await supabase.from("users").upsert({
      id: userId,
      ...updates,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (error) {
      console.error("[PATCH /api/user] Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (error) {
    console.error("[PATCH /api/user] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router2.patch("/api/user/persona", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID2;
    const { persona } = req.body;
    if (!persona || !PERSONA_CONFIGS[persona]) {
      return res.status(400).json({ error: "Invalid persona type" });
    }
    const { data, error } = await supabase.from("users").upsert({
      id: userId,
      persona,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (error) {
      console.error("[PATCH /api/user/persona] Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, persona, personaConfig: PERSONA_CONFIGS[persona] });
  } catch (error) {
    console.error("[PATCH /api/user/persona] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router2.get("/api/user/usage", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID2;
    let stats = { total_messages: 0, total_call_seconds: 0 };
    let isPremium = false;
    try {
      const { data: usage, error } = await supabase.from("usage_stats").select("*").eq("user_id", userId).single();
      if (!error && usage) {
        stats = usage;
      } else if (error && error.code !== "PGRST116") {
        console.error("[/api/user/usage] Supabase error:", error);
      }
      const { data: user } = await supabase.from("users").select("premium_user").eq("id", userId).single();
      isPremium = user?.premium_user || false;
    } catch (e) {
      console.log("[/api/user/usage] Using default stats");
    }
    res.json({
      messageCount: stats.total_messages,
      callDuration: stats.total_call_seconds,
      premiumUser: isPremium,
      messageLimitReached: !isPremium && stats.total_messages >= 20,
      callLimitReached: !isPremium && stats.total_call_seconds >= 135
    });
  } catch (error) {
    console.error("[/api/user/usage] Error:", error);
    res.json({
      messageCount: 0,
      callDuration: 0,
      premiumUser: false,
      messageLimitReached: false,
      callLimitReached: false
    });
  }
});
router2.post("/api/user/usage", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID2;
    const { incrementMessages, incrementCallSeconds } = req.body;
    let currentMessages = 0;
    let currentSeconds = 0;
    try {
      const { data: current } = await supabase.from("usage_stats").select("*").eq("user_id", userId).single();
      currentMessages = current?.total_messages || 0;
      currentSeconds = current?.total_call_seconds || 0;
      const { data, error } = await supabase.from("usage_stats").upsert({
        user_id: userId,
        total_messages: currentMessages + (incrementMessages || 0),
        total_call_seconds: currentSeconds + (incrementCallSeconds || 0),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select().single();
      if (!error && data) {
        currentMessages = data.total_messages;
        currentSeconds = data.total_call_seconds;
      } else if (error) {
        console.error("[POST /api/user/usage] Supabase error:", error);
      }
    } catch (e) {
      console.log("[POST /api/user/usage] Using local counters");
    }
    res.json({
      messageCount: currentMessages + (incrementMessages || 0),
      callDuration: currentSeconds + (incrementCallSeconds || 0)
    });
  } catch (error) {
    console.error("[POST /api/user/usage] Error:", error);
    res.json({ messageCount: 0, callDuration: 0 });
  }
});
router2.get("/api/user/summary", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID2;
    const { data: summary, error } = await supabase.from("user_summary_latest").select("*").eq("user_id", userId).single();
    if (error && error.code !== "PGRST116") {
      console.error("[/api/user/summary] Supabase error:", error);
    }
    if (!summary) {
      return res.json({
        partner_type_one_liner: null,
        top_3_traits_you_value: [],
        what_you_might_work_on: [],
        next_time_focus: [],
        love_language_guess: null,
        communication_fit: null,
        confidence_score: 30
      });
    }
    res.json(summary);
  } catch (error) {
    console.error("[/api/user/summary] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router2.get("/api/sessions", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID2;
    const { data: sessions, error } = await supabase.from("sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
    if (error) {
      console.error("[/api/sessions] Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(sessions || []);
  } catch (error) {
    console.error("[/api/sessions] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router2.post("/api/sessions", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID2;
    const { type = "chat" } = req.body;
    const { data: user } = await supabase.from("users").select("persona, persona_prompt").eq("id", userId).single();
    const { data: session, error } = await supabase.from("sessions").insert({
      user_id: userId,
      type,
      persona_snapshot: user?.persona_prompt || {},
      started_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (error) {
      console.error("[POST /api/sessions] Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(session);
  } catch (error) {
    console.error("[POST /api/sessions] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router2.get("/api/sessions/:sessionId/messages", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { data: messages, error } = await supabase.from("messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
    if (error) {
      console.error("[/api/sessions/:id/messages] Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(messages || []);
  } catch (error) {
    console.error("[/api/sessions/:id/messages] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router2.post("/api/messages", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID2;
    const { session_id, role, text, tag = "general" } = req.body;
    const { data: message, error } = await supabase.from("messages").insert({
      session_id,
      user_id: userId,
      role,
      text,
      tag
    }).select().single();
    if (error) {
      console.error("[POST /api/messages] Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(message);
  } catch (error) {
    console.error("[POST /api/messages] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router2.get("/api/personas", async (_req, res) => {
  res.json(PERSONA_CONFIGS);
});
var supabase_api_default = router2;

// server/routes/auth.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, phoneNumber, gender } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    if (!isSupabaseConfigured) {
      return res.json({
        id: "dev-user-id",
        name,
        email,
        gender: gender || "prefer_not_to_say",
        premium_user: false,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const { data: existingUser } = await supabase.from("users").select("*").eq("email", email).single();
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const { data: newUser, error } = await supabase.from("users").insert({
      name,
      email,
      phone_number: phoneNumber,
      gender: gender || "prefer_not_to_say",
      persona: "sweet_supportive",
      premium_user: false,
      locale: "hi-IN",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (error) {
      console.error("[POST /api/auth/signup] Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(newUser);
  } catch (error) {
    console.error("[POST /api/auth/signup] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router3.post("/api/auth/email-login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!isSupabaseConfigured) {
      return res.json({
        user: {
          id: "dev-user-id",
          name: "Dev User",
          email,
          gender: "male",
          premium_user: false,
          persona: "sweet_supportive"
        }
      });
    }
    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();
    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("[POST /api/auth/email-login] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router3.all("/api/auth/login", async (req, res) => {
  if (req.method === "POST") {
    if (req.body.email) {
      try {
        const { email } = req.body;
        if (!isSupabaseConfigured) {
          return res.json({
            user: {
              id: "dev-user-id",
              name: "Dev User",
              email,
              gender: "male",
              premium_user: false,
              persona: "sweet_supportive"
            }
          });
        }
        const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();
        if (error || !user) {
          return res.status(404).json({ error: "User not found" });
        }
        return res.json({ user });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
    return res.status(400).json({ error: "Invalid login request" });
  }
  res.status(404).json({ error: "Endpoint not found. Did you mean POST /api/auth/email-login?" });
});
var auth_default = router3;

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(supabase_api_default);
app.use(auth_default);
app.use(chat_default);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/payment/config", (_req, res) => {
  res.json({
    cashfreeMode: process.env.CASHFREE_MODE || "sandbox",
    currency: "INR",
    plans: { daily: 19, weekly: 49 }
  });
});
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { planType } = req.body;
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res.status(503).json({
        error: "Payment service not configured. Please set up Cashfree credentials."
      });
    }
    res.status(503).json({ error: "Payment integration pending. Contact support." });
  } catch (error) {
    console.error("[Payment] Error creating order:", error);
    res.status(500).json({ error: error.message || "Failed to create payment order" });
  }
});
app.post("/api/user/usage", async (_req, res) => {
  res.json({
    messageCount: 0,
    callDuration: 0,
    premiumUser: false,
    messageLimitReached: false,
    callLimitReached: false
  });
});
app.patch("/api/user/personality", async (req, res) => {
  try {
    const { personalityId } = req.body;
    console.log(`[User Personality] Selected: ${personalityId}`);
    res.json({ success: true, personalityId });
  } catch (error) {
    res.status(500).json({ error: "Failed to update personality" });
  }
});
app.get("/api/auth/session", async (req, res) => {
  try {
    res.json({
      user: {
        id: "dev-user-id",
        name: "Dev User",
        email: "dev@example.com",
        persona: "sweet_supportive",
        premium_user: false,
        gender: "male",
        onboarding_complete: false
        // Track if user completed onboarding
      }
    });
  } catch (error) {
    console.error("[/api/auth/session] Error:", error);
    res.status(500).json({ error: "Failed to get session" });
  }
});
(async () => {
  console.log("[Server] Starting server with Supabase integration...");
  const server = new Server(app);
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`\u{1F680} Server running on port ${port}`);
    console.log(`[Server] \u2705 Frontend server listening on port ${port}`);
    console.log(`[Server] \u{1F504} Supabase API routes integrated`);
    console.log(`[Server] \u{1F504} Chat API routes integrated`);
  });
})();
