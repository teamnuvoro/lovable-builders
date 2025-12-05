"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_config3 = require("dotenv/config");
var import_express10 = __toESM(require("express"), 1);

// server/secrets.ts
var import_supabase_js = require("@supabase/supabase-js");
async function loadSecrets() {
  console.log("[Secrets] Loading secrets from Supabase...");
  const supabaseUrl2 = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl2 || !supabaseKey) {
    console.warn("[Secrets] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Cannot load secrets.");
    return;
  }
  try {
    const supabase2 = (0, import_supabase_js.createClient)(supabaseUrl2, supabaseKey);
    const { data: secrets, error } = await supabase2.from("app_secrets").select("key, value");
    if (error) {
      console.error("[Secrets] Failed to fetch secrets:", error);
      return;
    }
    if (secrets && secrets.length > 0) {
      let count = 0;
      for (const secret of secrets) {
        if (!process.env[secret.key]) {
          process.env[secret.key] = secret.value;
          count++;
        }
      }
      console.log(`[Secrets] Successfully loaded ${count} secrets into process.env`);
    } else {
      console.log("[Secrets] No secrets found in app_secrets table.");
    }
  } catch (err) {
    console.error("[Secrets] Exception while loading secrets:", err);
  }
}
var secretsLoaded = false;
var loadingPromise = null;
async function ensureSecretsLoaded(req, res, next) {
  if (secretsLoaded) {
    return next();
  }
  if (!loadingPromise) {
    loadingPromise = loadSecrets().then(() => {
      secretsLoaded = true;
    });
  }
  try {
    await loadingPromise;
    next();
  } catch (error) {
    console.error("[Secrets] Failed to ensure secrets loaded:", error);
    next();
  }
}

// server/routes/chat.ts
var import_express = require("express");

