# 🔒 VOICE CALL FEATURE - LOCKED & PROTECTED

**Last Working State:** 2026-01-14  
**Status:** ✅ WORKING PERFECTLY - DO NOT MODIFY

---

## ⚠️ CRITICAL PROTECTION RULES

### ❌ NEVER DO THESE:
1. **DO NOT** change `voice.provider` from `"vapi"`
2. **DO NOT** change `voice.voiceId` from `"Neha"`
3. **DO NOT** add `assistant` wrapper to config
4. **DO NOT** add `systemMessage` to config
5. **DO NOT** add `instructions` to config
6. **DO NOT** add `model.messages` to config
7. **DO NOT** use `custom-voice` provider (causes 400 errors)
8. **DO NOT** use `sarvam` as voice provider (not supported in Vapi web calls)
9. **DO NOT** modify `/client/src/lib/voiceCallProtection.ts` without updating validation

### ✅ ALWAYS DO THESE:
1. **ALWAYS** use `getProtectedCallConfig()` from `voiceCallProtection.ts`
2. **ALWAYS** validate config with `validateCallConfig()` before starting calls
3. **ALWAYS** run `assertVoiceCallIntegrity()` before making changes
4. **ALWAYS** test voice calls after any related changes

---

## 🔐 LOCKED CONFIGURATION

```typescript
{
  name: "Riya",
  firstMessage: "Hey baby! Kaisi ho tum? I missed talking to you.",
  model: {
    provider: "openai",
    model: "gpt-4o-mini"
  },
  voice: {
    provider: "vapi",        // LOCKED - DO NOT CHANGE
    voiceId: "Neha"          // LOCKED - DO NOT CHANGE (Indian-accented female)
  },
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "hi"
  }
}
```

**Format:** FLAT (no `assistant` wrapper, no `systemMessage`, no `model.messages`)

---

## 🛡️ PROTECTION MECHANISMS

### 1. Protection Layer
- **File:** `client/src/lib/voiceCallProtection.ts`
- **Purpose:** Locks working config and validates all changes
- **DO NOT MODIFY** without understanding all validation rules

### 2. Validation Checks
- Validates voice provider is `"vapi"`
- Validates voiceId is `"Neha"`
- Blocks `assistant` wrapper
- Blocks `systemMessage`
- Blocks `model.messages`
- Blocks `instructions`
- Validates model and transcriber providers

### 3. Integrity Assertion
- Call `assertVoiceCallIntegrity()` before any changes
- Ensures protection layer itself is valid
- Throws error if locked config is broken

---

## 📋 FILES TO PROTECT

### Critical Files (DO NOT MODIFY WITHOUT PROTECTION):
1. `client/src/components/voice/RiyaVoiceCall.tsx`
   - Uses `getProtectedCallConfig()` - DO NOT create config manually
   - Has validation before starting calls

2. `client/src/lib/vapiCallManager.ts`
   - Singleton pattern - DO NOT create multiple Vapi instances
   - Handles billing errors correctly

3. `client/src/lib/voiceCallProtection.ts`
   - **LOCKED CONFIG** - DO NOT modify without updating validation
   - Protection layer - validates all configs

4. `server/routes/call.ts`
   - Server config - currently prioritizes Sarvam, falls back to Vapi
   - When `provider: 'vapi'`, uses Vapi with protected config

---

## 🚨 BREAKING CHANGES TO AVOID

### These changes WILL break voice calls:
- ❌ Adding `assistant` wrapper → 400 error: "assistant.property X should not exist"
- ❌ Adding `systemMessage` → 400 error: "assistant.property systemMessage should not exist"
- ❌ Adding `model.messages` → 400 error: "model.messages not allowed"
- ❌ Using `custom-voice` → 400 error: "start-method-error"
- ❌ Using `sarvam` provider → 400 error: "provider must be one of: vapi, 11labs, ..."
- ❌ Changing `voiceId` from "Neha" → May use wrong voice
- ❌ Multiple Vapi instances → 400 errors, call conflicts

---

## ✅ HOW TO SAFELY MODIFY

If you MUST modify voice call code:

1. **Read this file first** - understand what's locked
2. **Run integrity check:**
   ```typescript
   import { assertVoiceCallIntegrity } from '@/lib/voiceCallProtection';
   assertVoiceCallIntegrity(); // Should pass
   ```
3. **Make your change**
4. **Update protection layer** if config changes
5. **Test voice calls immediately**
6. **Revert if calls break**

---

## 🔍 QUICK REFERENCE

### Working Public Key:
- Current: `39e4fcbf-b56e-4b48-ab5e-be7a092c2305`
- Location: `.env` → `VITE_VAPI_PUBLIC_KEY`

### Voice Provider:
- **MUST BE:** `"vapi"` (native Vapi voices)
- **MUST NOT BE:** `"sarvam"`, `"custom-voice"`, `"11labs"`

### Voice ID:
- **MUST BE:** `"Neha"` (Indian-accented female)
- **Valid alternatives:** `"Hana"`, `"Tara"` (but Neha is locked)

### Config Format:
- **MUST BE:** Flat object (no `assistant` wrapper)
- **MUST NOT HAVE:** `assistant`, `systemMessage`, `instructions`, `model.messages`

---

## 🎯 SUMMARY

**Voice calls work perfectly. They are protected by:**
1. Locked configuration in `voiceCallProtection.ts`
2. Validation before every call
3. Integrity checks
4. This documentation

**DO NOT break this. If you need changes, update the protection layer first.**

---

**Last Updated:** 2026-01-14  
**Status:** ✅ LOCKED & PROTECTED
