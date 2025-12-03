# 🎤 Voice Accent Options for Riya

## Current Configuration

**Voice:** Bella (ElevenLabs)
**Voice ID:** `EXAVITQu4vr4xnSDxMaL`
**Accent:** Neutral, warm, less British

---

## Voice Settings Applied

```typescript
{
  provider: "11labs",
  voiceId: "EXAVITQu4vr4xnSDxMaL", // Bella
  stability: 0.6,        // More natural and expressive
  similarityBoost: 0.8,  // Closer to original voice
  style: 0.5,            // Balanced style
  useSpeakerBoost: true  // Enhanced clarity
}
```

### Settings Explained:

- **stability: 0.6** - Lower = more expressive and natural (not robotic)
- **similarityBoost: 0.8** - Higher = stays closer to the voice character
- **style: 0.5** - Balanced between stability and expressiveness
- **useSpeakerBoost: true** - Enhances clarity and presence

---

## Alternative ElevenLabs Voices

If you want to try different voices, replace the `voiceId` in `CallPage.tsx`:

### Option 1: Bella (Current) ✅
```typescript
voiceId: "EXAVITQu4vr4xnSDxMaL"
```
- Warm, friendly, natural
- Less British accent
- Good for casual conversations

### Option 2: Charlotte
```typescript
voiceId: "XB0fDUnXU5powFXDhCwa"
```
- More neutral accent
- Clear pronunciation
- Professional yet warm

### Option 3: Freya
```typescript
voiceId: "jsCqWAovK2LkecY7zXl4"
```
- Younger sound
- Less formal
- Very casual and friendly

### Option 4: Sarah
```typescript
voiceId: "EXAVITQu4vr4xnSDxMaL"
```
- Soft and gentle
- Caring tone
- Good emotional range

---

## For More Indian Accent

If you want a more distinctly Indian accent, consider:

### Option 1: Use Azure TTS with Indian Voice
```typescript
voice: {
  provider: "azure",
  voiceId: "en-IN-NeerjaNeural", // Indian English female
}
```

### Option 2: Use PlayHT with Indian Voice
```typescript
voice: {
  provider: "playht",
  voiceId: "s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json",
}
```

---

## How to Change Voice

### Step 1: Edit CallPage.tsx
Find line ~290 and change the voiceId:

```typescript
voice: {
  provider: "11labs",
  voiceId: "YOUR_CHOSEN_VOICE_ID", // Change this
  stability: 0.6,
  similarityBoost: 0.8,
  style: 0.5,
  useSpeakerBoost: true,
}
```

### Step 2: Adjust Voice Settings

**For more expressiveness:**
```typescript
stability: 0.4,        // Lower = more emotional
similarityBoost: 0.7,  // Lower = more variation
```

**For more consistency:**
```typescript
stability: 0.8,        // Higher = more consistent
similarityBoost: 0.9,  // Higher = closer to original
```

**For Indian accent feel:**
```typescript
stability: 0.5,        // Medium expressiveness
similarityBoost: 0.75, // Medium variation
style: 0.6,            // Slightly more styled
```

### Step 3: Update System Prompt

Added instructions in system prompt:
- "Speak with a neutral Indian-English accent (NOT British)"
- "Sound like a young Indian woman speaking casually"
- "Use a slightly slower pace for clarity"

---

## Testing Different Voices

1. Change the `voiceId` in `CallPage.tsx`
2. Restart server: `npm run dev`
3. Make a voice call
4. Test the accent
5. Adjust settings if needed

---

## Recommended Settings for Indian Audience

```typescript
voice: {
  provider: "11labs",
  voiceId: "EXAVITQu4vr4xnSDxMaL", // Bella - warm, less British
  stability: 0.6,        // Natural and expressive
  similarityBoost: 0.8,  // Close to original
  style: 0.5,            // Balanced
  useSpeakerBoost: true, // Clear audio
}

transcriber: {
  provider: "deepgram",
  model: "nova-2",
  language: "en-IN",     // Indian English recognition
}
```

---

## Need Help?

**ElevenLabs Voice Library:**
https://elevenlabs.io/voice-library

**Browse hundreds of voices and find the perfect one!**

**Copy the Voice ID and paste it in the configuration.**

---

## Current Setup ✅

The voice has been updated to sound:
- ✅ Less British
- ✅ More natural and warm
- ✅ Better for Indian audience
- ✅ More expressive
- ✅ Clearer pronunciation

**Test it now and let me know if you want to try a different voice!**