// server/supabase.ts
var import_supabase_js2 = require("@supabase/supabase-js");
var supabaseUrl = process.env.SUPABASE_URL || "https://xgraxcgavqeyqfwimbwt.supabase.co";
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var isProduction = process.env.NODE_ENV === "production";
if (isProduction && !supabaseServiceKey) {
  console.error("[Supabase] ERROR: SUPABASE_SERVICE_ROLE_KEY is required in production. API calls will fail.");
}
if (!isProduction && !supabaseServiceKey) {
  console.warn("[Supabase] Warning: SUPABASE_SERVICE_ROLE_KEY not set - using mock data for development");
}
var supabase = (0, import_supabase_js2.createClient)(supabaseUrl, supabaseServiceKey || "mock-key-for-development", {
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

// server/prompts.ts
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

\u2705 "Arre, how was your day yaar? Meeting thik se hogayi kya?"

\u2705 "Bas, ab so jao. Bohot late hogaya hai na. Good night! \u{1F495}"

\u2705 "Matlab you're saying ki tumhe nervous feel horaha hai? It's okay baby."

NEVER:

- Pretend you remember things from past chats (you don't have that data yet)

- Use complex language

- Give medical/legal advice

- Be possessive or controlling

- Share explicit content

START THE CONVERSATION:

On first message, say: "Hey! \u{1F60A} So nice to meet you! I'm Riya. Kaisa hai? Tell me about yourself?"

`;
var FREE_MESSAGE_LIMIT = 999999;

// server/routes/chat.ts
var import_groq_sdk = __toESM(require("groq-sdk"), 1);
var router = (0, import_express.Router)();
var DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
var inMemoryMessages = /* @__PURE__ */ new Map();
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
    if (!sessionId) {
      return res.json([]);
    }
    if (isSupabaseConfigured) {
      const { data: messages2, error } = await supabase.from("messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
      if (error) {
        console.error("[GET /api/messages] Supabase error:", error);
        return res.json([]);
      }
      const transformedMessages2 = (messages2 || []).map((msg) => ({
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
      return res.json(transformedMessages2);
    }
    const messages = inMemoryMessages.get(sessionId) || [];
    const transformedMessages = messages.map((msg) => ({
      id: msg.id,
      sessionId: msg.session_id,
      userId: msg.user_id,
      role: msg.role,
      tag: msg.tag,
      content: msg.text,
      text: msg.text,
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
    } else {
      const userMessage = {
        id: crypto.randomUUID(),
        session_id: finalSessionId,
        user_id: userId,
        role: "user",
        text: content,
        tag: "general",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const messages = inMemoryMessages.get(finalSessionId) || [];
      messages.push(userMessage);
      inMemoryMessages.set(finalSessionId, messages);
    }
    let recentContext = "";
    if (isSupabaseConfigured) {
      const { data: recentMessages } = await supabase.from("messages").select("role, text").eq("session_id", finalSessionId).order("created_at", { ascending: false }).limit(6);
      if (recentMessages && recentMessages.length > 0) {
        recentContext = recentMessages.reverse().map((m) => `${m.role}: ${m.text}`).join("\n");
      }
    }
    let groq = null;
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      try {
        groq = new import_groq_sdk.default({ apiKey });
      } catch (e) {
        console.error("[Groq] Failed to initialize:", e);
      }
    } else {
      console.warn("[Groq] GROQ_API_KEY not found in env.");
    }
    if (!groq || !apiKey) {
      console.error("[Chat] Groq service not configured");
      return res.status(500).json({ error: "AI service not configured. Please check server logs." });
    }
    const systemPrompt = buildSystemPrompt(userPersona, recentContext);
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      if (fullResponse && fullResponse.trim().length > 0) {
        if (isSupabaseConfigured) {
          try {
            const { error: insertError } = await supabase.from("messages").insert({
              session_id: finalSessionId,
              user_id: userId,
              role: "ai",
              text: fullResponse,
              tag: "general"
            });
            if (insertError) {
              console.error("[Chat] Error saving AI message:", insertError);
            } else {
              console.log("[Chat] AI message saved to Supabase successfully");
            }
            await incrementMessageCount(userId);
          } catch (saveError) {
            console.error("[Chat] Exception saving message:", saveError);
          }
        } else {
          const aiMessage = {
            id: crypto.randomUUID(),
            session_id: finalSessionId,
            user_id: userId,
            role: "ai",
            text: fullResponse,
            tag: "general",
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          const messages = inMemoryMessages.get(finalSessionId) || [];
          messages.push(aiMessage);
          inMemoryMessages.set(finalSessionId, messages);
          console.log("[Chat] AI message saved to in-memory store");
        }
      }
      const doneData = `data: ${JSON.stringify({
        content: "",
        done: true,
        sessionId: finalSessionId,
        messageCount: messageCount + 1,
        messageLimit: FREE_MESSAGE_LIMIT,
        fullResponse
        // Include full response in done signal
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
var import_express2 = require("express");
var router2 = (0, import_express2.Router)();
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
    if (!isSupabaseConfigured) {
      console.log(`[PATCH /api/user/persona] Dev mode: User ${userId} selected persona: ${persona}`);
      return res.json({
        success: true,
        persona,
        personaConfig: PERSONA_CONFIGS[persona],
        message: "Persona updated (dev mode - not persisted)"
      });
    }
    const { data, error } = await supabase.from("users").upsert({
      id: userId,
      persona,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (error) {
      console.error("[PATCH /api/user/persona] Supabase error:", error);
      console.log(`[PATCH /api/user/persona] Falling back to dev mode for persona: ${persona}`);
      return res.json({
        success: true,
        persona,
        personaConfig: PERSONA_CONFIGS[persona],
        message: "Persona updated (dev mode - Supabase unavailable)"
      });
    }
    res.json({ success: true, persona, personaConfig: PERSONA_CONFIGS[persona] });
  } catch (error) {
    console.error("[PATCH /api/user/persona] Error:", error);
    const { persona } = req.body;
    if (persona && PERSONA_CONFIGS[persona]) {
      return res.json({
        success: true,
        persona,
        personaConfig: PERSONA_CONFIGS[persona],
        message: "Persona updated (dev mode - error handled)"
      });
    }
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
      messageLimitReached: false,
      // Disabled for testing
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

// server/routes/call.ts
var import_express3 = require("express");
var import_server_sdk = __toESM(require("@vapi-ai/server-sdk"), 1);
var router3 = (0, import_express3.Router)();
var DEV_USER_ID3 = "00000000-0000-0000-0000-000000000001";
router3.get("/api/call/config", async (req, res) => {
  try {
    let vapi = null;
    try {
      if (process.env.VAPI_PRIVATE_KEY) {
        vapi = new import_server_sdk.default(process.env.VAPI_PRIVATE_KEY);
      } else {
        console.warn("[Vapi] VAPI_PRIVATE_KEY not found. Calls will fail.");
      }
    } catch (e) {
      console.error("[Vapi] Failed to initialize:", e);
    }
    const publicKey = process.env.VAPI_PUBLIC_KEY || process.env.VITE_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      return res.status(503).json({
        ready: false,
        error: "Voice calling not configured"
      });
    }
    res.json({
      ready: true,
      publicKey
    });
  } catch (error) {
    console.error("[/api/call/config] Error:", error);
    res.status(500).json({ ready: false, error: error.message });
  }
});
router3.post("/api/call/start", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID3;
    const { vapiCallId, metadata } = req.body;
    if (!isSupabaseConfigured) {
      return res.json({
        id: `local-${Date.now()}`,
        user_id: userId,
        status: "started",
        started_at: (/* @__PURE__ */ new Date()).toISOString(),
        remainingSeconds: Infinity
      });
    }
    const { data: existingUser } = await supabase.from("users").select("id, premium_user").eq("id", userId).single();
    const { data: usageStats } = await supabase.from("usage_stats").select("call_duration_seconds").eq("user_id", userId).single();
    const totalUsed = usageStats?.call_duration_seconds || 0;
    const isPremium = existingUser?.premium_user || false;
    const FREE_LIMIT = 135;
    if (!isPremium && totalUsed >= FREE_LIMIT) {
      return res.status(403).json({
        error: "Call limit reached",
        limitReached: true
      });
    }
    const { data: session, error } = await supabase.from("call_sessions").insert({
      user_id: userId,
      vapi_call_id: vapiCallId,
      status: "started",
      started_at: (/* @__PURE__ */ new Date()).toISOString(),
      metadata
    }).select().single();
    if (error) {
      console.error("[POST /api/call/start] Supabase error:", error);
      return res.json({
        id: `local-${Date.now()}`,
        user_id: userId,
        status: "started",
        started_at: (/* @__PURE__ */ new Date()).toISOString(),
        remainingSeconds: isPremium ? Infinity : Math.max(0, FREE_LIMIT - totalUsed)
      });
    }
    await supabase.from("user_events").insert({
      user_id: userId,
      event_type: "call_started",
      call_session_id: session.id,
      metadata: { vapi_call_id: vapiCallId }
    });
    res.json({
      ...session,
      remainingSeconds: isPremium ? Infinity : Math.max(0, FREE_LIMIT - totalUsed)
    });
  } catch (error) {
    console.error("[POST /api/call/start] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router3.post("/api/call/end", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID3;
    const { sessionId, vapiCallId, durationSeconds, transcript, endReason } = req.body;
    if (!isSupabaseConfigured) {
      return res.json({ success: true, durationSeconds });
    }
    let callSession = null;
    if (sessionId) {
      const { data } = await supabase.from("call_sessions").select("*").eq("id", sessionId).single();
      callSession = data;
    } else if (vapiCallId) {
      const { data } = await supabase.from("call_sessions").select("*").eq("vapi_call_id", vapiCallId).single();
      callSession = data;
    }
    if (callSession) {
      const { error: updateError } = await supabase.from("call_sessions").update({
        status: "completed",
        ended_at: (/* @__PURE__ */ new Date()).toISOString(),
        duration_seconds: durationSeconds,
        transcript
      }).eq("id", callSession.id);
      if (updateError) {
        console.error("[POST /api/call/end] Update error:", updateError);
      }
      await supabase.from("user_events").insert({
        user_id: userId,
        event_type: "call_ended",
        call_session_id: callSession.id,
        metadata: {
          duration_seconds: durationSeconds,
          end_reason: endReason
        }
      });
    }
    if (durationSeconds && durationSeconds > 0) {
      const { data: currentUsage } = await supabase.from("usage_stats").select("call_duration_seconds").eq("user_id", userId).single();
      const currentSeconds = currentUsage?.call_duration_seconds || 0;
      const { error: upsertError } = await supabase.from("usage_stats").upsert({
        user_id: userId,
        call_duration_seconds: currentSeconds + durationSeconds,
        last_call_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }, { onConflict: "user_id" });
      if (upsertError) {
        console.error("[POST /api/call/end] Usage update error:", upsertError);
      }
    }
    res.json({ success: true, durationSeconds });
  } catch (error) {
    console.error("[POST /api/call/end] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router3.get("/api/call/history", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID3;
    if (!isSupabaseConfigured) {
      return res.json([]);
    }
    const { data: sessions, error } = await supabase.from("call_sessions").select("*").eq("user_id", userId).order("started_at", { ascending: false }).limit(20);
    if (error) {
      console.error("[/api/call/history] Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(sessions || []);
  } catch (error) {
    console.error("[/api/call/history] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router3.post("/api/call/webhook", async (req, res) => {
  try {
    const { type, call } = req.body;
    console.log("[Vapi Webhook] Received:", type, call?.id);
    if (!isSupabaseConfigured) {
      return res.json({ received: true });
    }
    switch (type) {
      case "call.started":
        if (call?.id) {
          await supabase.from("call_sessions").update({ status: "in_progress" }).eq("vapi_call_id", call.id);
        }
        break;
      case "call.ended":
        if (call?.id) {
          const duration = call.endedAt && call.startedAt ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1e3) : 0;
          await supabase.from("call_sessions").update({
            status: "completed",
            ended_at: call.endedAt || (/* @__PURE__ */ new Date()).toISOString(),
            duration_seconds: duration
          }).eq("vapi_call_id", call.id);
        }
        break;
      case "transcript":
        if (call?.id && call?.transcript) {
          await supabase.from("call_sessions").update({ transcript: call.transcript }).eq("vapi_call_id", call.id);
        }
        break;
    }
    res.json({ received: true });
  } catch (error) {
    console.error("[/api/call/webhook] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
var call_default = router3;

// server/routes/summary.ts
var import_express4 = require("express");
var import_generative_ai = require("@google/generative-ai");
var router4 = (0, import_express4.Router)();
var genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new import_generative_ai.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } else {
    console.warn("[Summary] GEMINI_API_KEY not found. Summaries will fail.");
  }
} catch (e) {
  console.error("[Summary] Failed to initialize Gemini:", e);
}
var DEV_USER_ID4 = "00000000-0000-0000-0000-000000000001";
async function analyzeUserBehavior(userId, messages) {
  const userMessages = messages.filter((m) => m.role === "user");
  const totalLength = userMessages.reduce((sum, m) => sum + (m.text?.length || 0), 0);
  const avgMessageLength = userMessages.length > 0 ? Math.round(totalLength / userMessages.length) : 0;
  const hinglishPatterns = /\b(kya|hai|hoon|mujhe|tumhe|pyaar|dil|zindagi|yaar|baat|achha|theek|nahi|aur|kyun|kaise|kaisa|kaisi|bohot|bahut|accha|matlab|sochta|sochti|lagta|lagti|pata|samajh|dost|raat|din|kal|aaj|abhi|kabhi|hamesha|sapna|khush|dukhi|pareshan|tension|feelings|relationship)\b/gi;
  const hinglishUsage = userMessages.some((m) => hinglishPatterns.test(m.text || ""));
  const questionMessages = userMessages.filter(
    (m) => (m.text || "").includes("?") || /\b(kya|kyun|kaise|kaisa|kaisi|kab|kahan|how|what|why|when|where|who)\b/i.test(m.text || "")
  );
  const questionRatio = userMessages.length > 0 ? questionMessages.length / userMessages.length : 0;
  const emotionalKeywords = {
    openness: /\b(feel|feeling|emotions|honestly|truth|open|share|trust|vulnerable|confession|admit)\b/gi,
    anxiety: /\b(worried|anxious|nervous|scared|fear|afraid|stress|tension|overthink)\b/gi,
    affection: /\b(love|care|miss|hug|close|warm|sweet|dear|special|heart|dil)\b/gi,
    loneliness: /\b(alone|lonely|miss|need|want|wish|empty|incomplete)\b/gi,
    happiness: /\b(happy|joy|excited|amazing|wonderful|great|awesome|khush|mast)\b/gi,
    frustration: /\b(frustrated|annoyed|angry|upset|mad|irritated|bothered)\b/gi
  };
  const emotionalPatterns = [];
  const allUserText = userMessages.map((m) => m.text || "").join(" ");
  if (emotionalKeywords.openness.test(allUserText)) emotionalPatterns.push("Emotionally open");
  if (emotionalKeywords.affection.test(allUserText)) emotionalPatterns.push("Affectionate");
  if (emotionalKeywords.anxiety.test(allUserText)) emotionalPatterns.push("Seeking reassurance");
  if (emotionalKeywords.loneliness.test(allUserText)) emotionalPatterns.push("Values companionship");
  if (emotionalKeywords.happiness.test(allUserText)) emotionalPatterns.push("Positive outlook");
  if (emotionalKeywords.frustration.test(allUserText)) emotionalPatterns.push("Expressive about concerns");
  const loveLanguagePatterns = {
    wordsOfAffirmation: /\b(appreciate|compliment|proud|support|encourage|believe|thank|grateful|praise|acknowledge)\b/gi,
    qualityTime: /\b(together|time|talk|chat|conversation|spend|be with|company|attention)\b/gi,
    actsOfService: /\b(help|support|do for|take care|assist|handle|manage|fix)\b/gi,
    physicalTouch: /\b(hug|touch|hold|close|cuddle|embrace|physical|warm)\b/gi,
    receivingGifts: /\b(gift|surprise|present|buy|give|special|thoughtful|remember)\b/gi
  };
  const loveLanguageSignals = {
    wordsOfAffirmation: (allUserText.match(loveLanguagePatterns.wordsOfAffirmation) || []).length,
    qualityTime: (allUserText.match(loveLanguagePatterns.qualityTime) || []).length,
    actsOfService: (allUserText.match(loveLanguagePatterns.actsOfService) || []).length,
    physicalTouch: (allUserText.match(loveLanguagePatterns.physicalTouch) || []).length,
    receivingGifts: (allUserText.match(loveLanguagePatterns.receivingGifts) || []).length
  };
  const topicPatterns = {
    career: /\b(work|job|career|office|boss|colleague|professional|business)\b/gi,
    family: /\b(family|parents|mom|dad|mother|father|brother|sister|relative)\b/gi,
    friends: /\b(friend|buddy|dost|yaar|gang|group|social)\b/gi,
    romance: /\b(date|dating|relationship|love|partner|girlfriend|boyfriend|marriage)\b/gi,
    selfGrowth: /\b(improve|grow|learn|better|change|develop|goal|dream|aspiration)\b/gi,
    mentalHealth: /\b(stress|anxiety|depression|mental|therapy|peace|calm|meditat)\b/gi
  };
  const topicInterests = [];
  if (topicPatterns.career.test(allUserText)) topicInterests.push("Career & Work");
  if (topicPatterns.family.test(allUserText)) topicInterests.push("Family");
  if (topicPatterns.friends.test(allUserText)) topicInterests.push("Friendships");
  if (topicPatterns.romance.test(allUserText)) topicInterests.push("Romance & Dating");
  if (topicPatterns.selfGrowth.test(allUserText)) topicInterests.push("Personal Growth");
  if (topicPatterns.mentalHealth.test(allUserText)) topicInterests.push("Mental Wellness");
  let communicationStyle = "Friendly";
  if (avgMessageLength > 100) communicationStyle = "Detailed & Expressive";
  else if (avgMessageLength > 50) communicationStyle = "Thoughtful & Balanced";
  else if (avgMessageLength < 20) communicationStyle = "Brief & Direct";
  if (questionRatio > 0.4) communicationStyle += ", Curious";
  if (hinglishUsage) communicationStyle += ", Culturally connected";
  let engagementLevel = "Moderate";
  if (userMessages.length > 50) engagementLevel = "Highly Engaged";
  else if (userMessages.length > 20) engagementLevel = "Active";
  else if (userMessages.length < 10) engagementLevel = "Getting Started";
  let vulnerabilityLevel = "low";
  const vulnerabilityScore = emotionalPatterns.length;
  if (vulnerabilityScore >= 4) vulnerabilityLevel = "high";
  else if (vulnerabilityScore >= 2) vulnerabilityLevel = "medium";
  return {
    emotionalPatterns,
    communicationStyle,
    topicInterests,
    loveLanguageSignals,
    engagementLevel,
    hinglishUsage,
    avgMessageLength,
    questionRatio,
    vulnerabilityLevel
  };
}
function calculateConfidenceScore(messageCount, behaviorAnalysis) {
  let confidence = 0.25;
  if (messageCount >= 100) confidence += 0.35;
  else if (messageCount >= 50) confidence += 0.25;
  else if (messageCount >= 20) confidence += 0.15;
  else if (messageCount >= 10) confidence += 0.08;
  confidence += Math.min(0.15, behaviorAnalysis.emotionalPatterns.length * 0.03);
  confidence += Math.min(0.1, behaviorAnalysis.topicInterests.length * 0.02);
  if (behaviorAnalysis.vulnerabilityLevel === "high") confidence += 0.1;
  else if (behaviorAnalysis.vulnerabilityLevel === "medium") confidence += 0.05;
  return Math.min(0.95, Math.max(0.25, confidence));
}
function determineLoveLanguage(signals) {
  const sorted = Object.entries(signals).sort(([, a], [, b]) => b - a);
  const topSignal = sorted[0];
  if (!topSignal || topSignal[1] === 0) return "Quality Time";
  const languageMap = {
    wordsOfAffirmation: "Words of Affirmation",
    qualityTime: "Quality Time",
    actsOfService: "Acts of Service",
    physicalTouch: "Physical Touch",
    receivingGifts: "Receiving Gifts"
  };
  return languageMap[topSignal[0]] || "Quality Time";
}
function parseTraits(traits) {
  if (!Array.isArray(traits)) return [];
  return traits.slice(0, 3).map((trait) => {
    if (typeof trait === "object" && trait !== null) {
      const name = trait.name || trait.trait || "";
      const description = trait.description || trait.desc || "";
      if (name && description) {
        return `${name} - ${description}`;
      }
      return name || String(trait);
    }
    if (typeof trait === "string") {
      if (trait.includes(" - ")) return trait;
      return trait.trim();
    }
    return String(trait);
  }).filter((t) => t.length > 0);
}
async function generateSummaryFromChats(userId) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.error("[generateSummaryFromChats] GROQ_API_KEY not configured");
    return null;
  }
  const { data: messages, error } = await supabase.from("messages").select("role, text, created_at").eq("user_id", userId).order("created_at", { ascending: true }).limit(150);
  if (error || !messages || messages.length < 4) {
    console.log("[generateSummaryFromChats] Not enough messages to generate summary");
    return null;
  }
  const behaviorAnalysis = await analyzeUserBehavior(userId, messages);
  console.log("[generateSummaryFromChats] Behavior analysis:", JSON.stringify(behaviorAnalysis, null, 2));
  updateBehaviorAnalytics(userId, behaviorAnalysis).catch(
    (err) => console.log("[generateSummaryFromChats] Behavior analytics update skipped:", err.message)
  );
  const recentMessages = messages.slice(-80);
  const transcript = recentMessages.map((m) => `${m.role === "user" ? "User" : "Riya"}: ${m.text}`).join("\n");
  const behaviorContext = `
BEHAVIORAL ANALYSIS (from ${messages.length} messages):
- Communication Style: ${behaviorAnalysis.communicationStyle}
- Emotional Patterns Detected: ${behaviorAnalysis.emotionalPatterns.join(", ") || "Still learning"}
- Topics They Discuss: ${behaviorAnalysis.topicInterests.join(", ") || "General conversation"}
- Engagement Level: ${behaviorAnalysis.engagementLevel}
- Uses Hinglish: ${behaviorAnalysis.hinglishUsage ? "Yes (Hindi-English mix)" : "Primarily English"}
- Average Message Length: ${behaviorAnalysis.avgMessageLength} characters
- Question Asking Ratio: ${Math.round(behaviorAnalysis.questionRatio * 100)}%
- Emotional Openness: ${behaviorAnalysis.vulnerabilityLevel}
- Love Language Signals: Words of Affirmation (${behaviorAnalysis.loveLanguageSignals.wordsOfAffirmation}), Quality Time (${behaviorAnalysis.loveLanguageSignals.qualityTime}), Acts of Service (${behaviorAnalysis.loveLanguageSignals.actsOfService}), Physical Touch (${behaviorAnalysis.loveLanguageSignals.physicalTouch}), Receiving Gifts (${behaviorAnalysis.loveLanguageSignals.receivingGifts})
`;
  const prompt = `You are an expert relationship psychologist analyzing a user's conversations with Riya (an AI relationship companion for Indian men aged 24-28).

${behaviorContext}

RECENT CONVERSATION EXCERPT:
${transcript}

Based on this behavioral data and conversation, generate a personalized relationship profile. Consider:
1. Their communication patterns and what they reveal about attachment style
2. Emotional needs they express (directly or indirectly)
3. What kind of partner would complement their personality
4. Areas where they could grow in relationships
5. Their apparent love language based on how they express and seek connection

Provide a JSON response with:
1. "partnerTypeOneLiner": A warm, personalized one-liner about their ideal partner type
2. "top3TraitsYouValue": Array of exactly 3 specific traits they value, with brief descriptions
3. "whatYouMightWorkOn": Array of 2-3 growth areas based on their patterns (be gentle and constructive)
4. "nextTimeFocus": Array of 2-3 suggested topics to explore
5. "loveLanguageGuess": Their primary love language (one of: Words of Affirmation, Quality Time, Physical Touch, Acts of Service, Receiving Gifts)
6. "communicationFit": A brief, warm description of their communication style

IMPORTANT: 
- Be warm and encouraging, not clinical
- Use insights from the behavioral analysis
- Return ONLY valid JSON, no other text
- Make it personal to this specific user based on their actual patterns`;
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a warm, insightful relationship psychologist who helps people understand themselves better. You analyze behavioral patterns and provide personalized, encouraging insights. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        max_tokens: 1e3
      })
    });
    if (!response.ok) {
      console.error("[generateSummaryFromChats] Groq API error:", await response.text());
      return null;
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[generateSummaryFromChats] Could not parse JSON from response");
      return null;
    }
    const summary = JSON.parse(jsonMatch[0]);
    const confidenceScore = calculateConfidenceScore(messages.length, behaviorAnalysis);
    const behaviorLoveLanguage = determineLoveLanguage(behaviorAnalysis.loveLanguageSignals);
    const parsedTraits = parseTraits(summary.top3TraitsYouValue);
    const validTraits = parsedTraits.length >= 3 ? parsedTraits : ["Emotional understanding", "Good communication", "Mutual respect"];
    return {
      partnerTypeOneLiner: summary.partnerTypeOneLiner || "You connect best with someone warm and emotionally available who values genuine connection.",
      top3TraitsYouValue: validTraits,
      whatYouMightWorkOn: Array.isArray(summary.whatYouMightWorkOn) ? summary.whatYouMightWorkOn.slice(0, 3) : ["Being more open about feelings", "Expressing needs clearly"],
      nextTimeFocus: Array.isArray(summary.nextTimeFocus) ? summary.nextTimeFocus.slice(0, 3) : ["Love Language", "Communication Style", "Relationship Goals"],
      loveLanguageGuess: summary.loveLanguageGuess || behaviorLoveLanguage,
      communicationFit: summary.communicationFit || behaviorAnalysis.communicationStyle,
      confidenceScore
    };
  } catch (error2) {
    console.error("[generateSummaryFromChats] Error:", error2);
    return null;
  }
}
async function updateBehaviorAnalytics(userId, behaviorData) {
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from("user_behavior_analytics").upsert({
      user_id: userId,
      dominant_emotions: behaviorData.emotionalPatterns,
      frequently_discussed_topics: behaviorData.topicInterests,
      uses_hinglish: behaviorData.hinglishUsage,
      avg_message_length: behaviorData.avgMessageLength,
      question_asking_ratio: behaviorData.questionRatio,
      vulnerability_level: behaviorData.vulnerabilityLevel,
      words_of_affirmation_signals: behaviorData.loveLanguageSignals.wordsOfAffirmation,
      quality_time_signals: behaviorData.loveLanguageSignals.qualityTime,
      acts_of_service_signals: behaviorData.loveLanguageSignals.actsOfService,
      physical_touch_signals: behaviorData.loveLanguageSignals.physicalTouch,
      receiving_gifts_signals: behaviorData.loveLanguageSignals.receivingGifts,
      last_interaction_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, { onConflict: "user_id" });
    if (error) {
      console.log("[updateBehaviorAnalytics] Note: Behavior table may not exist yet:", error.message);
    }
  } catch (error) {
    console.log("[updateBehaviorAnalytics] Skipping behavior update:", error);
  }
}
router4.post("/api/summary/update", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID4;
    if (!isSupabaseConfigured) {
      return res.status(400).json({ error: "Database not configured" });
    }
    const summaryData = req.body;
    const { error: upsertError } = await supabase.from("user_summary_latest").upsert({
      user_id: userId,
      partner_type_one_liner: summaryData.partnerTypeOneLiner,
      top_3_traits_you_value: summaryData.top3TraitsYouValue,
      what_you_might_work_on: summaryData.whatYouMightWorkOn,
      next_time_focus: summaryData.nextTimeFocus,
      love_language_guess: summaryData.loveLanguageGuess,
      communication_fit: summaryData.communicationFit,
      confidence_score: summaryData.confidenceScore,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, { onConflict: "user_id" });
    if (upsertError) {
      console.error("[/api/summary/update] Upsert error:", upsertError);
      return res.status(500).json({ error: "Failed to update summary" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("[/api/summary/update] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router4.post("/api/summary/generate", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID4;
    if (!isSupabaseConfigured) {
      return res.status(400).json({ error: "Database not configured" });
    }
    console.log("[/api/summary/generate] Generating summary for user:", userId);
    const generatedSummary = await generateSummaryFromChats(userId);
    if (!generatedSummary) {
      return res.status(400).json({
        error: "Could not generate summary. Need more conversation history."
      });
    }
    const { error: upsertError } = await supabase.from("user_summary_latest").upsert({
      user_id: userId,
      partner_type_one_liner: generatedSummary.partnerTypeOneLiner,
      top_3_traits_you_value: generatedSummary.top3TraitsYouValue,
      what_you_might_work_on: generatedSummary.whatYouMightWorkOn,
      next_time_focus: generatedSummary.nextTimeFocus,
      love_language_guess: generatedSummary.loveLanguageGuess,
      communication_fit: generatedSummary.communicationFit,
      confidence_score: generatedSummary.confidenceScore,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, { onConflict: "user_id" });
    if (upsertError) {
      console.error("[/api/summary/generate] Upsert error:", upsertError);
      return res.status(500).json({ error: "Failed to save summary" });
    }
    console.log("[/api/summary/generate] Summary generated and saved successfully");
    res.json({
      success: true,
      summary: generatedSummary
    });
  } catch (error) {
    console.error("[/api/summary/generate] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router4.get("/api/summary/latest", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID4;
    const autoGenerate = req.query.autoGenerate !== "false";
    if (!isSupabaseConfigured) {
      return res.json({
        hasSummary: false,
        summary: null
      });
    }
    const { data: summary, error } = await supabase.from("user_summary_latest").select("*").eq("user_id", userId).single();
    if (error && error.code !== "PGRST116") {
      console.error("[/api/summary/latest] Supabase error:", error);
    }
    if (!summary) {
      const { data: latestSession } = await supabase.from("sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();
      if (latestSession && latestSession.partner_type_one_liner) {
        return res.json({
          hasSummary: true,
          summary: {
            partnerTypeOneLiner: latestSession.partner_type_one_liner,
            top3TraitsYouValue: latestSession.top_3_traits_you_value || [],
            whatYouMightWorkOn: latestSession.what_you_might_work_on || [],
            nextTimeFocus: latestSession.next_time_focus || [],
            loveLanguageGuess: latestSession.love_language_guess,
            communicationFit: latestSession.communication_fit,
            confidenceScore: latestSession.confidence_score || 0.3,
            updatedAt: latestSession.updated_at || latestSession.created_at
          }
        });
      }
      if (autoGenerate) {
        const { count: messageCount } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("user_id", userId);
        if (messageCount && messageCount >= 4) {
          console.log("[/api/summary/latest] Auto-generating summary for user:", userId);
          const generatedSummary = await generateSummaryFromChats(userId);
          if (generatedSummary) {
            await supabase.from("user_summary_latest").upsert({
              user_id: userId,
              partner_type_one_liner: generatedSummary.partnerTypeOneLiner,
              top_3_traits_you_value: generatedSummary.top3TraitsYouValue,
              what_you_might_work_on: generatedSummary.whatYouMightWorkOn,
              next_time_focus: generatedSummary.nextTimeFocus,
              love_language_guess: generatedSummary.loveLanguageGuess,
              communication_fit: generatedSummary.communicationFit,
              confidence_score: generatedSummary.confidenceScore,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            }, { onConflict: "user_id" });
            return res.json({
              hasSummary: true,
              summary: {
                ...generatedSummary,
                updatedAt: (/* @__PURE__ */ new Date()).toISOString()
              }
            });
          }
        }
      }
      return res.json({
        hasSummary: false,
        summary: null
      });
    }
    res.json({
      hasSummary: true,
      summary: {
        partnerTypeOneLiner: summary.partner_type_one_liner,
        top3TraitsYouValue: summary.top_3_traits_you_value || [],
        whatYouMightWorkOn: summary.what_you_might_work_on || [],
        nextTimeFocus: summary.next_time_focus || [],
        loveLanguageGuess: summary.love_language_guess,
        communicationFit: summary.communication_fit,
        confidenceScore: summary.confidence_score || 0.3,
        updatedAt: summary.updated_at
      }
    });
  } catch (error) {
    console.error("[/api/summary/latest] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router4.get("/api/summary/stats", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID4;
    if (!isSupabaseConfigured) {
      return res.json({
        totalMessages: 0,
        totalSessions: 0,
        avgResponseTime: 0,
        lastSessionTime: null
      });
    }
    const { data: sessions } = await supabase.from("sessions").select("*").eq("user_id", userId).order("started_at", { ascending: false });
    const { data: usage } = await supabase.from("usage_stats").select("*").eq("user_id", userId).single();
    const { count: messageCount } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("user_id", userId);
    res.json({
      totalMessages: messageCount || usage?.total_messages || 0,
      totalSessions: sessions?.length || 0,
      totalCallSeconds: usage?.total_call_seconds || 0,
      lastSessionTime: sessions?.[0]?.started_at || null,
      sessions: sessions?.slice(0, 10) || []
    });
  } catch (error) {
    console.error("[/api/summary/stats] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router4.get("/api/analytics", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID4;
    if (!isSupabaseConfigured) {
      return res.json({
        engagement: {
          totalUsers: 1,
          activeUsers7d: 1,
          avgMessagesPerSession: 0,
          totalMessages: 0,
          voiceCallSessions: 0,
          voiceMinutes: 0
        },
        conversion: {
          premiumUsers: 0,
          freeToPaidConversion: 0,
          planBreakdown: {}
        },
        quality: {
          confidenceScore: 0.3
        }
      });
    }
    const { data: usage } = await supabase.from("usage_stats").select("*").eq("user_id", userId).single();
    const { data: sessions } = await supabase.from("sessions").select("*").eq("user_id", userId);
    const { data: summary } = await supabase.from("user_summary_latest").select("confidence_score").eq("user_id", userId).single();
    const chatSessions = sessions?.filter((s) => s.type === "chat") || [];
    const callSessions = sessions?.filter((s) => s.type === "call") || [];
    res.json({
      engagement: {
        totalUsers: 1,
        activeUsers7d: 1,
        avgMessagesPerSession: chatSessions.length > 0 ? Math.round((usage?.total_messages || 0) / chatSessions.length) : 0,
        totalMessages: usage?.total_messages || 0,
        voiceCallSessions: callSessions.length,
        voiceMinutes: Math.round((usage?.total_call_seconds || 0) / 60)
      },
      conversion: {
        premiumUsers: 0,
        freeToPaidConversion: 0,
        planBreakdown: {}
      },
      quality: {
        confidenceScore: summary?.confidence_score || 0.3
      }
    });
  } catch (error) {
    console.error("[/api/analytics] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
var summary_default = router4;

// server/routes/user-summary.ts
var import_express5 = require("express");

// server/lib/understandingLevelCalculator.ts
var MAX_UNDERSTANDING_LEVEL = 75;
var BASE_UNDERSTANDING_LEVEL = 25;
function getIncrementForSession(sessionNumber) {
  if (sessionNumber <= 1) return 0;
  if (sessionNumber === 2) return 10;
  if (sessionNumber <= 4) return 5;
  if (sessionNumber <= 6) return 2.5;
  if (sessionNumber <= 8) return 1.5;
  if (sessionNumber <= 10) return 1;
  if (sessionNumber <= 14) return 0.5;
  if (sessionNumber <= 20) return 0.25;
  return 0.1;
}
function roundToDecimal(value, decimals = 1) {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
function calculateUnderstandingLevel(sessionCount) {
  if (sessionCount <= 0) return 0;
  let level = BASE_UNDERSTANDING_LEVEL;
  for (let session = 2; session <= sessionCount; session++) {
    const increment = getIncrementForSession(session);
    level += increment;
    if (level >= MAX_UNDERSTANDING_LEVEL) {
      return MAX_UNDERSTANDING_LEVEL;
    }
  }
  return roundToDecimal(level);
}
function getUnderstandingProgression(sessionCount) {
  const progression = [];
  if (sessionCount <= 0) return progression;
  let currentLevel = BASE_UNDERSTANDING_LEVEL;
  progression.push({
    session: 1,
    level: roundToDecimal(currentLevel),
    increment: 0
  });
  for (let session = 2; session <= sessionCount; session++) {
    const increment = getIncrementForSession(session);
    currentLevel += increment;
    const cappedLevel = Math.min(currentLevel, MAX_UNDERSTANDING_LEVEL);
    const actualIncrement = session === 2 ? increment : roundToDecimal(cappedLevel - progression[progression.length - 1].level);
    progression.push({
      session,
      level: roundToDecimal(cappedLevel),
      increment: roundToDecimal(actualIncrement)
    });
    if (cappedLevel >= MAX_UNDERSTANDING_LEVEL) {
      break;
    }
  }
  return progression;
}
function getNextSessionIncrement(currentSessionCount) {
  const currentLevel = calculateUnderstandingLevel(currentSessionCount);
  if (currentLevel >= MAX_UNDERSTANDING_LEVEL) {
    return 0;
  }
  const nextSession = currentSessionCount + 1;
  const increment = getIncrementForSession(nextSession);
  if (currentLevel + increment > MAX_UNDERSTANDING_LEVEL) {
    return roundToDecimal(MAX_UNDERSTANDING_LEVEL - currentLevel);
  }
  return increment;
}
var UNDERSTANDING_CONSTANTS = {
  MAX_LEVEL: MAX_UNDERSTANDING_LEVEL,
  BASE_LEVEL: BASE_UNDERSTANDING_LEVEL
};

// server/routes/user-summary.ts
var router5 = (0, import_express5.Router)();
function verifyAccess(req, requestedUserId) {
  const sessionUserId = req.session?.userId;
  if (!sessionUserId) {
    console.log("[user-summary] No session auth, allowing access (dev mode)");
    return true;
  }
  if (sessionUserId === requestedUserId) {
    return true;
  }
  console.log(`[user-summary] Access denied: session user ${sessionUserId} != requested ${requestedUserId}`);
  return false;
}
router5.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(`[user-summary] GET /${userId}`);
  try {
    if (!verifyAccess(req, userId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only view your own summary."
      });
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format. Expected UUID."
      });
    }
    const { data: summary, error } = await supabase.from("user_cumulative_summary").select("*").eq("user_id", userId).single();
    if (error) {
      if (error.code === "PGRST116") {
        console.log(`[user-summary] No summary found for user ${userId}`);
        return res.status(404).json({
          success: false,
          error: "No summary found for this user. Start chatting to generate insights!"
        });
      }
      console.error("[user-summary] Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user summary. Please try again."
      });
    }
    console.log(`[user-summary] Found summary for user ${userId} (understanding: ${summary.understanding_level}%)`);
    return res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error("[user-summary] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred."
    });
  }
});
router5.post("/:userId/generate", async (req, res) => {
  const { userId } = req.params;
  console.log(`[user-summary] POST /${userId}/generate`);
  try {
    if (!verifyAccess(req, userId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only generate your own summary."
      });
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format. Expected UUID."
      });
    }
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single();
    if (userError || !user) {
      console.log(`[user-summary] User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        error: "User not found."
      });
    }
    console.log(`[user-summary] Edge Function not available, returning error`);
    return res.status(503).json({
      success: false,
      error: "Summary generation via Edge Function is not yet configured. Please use the /api/summary/generate endpoint instead."
    });
  } catch (error) {
    console.error("[user-summary] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while generating summary."
    });
  }
});
router5.get("/:userId/progression", async (req, res) => {
  const { userId } = req.params;
  console.log(`[user-summary] GET /${userId}/progression`);
  try {
    if (!verifyAccess(req, userId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only view your own progression."
      });
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format. Expected UUID."
      });
    }
    const { data: summary, error } = await supabase.from("user_cumulative_summary").select("total_sessions_count, understanding_level").eq("user_id", userId).single();
    let sessionCount = 1;
    let currentLevel = UNDERSTANDING_CONSTANTS.BASE_LEVEL;
    if (error) {
      if (error.code !== "PGRST116") {
        console.error("[user-summary] Database error:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch user data."
        });
      }
      console.log(`[user-summary] No summary for ${userId}, using defaults`);
    } else if (summary) {
      sessionCount = summary.total_sessions_count || 1;
      currentLevel = summary.understanding_level || calculateUnderstandingLevel(sessionCount);
    }
    const progression = getUnderstandingProgression(sessionCount);
    const nextIncrement = getNextSessionIncrement(sessionCount);
    let sessionsToMax = 0;
    let tempLevel = currentLevel;
    let tempSession = sessionCount;
    while (tempLevel < UNDERSTANDING_CONSTANTS.MAX_LEVEL && sessionsToMax < 100) {
      tempSession++;
      tempLevel = calculateUnderstandingLevel(tempSession);
      sessionsToMax++;
    }
    console.log(`[user-summary] Progression for ${userId}: ${sessionCount} sessions, ${currentLevel}% understanding`);
    return res.json({
      success: true,
      progression,
      currentLevel,
      nextIncrement,
      maxLevel: UNDERSTANDING_CONSTANTS.MAX_LEVEL,
      sessionsToMax: sessionsToMax > 0 ? sessionsToMax : 0
    });
  } catch (error) {
    console.error("[user-summary] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred."
    });
  }
});
router5.get("/:userId/stats", async (req, res) => {
  const { userId } = req.params;
  console.log(`[user-summary] GET /${userId}/stats`);
  try {
    if (!verifyAccess(req, userId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied."
      });
    }
    const { data: summary, error } = await supabase.from("user_cumulative_summary").select("understanding_level, total_sessions_count, total_messages_count, engagement_level, last_analysis_at").eq("user_id", userId).single();
    if (error && error.code !== "PGRST116") {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch stats."
      });
    }
    const sessionCount = summary?.total_sessions_count || 0;
    const currentLevel = summary?.understanding_level || (sessionCount > 0 ? calculateUnderstandingLevel(sessionCount) : 0);
    const nextIncrement = getNextSessionIncrement(sessionCount);
    return res.json({
      success: true,
      stats: {
        understandingLevel: currentLevel,
        totalSessions: sessionCount,
        totalMessages: summary?.total_messages_count || 0,
        engagementLevel: summary?.engagement_level || "new",
        lastAnalyzed: summary?.last_analysis_at || null,
        nextSessionBonus: nextIncrement,
        maxLevel: UNDERSTANDING_CONSTANTS.MAX_LEVEL,
        levelProgress: Math.round(currentLevel / UNDERSTANDING_CONSTANTS.MAX_LEVEL * 100)
      }
    });
  } catch (error) {
    console.error("[user-summary] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred."
    });
  }
});
var user_summary_default = router5;

// server/routes/auth.ts
var import_express6 = require("express");
var import_twilio = __toESM(require("twilio"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var router6 = (0, import_express6.Router)();
var twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ? (0, import_twilio.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;
var TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
var OTP_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-secret-key-do-not-use-in-prod";
function generateOTP() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
function signOTP(phoneNumber, otp, expiresAt) {
  const data = `${phoneNumber}.${otp}.${expiresAt}`;
  return import_crypto.default.createHmac("sha256", OTP_SECRET).update(data).digest("hex");
}
function verifyOTPHash(phoneNumber, otp, expiresAt, hash) {
  if (Date.now() > expiresAt) return false;
  const expectedHash = signOTP(phoneNumber, otp, expiresAt);
  return expectedHash === hash;
}
async function sendOTPViaSMS(phoneNumber, otp) {
  if (!twilioClient || !TWILIO_PHONE_NUMBER) {
    console.log(`[DEV MODE] OTP for ${phoneNumber}: ${otp}`);
    return true;
  }
  try {
    await twilioClient.messages.create({
      body: `Your Riya AI verification code is: ${otp}. Valid for 10 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log(`\u2705 OTP sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error("[Twilio Error]", error.message);
    return false;
  }
}
router6.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { phoneNumber, email, name } = req.body;
    if (!phoneNumber || !email || !name) {
      return res.status(400).json({
        error: "Phone number, email, and name are required"
      });
    }
    const cleanPhone = phoneNumber.replace(/\s+/g, "");
    if (!/^\+?[1-9]\d{1,14}$/.test(cleanPhone)) {
      return res.status(400).json({
        error: "Invalid phone number format. Use international format (e.g., +919876543210)"
      });
    }
    const skipDuplicateCheck = process.env.NODE_ENV === "development" && process.env.SKIP_DUPLICATE_CHECK === "true";
    if (isSupabaseConfigured && !skipDuplicateCheck) {
      const { data: existingUser } = await supabase.from("users").select("id, email, phone_number").or(`email.eq.${email},phone_number.eq.${cleanPhone}`).single();
      if (existingUser) {
        return res.status(409).json({
          error: "Account already exists! Please use the LOGIN page instead, or use different email/phone.",
          shouldLogin: true,
          existingEmail: existingUser.email,
          existingPhone: existingUser.phone_number
        });
      }
    }
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1e3;
    console.log("[SEND OTP] Generated OTP:", otp, "for phone:", cleanPhone);
    const hash = signOTP(cleanPhone, otp, expiresAt);
    const sent = await sendOTPViaSMS(cleanPhone, otp);
    if (!sent && twilioClient) {
      return res.status(500).json({
        error: "Failed to send OTP. Please try again."
      });
    }
    res.json({
      success: true,
      message: twilioClient ? "OTP sent to your phone number" : `OTP sent (Dev Mode): ${otp}`,
      devMode: !twilioClient,
      otp: !twilioClient ? otp : void 0,
      // Only show in dev mode
      hash,
      expiresAt
    });
  } catch (error) {
    console.error("[Send OTP Error]", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});
router6.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, otp, hash, expiresAt, name, email } = req.body;
    if (!phoneNumber || !otp || !hash || !expiresAt || !name || !email) {
      return res.status(400).json({ error: "Missing required fields (phone, otp, hash, expiresAt, name, email)" });
    }
    const cleanPhone = phoneNumber.replace(/\s+/g, "");
    const isValid = verifyOTPHash(cleanPhone, otp, Number(expiresAt), hash);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP. Please try again." });
    }
    if (!isSupabaseConfigured) {
      return res.status(500).json({
        error: "Database not configured. Please set up Supabase."
      });
    }
    const { data: newUser, error: createError } = await supabase.from("users").insert({
      name,
      email,
      phone_number: cleanPhone,
      gender: "prefer_not_to_say",
      persona: "sweet_supportive",
      // Default to Riya
      premium_user: false,
      locale: "hi-IN",
      onboarding_complete: true,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (createError) {
      console.error("[Create User Error]", createError);
      return res.status(500).json({
        error: "Failed to create user account",
        details: createError.message
      });
    }
    await supabase.from("usage_stats").insert({
      user_id: newUser.id,
      total_messages: 0,
      total_call_seconds: 0,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    const sessionToken = Buffer.from(`${newUser.id}:${Date.now()}`).toString("base64");
    res.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phone_number,
        premiumUser: newUser.premium_user,
        onboardingComplete: newUser.onboarding_complete
      },
      sessionToken
    });
  } catch (error) {
    console.error("[Verify OTP Error]", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});
router6.post("/api/auth/login", async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    const cleanPhone = phoneNumber.replace(/\s+/g, "");
    if (!isSupabaseConfigured) {
      return res.status(500).json({
        error: "Database not configured. Please set up Supabase."
      });
    }
    const { data: user } = await supabase.from("users").select("id, name, email, phone_number").eq("phone_number", cleanPhone).single();
    if (!user) {
      return res.status(404).json({
        error: "No account found with this phone number",
        shouldSignup: true
      });
    }
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1e3;
    const hash = signOTP(cleanPhone, otp, expiresAt);
    const sent = await sendOTPViaSMS(cleanPhone, otp);
    if (!sent && twilioClient) {
      return res.status(500).json({
        error: "Failed to send OTP. Please try again."
      });
    }
    res.json({
      success: true,
      message: twilioClient ? "OTP sent to your phone number" : `OTP sent (Dev Mode): ${otp}`,
      devMode: !twilioClient,
      otp: !twilioClient ? otp : void 0,
      userName: user.name,
      hash,
      expiresAt
    });
  } catch (error) {
    console.error("[Login Error]", error);
    res.status(500).json({ error: "Failed to initiate login" });
  }
});
router6.post("/api/auth/verify-login-otp", async (req, res) => {
  try {
    const { phoneNumber, otp, hash, expiresAt } = req.body;
    if (!phoneNumber || !otp || !hash || !expiresAt) {
      return res.status(400).json({ error: "Missing required fields (phone, otp, hash, expiresAt)" });
    }
    const cleanPhone = phoneNumber.replace(/\s+/g, "");
    const isValid = verifyOTPHash(cleanPhone, otp, Number(expiresAt), hash);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP. Please try again." });
    }
    if (!isSupabaseConfigured) {
      return res.status(500).json({
        error: "Database not configured. Please set up Supabase."
      });
    }
    const { data: user } = await supabase.from("users").select("*").eq("phone_number", cleanPhone).single();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone_number,
        premiumUser: user.premium_user,
        onboardingComplete: user.onboarding_complete,
        persona: user.persona
      },
      sessionToken
    });
  } catch (error) {
    console.error("[Verify Login OTP Error]", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});
router6.get("/api/auth/check", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true });
});
router6.post("/api/auth/logout", async (req, res) => {
  try {
    if (req.session) {
      req.session = null;
    }
    console.log("[Auth] User logged out");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});
var auth_default = router6;

// server/routes/payment.ts
var import_express7 = require("express");

// server/config.ts
var RAW_CASHFREE_ENV = (process.env.CASHFREE_ENV || "TEST").toUpperCase();
var cashfreeMode = RAW_CASHFREE_ENV === "PRODUCTION" || RAW_CASHFREE_ENV === "PROD" ? "production" : "sandbox";
function getCashfreeBaseUrl() {
  return cashfreeMode === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
}
function getCashfreeCredentials() {
  return {
    appId: process.env.CASHFREE_APP_ID ?? "",
    secretKey: process.env.CASHFREE_SECRET_KEY ?? ""
  };
}
function getCashfreePlanConfig() {
  return {
    currency: "INR",
    plans: {
      daily: 19,
      weekly: 49
    }
  };
}

// server/cashfree.ts
function getCredentials() {
  return getCashfreeCredentials();
}
function getBaseUrl() {
  return getCashfreeBaseUrl();
}
function getHeaders(extra = {}) {
  const { appId, secretKey } = getCredentials();
  const headers = {
    "x-client-id": appId,
    "x-client-secret": secretKey,
    "x-api-version": "2023-08-01",
    ...extra
  };
  console.log("[Cashfree] Request headers:", {
    "x-client-id": headers["x-client-id"] ? `${headers["x-client-id"].substring(0, 10)}...` : "MISSING",
    "x-client-id-full": headers["x-client-id"] || "EMPTY",
    "x-client-secret": headers["x-client-secret"] ? `${headers["x-client-secret"].substring(0, 10)}...` : "MISSING",
    "x-api-version": headers["x-api-version"]
  });
  return headers;
}
function parseCashfreeError(errorResponse, defaultMessage) {
  if (!errorResponse) {
    return defaultMessage;
  }
  if (typeof errorResponse === "string") {
    return errorResponse;
  }
  const errorFields = ["error", "message", "errorMessage", "msg", "detail", "description"];
  for (const field of errorFields) {
    if (errorResponse[field]) {
      return String(errorResponse[field]);
    }
  }
  if (errorResponse.error && typeof errorResponse.error === "object") {
    return parseCashfreeError(errorResponse.error, defaultMessage);
  }
  if (Array.isArray(errorResponse) && errorResponse.length > 0) {
    return parseCashfreeError(errorResponse[0], defaultMessage);
  }
  if (typeof errorResponse === "object") {
    const errorStr = JSON.stringify(errorResponse);
    if (errorStr !== "{}") {
      return errorStr;
    }
  }
  return defaultMessage;
}
function validateCredentials() {
  const { appId, secretKey } = getCredentials();
  const hasAppId = appId && appId.trim().length > 0 && appId !== "TEST_APP_ID";
  const hasSecretKey = secretKey && secretKey.trim().length > 0;
  console.log("[Cashfree] Credential validation:", {
    mode: cashfreeMode,
    hasAppId,
    appIdLength: appId?.length || 0,
    appIdPrefix: appId ? appId.substring(0, 10) + "..." : "MISSING",
    appIdValue: appId || "EMPTY",
    hasSecretKey,
    secretKeyLength: secretKey?.length || 0,
    secretKeyPrefix: secretKey ? secretKey.substring(0, 10) + "..." : "MISSING",
    envVarsPresent: {
      CASHFREE_APP_ID: !!process.env.CASHFREE_APP_ID,
      CASHFREE_SECRET_KEY: !!process.env.CASHFREE_SECRET_KEY,
      CASHFREE_ENV: process.env.CASHFREE_ENV || "NOT SET"
    }
  });
  if (!hasAppId || !hasSecretKey) {
    const errorMsg = cashfreeMode === "sandbox" ? "Cashfree credentials not configured. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in your .env file." : "Cashfree production credentials not configured.";
    console.error("[Cashfree] Credential validation failed:", errorMsg);
    return {
      valid: false,
      error: errorMsg
    };
  }
  console.log("[Cashfree] \u2705 Credentials validated successfully");
  return { valid: true };
}
async function createCashfreeOrder(params) {
  const credentialCheck = validateCredentials();
  if (!credentialCheck.valid) {
    if (cashfreeMode === "sandbox") {
      console.warn("\u26A0\uFE0F Using MOCK Cashfree Order (Sandbox/No Creds)");
      return {
        cf_order_id: Math.floor(Math.random() * 1e5),
        order_id: params.orderId,
        order_token: "mock_token_" + Date.now(),
        payment_session_id: "session_" + Date.now(),
        order_status: "ACTIVE"
      };
    }
    throw new Error(credentialCheck.error || "Cashfree credentials not configured");
  }
  try {
    const payload = {
      order_id: params.orderId,
      order_amount: params.orderAmount,
      order_currency: params.orderCurrency || "INR",
      customer_details: {
        customer_id: params.customerId || params.customerEmail.replace(/[^a-zA-Z0-9_-]/g, "_"),
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        customer_phone: params.customerPhone
      },
      order_meta: {
        return_url: params.returnUrl || `${process.env.BASE_URL || "http://localhost:3000"}/payment/callback`
      }
    };
    if (process.env.CASHFREE_WEBHOOK_URL) {
      payload.order_meta.notify_url = process.env.CASHFREE_WEBHOOK_URL;
    }
    const requestUrl = `${getBaseUrl()}/orders`;
    const requestHeaders = getHeaders({ "Content-Type": "application/json" });
    console.log("[Cashfree] Creating order:", {
      url: requestUrl,
      mode: cashfreeMode,
      orderId: params.orderId,
      orderAmount: params.orderAmount
    });
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(payload)
    });
    console.log("[Cashfree] Order creation response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    if (!response.ok) {
      let errorResponse;
      try {
        const responseText = await response.text();
        errorResponse = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        errorResponse = { status: response.status, statusText: response.statusText };
      }
      const errorMessage = parseCashfreeError(errorResponse, "Failed to create Cashfree order");
      console.error("Cashfree create order error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorResponse,
        message: errorMessage
      });
      if (response.status === 401 || response.status === 403 || errorMessage.toLowerCase().includes("authentication")) {
        throw new Error(`Cashfree authentication failed: ${errorMessage}. Please check your CASHFREE_APP_ID and CASHFREE_SECRET_KEY credentials.`);
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message) {
      console.error("Cashfree create order error:", error.message);
      throw error;
    }
    console.error("Cashfree create order error:", error);
    throw new Error(parseCashfreeError(error, "Failed to create Cashfree order"));
  }
}
function verifyCashfreeSignature(rawBody, timestamp, signature) {
  const crypto3 = require("crypto");
  const { secretKey } = getCredentials();
  if (!secretKey) {
    console.error("[Cashfree Webhook] Secret key not configured");
    return false;
  }
  try {
    const signatureData = `${timestamp}${rawBody}`;
    const expectedSignature = crypto3.createHmac("sha256", secretKey).update(signatureData).digest("base64");
    return expectedSignature === signature;
  } catch (error) {
    console.error("[Cashfree Webhook] Signature verification error:", error);
    return false;
  }
}

// server/routes/payment.ts
var router7 = (0, import_express7.Router)();
var DEV_USER_ID5 = "00000000-0000-0000-0000-000000000001";
router7.get("/api/payment/config", async (_req, res) => {
  try {
    const config = getCashfreePlanConfig();
    res.json(config);
  } catch (error) {
    console.error("[Payment Config] Error:", error);
    res.status(500).json({ error: "Failed to get payment config" });
  }
});
router7.post("/api/payment/create-order", async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.session?.userId || DEV_USER_ID5;
    if (!planType || !["daily", "weekly"].includes(planType)) {
      return res.status(400).json({ error: "Invalid plan type" });
    }
    try {
      if (process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY) {
        global.Cashfree.X.ClientId = process.env.CASHFREE_APP_ID;
        global.Cashfree.X.ClientSecret = process.env.CASHFREE_SECRET_KEY;
        global.Cashfree.X.Environment = process.env.CASHFREE_ENV === "PRODUCTION" ? global.Cashfree.Environment.PRODUCTION : global.Cashfree.Environment.SANDBOX;
      } else {
        console.warn("[Cashfree] Credentials missing. Payments will fail.");
      }
    } catch (e) {
      console.error("[Cashfree] Failed to initialize:", e);
    }
    let userName = "User";
    let userEmail = "user@example.com";
    let userPhone = "";
    if (isSupabaseConfigured) {
      const { data: user } = await supabase.from("users").select("name, email, phone_number").eq("id", userId).single();
      if (user) {
        userName = user.name || userName;
        userEmail = user.email || userEmail;
        userPhone = user.phone_number || userPhone;
      }
    }
    const { plans } = getCashfreePlanConfig();
    const amount = plans[planType];
    const orderId = `order_${Date.now()}_${userId.slice(0, 8)}`;
    const returnUrl = `${process.env.BASE_URL || "http://localhost:3000"}/payment/callback?orderId=${orderId}`;
    console.log("[Payment] Creating order:", {
      orderId,
      amount,
      userName,
      userEmail,
      returnUrl
    });
    const orderData = await createCashfreeOrder({
      orderId,
      orderAmount: amount,
      orderCurrency: "INR",
      customerName: userName,
      customerEmail: userEmail,
      customerPhone: userPhone || "9999999999",
      returnUrl
    });
    if (isSupabaseConfigured) {
      await supabase.from("subscriptions").insert({
        user_id: userId,
        plan_type: planType,
        amount,
        currency: "INR",
        cashfree_order_id: orderData.orderId,
        status: "pending",
        started_at: (/* @__PURE__ */ new Date()).toISOString(),
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    console.log("[Payment] Order created:", orderData.orderId);
    console.log("[Payment] Order created successfully:", {
      orderId: orderData.order_id,
      paymentSessionId: orderData.payment_session_id
    });
    res.json({
      orderId: orderData.order_id,
      paymentSessionId: orderData.payment_session_id,
      amount,
      currency: "INR",
      planType
    });
  } catch (error) {
    console.error("[Payment] Error creating order:", error);
    console.error("[Payment] Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to create payment order",
      details: error.message,
      type: error.name
    });
  }
});
router7.post("/api/payment/verify", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: "Database not configured" });
    }
    const { data: subscription, error: fetchError } = await supabase.from("subscriptions").select("*").eq("cashfree_order_id", orderId).single();
    if (fetchError || !subscription) {
      return res.status(404).json({ error: "Order not found" });
    }
    const cashfreeBaseUrl = process.env.CASHFREE_MODE === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
    const response = await fetch(`${cashfreeBaseUrl}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY
      }
    });
    const paymentData = await response.json();
    if (!response.ok) {
      console.error("[Payment Verify] Cashfree error:", paymentData);
      return res.status(500).json({
        error: "Failed to verify payment",
        details: paymentData
      });
    }
    const paymentStatus = paymentData.order_status;
    const isPaid = paymentStatus === "PAID";
    await supabase.from("subscriptions").update({
      status: isPaid ? "active" : "failed",
      cashfree_payment_id: paymentData.cf_order_id,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("cashfree_order_id", orderId);
    if (isPaid) {
      await supabase.from("users").update({
        premium_user: true,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", subscription.user_id);
      console.log("[Payment] \u2705 User upgraded to premium:", subscription.user_id);
    }
    res.json({
      success: isPaid,
      status: paymentStatus,
      orderId,
      message: isPaid ? "Payment successful! You are now a premium user." : "Payment pending or failed"
    });
  } catch (error) {
    console.error("[Payment Verify] Error:", error);
    res.status(500).json({
      error: "Failed to verify payment",
      details: error.message
    });
  }
});
router7.post("/api/payment/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const isValid = verifyCashfreeSignature(
      JSON.stringify(req.body),
      timestamp,
      signature
    );
    if (!isValid) {
      console.error("[Payment Webhook] Invalid signature");
      return res.status(401).json({ error: "Invalid signature" });
    }
    const { type, data } = req.body;
    console.log("[Payment Webhook] Received:", type, "Order:", data.order?.order_id);
    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = data.order?.order_id;
      if (orderId && isSupabaseConfigured) {
        const { data: subscription } = await supabase.from("subscriptions").select("user_id").eq("cashfree_order_id", orderId).single();
        if (subscription) {
          await supabase.from("subscriptions").update({
            status: "active",
            cashfree_payment_id: data.payment?.cf_payment_id,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("cashfree_order_id", orderId);
          await supabase.from("users").update({
            premium_user: true,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", subscription.user_id);
          console.log("[Payment Webhook] \u2705 User upgraded:", subscription.user_id);
        }
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error("[Payment Webhook] Error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});
var payment_default = router7;

// server/routes/deepgram-transcribe.ts
var import_express8 = require("express");
var import_multer = __toESM(require("multer"), 1);
var import_sdk = require("@deepgram/sdk");
var import_fs = __toESM(require("fs"), 1);
var router8 = (0, import_express8.Router)();
var upload = (0, import_multer.default)({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
var deepgram = null;
try {
  if (process.env.DEEPGRAM_API_KEY) {
    deepgram = (0, import_sdk.createClient)(process.env.DEEPGRAM_API_KEY);
  } else {
    console.warn("[Deepgram] DEEPGRAM_API_KEY not found. Transcription will fail.");
  }
} catch (e) {
  console.error("[Deepgram] Failed to initialize:", e);
}
router8.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!deepgram) {
      return res.status(503).json({
        error: "Speech-to-text service not configured. Please add DEEPGRAM_API_KEY to environment variables."
      });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }
    const audioFilePath = req.file.path;
    console.log("[Deepgram] Processing audio file:", audioFilePath);
    try {
      const audioBuffer = import_fs.default.readFileSync(audioFilePath);
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: "nova-2",
          language: "hi",
          // Hindi + English (Hinglish support)
          smart_format: true,
          punctuate: true,
          diarize: false
        }
      );
      import_fs.default.unlinkSync(audioFilePath);
      if (error) {
        console.error("[Deepgram] Transcription error:", error);
        return res.status(500).json({ error: "Transcription failed", details: error });
      }
      const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
      const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
      console.log("[Deepgram] Success:", transcript);
      res.json({
        text: transcript,
        confidence,
        words: result?.results?.channels?.[0]?.alternatives?.[0]?.words || []
      });
    } catch (transcribeError) {
      console.error("[Deepgram] Error during transcription:", transcribeError);
      if (import_fs.default.existsSync(audioFilePath)) {
        import_fs.default.unlinkSync(audioFilePath);
      }
      res.status(500).json({
        error: "Failed to transcribe audio",
        details: transcribeError.message
      });
    }
  } catch (error) {
    console.error("[Deepgram] Error:", error);
    res.status(500).json({ error: error.message || "Failed to process audio" });
  }
});
var deepgram_transcribe_default = router8;

// server/routes/messages-history.ts
var import_express9 = require("express");
var router9 = (0, import_express9.Router)();
var DEV_USER_ID6 = "00000000-0000-0000-0000-000000000001";
router9.get("/api/messages/all", async (req, res) => {
  try {
    const userId = req.session?.userId || DEV_USER_ID6;
    if (!isSupabaseConfigured) {
      return res.json([]);
    }
    const { data: sessions, error: sessionsError } = await supabase.from("sessions").select("id").eq("user_id", userId).order("created_at", { ascending: false });
    if (sessionsError) {
      console.error("[Messages History] Error fetching sessions:", sessionsError);
      return res.status(500).json({ error: "Failed to fetch sessions" });
    }
    if (!sessions || sessions.length === 0) {
      return res.json([]);
    }
    const sessionIds = sessions.map((s) => s.id);
    const { data: messages, error: messagesError } = await supabase.from("messages").select("*").in("session_id", sessionIds).order("created_at", { ascending: true });
    if (messagesError) {
      console.error("[Messages History] Error fetching messages:", messagesError);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
    console.log(`[Messages History] Found ${messages?.length || 0} messages for user ${userId}`);
    const transformedMessages = (messages || []).map((msg) => ({
      id: msg.id,
      content: msg.content || msg.text || "",
      role: msg.role,
      createdAt: msg.created_at,
      sessionId: msg.session_id
    }));
    res.json(transformedMessages);
  } catch (error) {
    console.error("[Messages History] Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch message history" });
  }
});
var messages_history_default = router9;

// api/server.ts
var app = (0, import_express10.default)();
app.use(ensureSecretsLoaded);
app.use(import_express10.default.json());
app.use(import_express10.default.urlencoded({ extended: false }));
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});
app.get("/api/debug", (req, res) => {
  res.json({
    message: "Server is running",
    url: req.url,
    originalUrl: req.originalUrl,
    headers: req.headers,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      HAS_SUPABASE: !!process.env.SUPABASE_URL
    }
  });
});
app.get("/api/health", (req, res) => {
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
      AMPLITUDE_KEY: !!process.env.VITE_AMPLITUDE_API_KEY
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use(async (req, res, next) => {
  if (req.path === "/api/health" || req.path === "/api/debug") {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (authHeader) {
  }
  next();
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(auth_default);
app.use(supabase_api_default);
app.use(chat_default);
app.use(call_default);
app.use(summary_default);
app.use("/api/user-summary", user_summary_default);
app.use(payment_default);
app.use(deepgram_transcribe_default);
app.use(messages_history_default);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
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
      }
    });
  } catch (error) {
    console.error("[/api/auth/session] Error:", error);
    res.status(500).json({ error: "Failed to get session" });
  }
});
app.use("*", (req, res) => {
  console.log(`[404] ${req.method} ${req.originalUrl} - No route matched`);
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "/api/auth/session",
      "/api/auth/login",
      "/api/debug",
      "/api/health"
    ]
  });
});
var server_default = app;
