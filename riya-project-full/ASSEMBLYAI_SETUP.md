# AssemblyAI Speech-to-Text Integration

## Overview
This app now supports speech-to-text transcription using AssemblyAI. Users can click the microphone button in the chat input to record their voice, which will be automatically transcribed to text.

## Features
- 🎤 **Voice Recording**: Click the microphone button to start/stop recording
- 🔄 **Real-time Transcription**: Audio is sent to AssemblyAI for transcription
- 🌏 **Hinglish Support**: Supports Hindi + English mixed language
- ✨ **Auto-fill**: Transcribed text automatically fills the chat input
- 🎨 **Visual Feedback**: Recording indicator with pulsing red animation

## Setup

### 1. Add API Key to Environment
Add the following to your `.env` file:

```bash
ASSEMBLYAI_API_KEY=e9edcc72a41e445585379ad3188b9928
```

### 2. Create Uploads Directory
The server needs a directory to temporarily store audio files:

```bash
mkdir -p uploads
```

### 3. Restart Server
After adding the API key, restart your development server:

```bash
npm run dev
```

## How It Works

### Frontend Flow
1. User clicks microphone button
2. Browser requests microphone permission
3. Audio is recorded using MediaRecorder API
4. When user clicks stop, audio is sent to backend
5. Transcribed text appears in the chat input

### Backend Flow
1. Receives audio file via `/api/transcribe` endpoint
2. Uploads audio to AssemblyAI
3. AssemblyAI processes and returns transcript
4. Transcript is sent back to frontend
5. Temporary audio file is deleted

## API Endpoint

### POST `/api/transcribe`
Transcribes audio to text using AssemblyAI.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `audio` file (webm format)

**Response:**
```json
{
  "text": "transcribed text here",
  "confidence": 0.95,
  "words": [...]
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error info"
}
```

## Language Support
The integration is configured for Hindi language code (`hi`), which supports:
- Pure Hindi
- Pure English
- Hinglish (mixed Hindi-English)

## File Structure

```
client/src/
├── hooks/
│   └── useSpeechToText.ts          # React hook for recording & transcription
├── components/
│   └── chat/
│       └── ChatInput.tsx            # Updated with mic button functionality

server/
├── routes/
│   └── transcribe.ts                # AssemblyAI transcription endpoint
└── index.ts                         # Registered transcribe routes

uploads/                             # Temporary audio file storage (auto-created)
```

## Troubleshooting

### Microphone Permission Denied
- Check browser permissions
- Ensure HTTPS is enabled (required for microphone access)
- Try a different browser

### Transcription Fails
- Verify API key is correct in `.env`
- Check server logs for errors
- Ensure `uploads/` directory exists and is writable

### No Audio Recorded
- Check microphone is connected and working
- Verify browser supports MediaRecorder API
- Check console for errors

## Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 14.3+)
- Opera: ✅ Full support

## Security Notes
- Audio files are temporarily stored and immediately deleted after transcription
- API key should be kept secret (server-side only)
- Microphone permission is requested only when user clicks the button

## Cost Considerations
AssemblyAI pricing:
- Free tier: 5 hours of audio per month
- Pay-as-you-go: $0.00025 per second (~$0.015 per minute)

Monitor usage at: https://www.assemblyai.com/dashboard

## Future Enhancements
- [ ] Real-time streaming transcription
- [ ] Speaker diarization (multiple speakers)
- [ ] Sentiment analysis
- [ ] Auto-punctuation
- [ ] Custom vocabulary for better accuracy

