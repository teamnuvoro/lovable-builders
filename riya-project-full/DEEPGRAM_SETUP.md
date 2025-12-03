# 🎤 Deepgram Speech-to-Text Integration

## Overview
Your app now uses **Deepgram** for high-quality speech-to-text transcription with excellent Hinglish (Hindi + English) support!

---

## 🔑 Your Credentials

**API Key:** `f24b35e08e5e52e6d65eb8b63b5be42c2c07e15c`

---

## ✅ What's Integrated

### Features:
- 🎤 **Nova-2 Model** - Deepgram's latest and most accurate model
- 🌏 **Hinglish Support** - Perfect for Hindi + English mixed speech
- ✨ **Smart Formatting** - Automatic punctuation and capitalization
- 🎯 **High Accuracy** - Industry-leading transcription quality
- ⚡ **Fast Processing** - Real-time capable

### How It Works:
1. User clicks microphone button in chat
2. Browser records audio using MediaRecorder API
3. Audio sent to `/api/transcribe` endpoint
4. Deepgram processes and returns transcript
5. Text automatically fills the chat input

---

## 📁 Files Created/Modified

### New Files:
- **`server/routes/deepgram-transcribe.ts`** - Deepgram transcription endpoint
- **`DEEPGRAM_SETUP.md`** - This documentation

### Modified Files:
- **`server/index.ts`** - Updated to use Deepgram route
- **`.env`** - Added DEEPGRAM_API_KEY

### Existing Files (Already Setup):
- **`client/src/hooks/useSpeechToText.ts`** - Frontend recording hook
- **`client/src/components/chat/ChatInput.tsx`** - Microphone button

---

## 🚀 Setup Complete!

The Deepgram API key is already configured in your `.env` file:
```bash
DEEPGRAM_API_KEY=f24b35e08e5e52e6d65eb8b63b5be42c2c07e15c
```

---

## 🧪 How to Test

### Step 1: Restart Server
```bash
npm run dev
```

### Step 2: Test in Browser
1. Go to chat page
2. Click the microphone button (turns red & pulses)
3. Speak in Hindi, English, or Hinglish
4. Click mic again to stop
5. Wait 2-3 seconds
6. See transcribed text in input box!

---

## 🎯 Deepgram Features Used

### Model: Nova-2
- Latest and most accurate Deepgram model
- Excellent for conversational AI
- Best-in-class accuracy

### Language: Hindi (hi)
- Supports pure Hindi
- Supports pure English
- Supports Hinglish (mixed)

### Settings:
- **smart_format: true** - Automatic formatting
- **punctuate: true** - Adds punctuation
- **diarize: false** - Single speaker mode

---

## 📊 API Response Format

```json
{
  "text": "transcribed text here",
  "confidence": 0.95,
  "words": [
    {
      "word": "hello",
      "start": 0.5,
      "end": 0.8,
      "confidence": 0.98
    }
  ]
}
```

---

## 🔍 Debugging

### Check if Deepgram is working:
```bash
# Check server logs for:
[Deepgram] Processing audio file: uploads/xyz.webm
[Deepgram] Success: [transcribed text]
```

### Common Issues:

**503 Service Unavailable**
- API key not in `.env`
- Restart server after adding key

**No transcription**
- Check microphone permissions
- Ensure audio is being recorded
- Check server logs for errors

**Poor accuracy**
- Speak clearly
- Reduce background noise
- Ensure good microphone quality

---

## 💰 Deepgram Pricing

**Pay-as-you-go:**
- Nova-2: $0.0043/minute
- Very affordable for production use

**Free Credits:**
- $200 free credit on signup
- ~46,000 minutes of transcription

**Monitor usage at:**
https://console.deepgram.com/

---

## 🆚 Why Deepgram vs AssemblyAI?

**Deepgram Advantages:**
- ✅ Better Hinglish support
- ✅ Faster processing
- ✅ Lower latency
- ✅ Nova-2 model (latest)
- ✅ Better accuracy
- ✅ More affordable

---

## 📚 Documentation

**Deepgram Docs:**
- https://developers.deepgram.com/docs
- https://developers.deepgram.com/docs/node-sdk

**API Reference:**
- https://developers.deepgram.com/reference/listen-file

---

## ✨ Advanced Features (Optional)

You can enhance the integration with:

### Real-time Streaming:
```typescript
// Use Deepgram's live transcription
deepgram.listen.live({
  model: 'nova-2',
  language: 'hi',
  smart_format: true,
})
```

### Multi-language:
```typescript
// Detect language automatically
language: 'multi'
```

### Speaker Diarization:
```typescript
// Identify different speakers
diarize: true
```

### Custom Vocabulary:
```typescript
// Add custom words
keywords: ['Riya', 'chatbot']
```

---

## 🎉 You're All Set!

Your app now has **Deepgram-powered speech-to-text**!

**Features:**
- ✅ Microphone button in chat
- ✅ Hinglish support
- ✅ High accuracy transcription
- ✅ Automatic text insertion

**Test it now:**
1. Click microphone in chat
2. Speak your message
3. See it transcribed!

---

**Happy transcribing with Deepgram!** 🎤✨

