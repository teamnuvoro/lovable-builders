/**
 * VOICE CALL PROTECTION LAYER
 * 
 * ⚠️ CRITICAL: This file protects the working voice call configuration.
 * DO NOT modify the voice call config without updating this protection layer.
 * 
 * Last Working State: 2026-01-14
 * - Vapi handles: WebRTC, transcriber, call orchestration
 * - Voice: Vapi native "Neha" (Indian-accented female)
 * - Model: OpenAI gpt-4o-mini
 * - Transcriber: Deepgram nova-2 (Hindi)
 * - Config format: FLAT (no assistant wrapper, no systemMessage, no model.messages)
 */

import { isBillingError } from './vapiCallManager';

export interface ProtectedCallConfig {
  name: string;
  firstMessage: string;
  model: {
    provider: "openai";
    model: "gpt-4o-mini";
  };
  voice: {
    provider: "vapi";
    voiceId: "Neha";
  };
  transcriber: {
    provider: "deepgram";
    model: "nova-2";
    language: "hi";
  };
}

/**
 * LOCKED: Working voice call configuration
 * DO NOT CHANGE without updating protection checks below
 */
export const LOCKED_VOICE_CONFIG: ProtectedCallConfig = {
  name: "Riya",
  firstMessage: "Hey baby! Kaisi ho tum? I missed talking to you.",
  model: {
    provider: "openai",
    model: "gpt-4o-mini"
  },
  voice: {
    provider: "vapi",
    voiceId: "Neha" // Indian-accented female voice - LOCKED
  },
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "hi"
  }
};

/**
 * VALIDATION: Ensures config matches locked working state
 * Throws error if config is invalid
 */
export function validateCallConfig(config: any): ProtectedCallConfig {
  // CRITICAL CHECKS - DO NOT REMOVE
  
  // 1. Ensure voice provider is "vapi" (not sarvam, not custom-voice)
  if (config.voice?.provider !== "vapi") {
    throw new Error(`[VOICE PROTECTION] Invalid voice provider: ${config.voice?.provider}. Must be "vapi". Voice calls are locked to Vapi native voices.`);
  }
  
  // 2. Ensure voiceId is "Neha" (Indian-accented, locked)
  if (config.voice?.voiceId !== "Neha") {
    throw new Error(`[VOICE PROTECTION] Invalid voiceId: ${config.voice?.voiceId}. Must be "Neha" (Indian-accented female voice).`);
  }
  
  // 3. Ensure NO assistant wrapper (causes 400 errors)
  if (config.assistant) {
    throw new Error(`[VOICE PROTECTION] Config must be FLAT format. "assistant" wrapper is not allowed and causes 400 errors.`);
  }
  
  // 4. Ensure NO systemMessage (causes 400 errors)
  if (config.systemMessage) {
    throw new Error(`[VOICE PROTECTION] "systemMessage" is not allowed and causes 400 errors. Use "firstMessage" instead.`);
  }
  
  // 5. Ensure NO model.messages (causes 400 errors)
  if (config.model?.messages) {
    throw new Error(`[VOICE PROTECTION] "model.messages" is not allowed for Vapi web calls and causes 400 errors.`);
  }
  
  // 6. Ensure NO instructions (causes 400 errors)
  if (config.instructions) {
    throw new Error(`[VOICE PROTECTION] "instructions" is not allowed and causes 400 errors. Use "firstMessage" instead.`);
  }
  
  // 7. Ensure model provider is openai
  if (config.model?.provider !== "openai") {
    throw new Error(`[VOICE PROTECTION] Model provider must be "openai". Current: ${config.model?.provider}`);
  }
  
  // 8. Ensure transcriber is deepgram
  if (config.transcriber?.provider !== "deepgram") {
    throw new Error(`[VOICE PROTECTION] Transcriber provider must be "deepgram". Current: ${config.transcriber?.provider}`);
  }
  
  // All checks passed - return validated config
  return config as ProtectedCallConfig;
}

/**
 * PROTECTED: Get the locked voice call config
 * Use this instead of creating config manually
 */
export function getProtectedCallConfig(): ProtectedCallConfig {
  // Return a deep copy to prevent mutations
  return JSON.parse(JSON.stringify(LOCKED_VOICE_CONFIG));
}

/**
 * PROTECTION: Check if error is a billing issue (not a code issue)
 */
export function isVoiceCallBillingError(error: any): boolean {
  return isBillingError(error);
}

/**
 * PROTECTION: Validate that voice call feature is not broken
 * Call this before making any changes to voice call code
 */
export function assertVoiceCallIntegrity() {
  const config = getProtectedCallConfig();
  
  // Validate the locked config itself
  try {
    validateCallConfig(config);
    console.log('[VOICE PROTECTION] ✅ Voice call config integrity verified');
  } catch (error: any) {
    console.error('[VOICE PROTECTION] ❌ CRITICAL: Locked config is invalid!', error.message);
    throw new Error(`[VOICE PROTECTION] Locked config is broken: ${error.message}`);
  }
}
