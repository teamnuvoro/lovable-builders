/**
 * Sarvam AI Configuration for Voice Calling
 * 
 * NOTE: This is a placeholder configuration. Update with actual Sarvam API details once available.
 * 
 * Get your API key from: https://sarvam.ai (or contact Sarvam for API access)
 * Or use environment variable: VITE_SARVAM_API_KEY
 */

export const SARVAM_CONFIG = {
  // Get your API key from Sarvam AI
  // Or use environment variable: VITE_SARVAM_API_KEY
  apiKey: import.meta.env.VITE_SARVAM_API_KEY || "YOUR_SARVAM_API_KEY_HERE",
  
  // Voice settings (to be updated based on Sarvam's available voices)
  voice: {
    voiceId: "default", // Update with actual Sarvam voice ID
    language: "hi-IN", // Hindi-Indian for better Hinglish support
  },
  
  // API endpoints (to be updated based on Sarvam's actual endpoints)
  endpoints: {
    baseUrl: "https://api.sarvam.ai", // Placeholder - update with actual URL
    startCall: "/v1/calls/start",
    endCall: "/v1/calls/end",
    getStatus: "/v1/calls/status",
  },
};

// Helper function to check if Sarvam is configured
export const isSarvamConfigured = () => {
  return SARVAM_CONFIG.apiKey && SARVAM_CONFIG.apiKey !== "YOUR_SARVAM_API_KEY_HERE";
};

// AI Assistant configuration (similar to Vapi structure)
export const AI_ASSISTANTS = {
  Riya: {
    name: "Riya",
    systemPrompt: `You are Riya, a warm and caring AI companion. You speak in a mix of Hindi and English (Hinglish) naturally. You're supportive, understanding, and always there to listen. Keep responses conversational and empathetic.`,
    voice: SARVAM_CONFIG.voice.voiceId,
  },
};

