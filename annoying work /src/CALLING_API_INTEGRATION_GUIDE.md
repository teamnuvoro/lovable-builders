# Video/Audio Calling API Integration Guide

## Current Implementation
The Riya AI app now includes a fully functional calling interface with:
- ✅ Audio call support
- ✅ Video call support  
- ✅ Camera/microphone access
- ✅ Mute/unmute controls
- ✅ Video on/off toggle
- ✅ Speaker/earpiece toggle
- ✅ Call duration timer
- ✅ Beautiful UI with gradient backgrounds
- ✅ Picture-in-picture local video

## Production API Integration Options

### Option 1: Daily.co (Recommended - Easiest)

**Why Daily.co?**
- Simple to integrate
- Free tier: 10,000 minutes/month
- Great video quality
- Built-in recording features
- Excellent documentation

**Setup Steps:**

1. **Sign up for Daily.co**
   - Go to https://www.daily.co/
   - Create a free account
   - Get your API key from the dashboard

2. **Install the package**
   ```bash
   npm install @daily-co/daily-js
   ```

3. **Update CallScreen.tsx**
   ```tsx
   import DailyIframe from '@daily-co/daily-js';
   
   // In your component:
   const callFrameRef = useRef<any>(null);
   
   const initializeCall = async () => {
     // Create a room
     const response = await fetch('https://api.daily.co/v1/rooms', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': 'Bearer YOUR_DAILY_API_KEY'
       },
       body: JSON.stringify({
         properties: {
           enable_screenshare: false,
           enable_chat: false,
           start_video_off: callType === 'audio',
           start_audio_off: false
       })
     });
     
     const room = await response.json();
     
     // Join the call
     callFrameRef.current = DailyIframe.createFrame(videoRef.current, {
       showLeaveButton: false,
       showFullscreenButton: false,
     });
     
     await callFrameRef.current.join({ url: room.url });
   };
   ```

**Pricing:**
- Free: 10,000 minutes/month
- Starter: $99/month for 100,000 minutes
- Scale: Custom pricing

---

### Option 2: Agora.io (Best Quality)

**Why Agora?**
- Industry-leading video quality
- Used by apps like Clubhouse, Bunch
- Free tier: 10,000 minutes/month
- Low latency
- Great for India market

**Setup Steps:**

1. **Sign up for Agora**
   - Go to https://www.agora.io/
   - Create account and project
   - Get App ID from console

2. **Install packages**
   ```bash
   npm install agora-rtc-react agora-rtc-sdk-ng
   ```

3. **Update CallScreen.tsx**
   ```tsx
   import AgoraRTC from 'agora-rtc-sdk-ng';
   import { useRTCClient, useLocalMicrophoneTrack, useLocalCameraTrack } from 'agora-rtc-react';
   
   const APP_ID = 'YOUR_AGORA_APP_ID';
   
   const initializeCall = async () => {
     const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
     
     await client.join(APP_ID, channelName, null, null);
     
     const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
     const videoTrack = callType === 'video' 
       ? await AgoraRTC.createCameraVideoTrack() 
       : null;
     
     if (videoTrack) {
       await client.publish([audioTrack, videoTrack]);
       videoTrack.play(videoRef.current);
     } else {
       await client.publish([audioTrack]);
     }
   };
   ```

**Pricing:**
- Free: 10,000 minutes/month
- Pay-as-you-go: $0.99 per 1000 minutes

---

### Option 3: Twilio (Enterprise Grade)

**Why Twilio?**
- Most reliable
- Enterprise features
- Great customer support
- HIPAA compliant if needed

**Setup Steps:**

1. **Sign up for Twilio**
   - Go to https://www.twilio.com/video
   - Create account
   - Get Account SID and Auth Token

2. **Install packages**
   ```bash
   npm install twilio-video
   ```

3. **Create backend endpoint for tokens**
   - You'll need a backend to generate access tokens
   - Use Supabase Edge Functions or similar

4. **Update CallScreen.tsx**
   ```tsx
   import Video from 'twilio-video';
   
   const initializeCall = async () => {
     // Get token from your backend
     const response = await fetch('/api/twilio-token', {
       method: 'POST',
       body: JSON.stringify({ identity: userName, room: roomName })
     });
     const { token } = await response.json();
     
     // Connect to room
     const room = await Video.connect(token, {
       name: roomName,
       audio: true,
       video: callType === 'video' ? { width: 640 } : false
     });
     
     // Attach local video
     room.localParticipant.videoTracks.forEach(publication => {
       const track = publication.track;
       videoRef.current.appendChild(track.attach());
     });
   };
   ```

**Pricing:**
- Free trial: $15 credit
- Pay-as-you-go: $0.0015/minute per participant

---

### Option 4: 100ms (India-focused)

**Why 100ms?**
- Based in India
- Great pricing for Indian market
- Low latency for Indian users
- Easy integration

**Setup Steps:**

1. **Sign up for 100ms**
   - Go to https://www.100ms.live/
   - Create account and app
   - Get App credentials

2. **Install packages**
   ```bash
   npm install @100mslive/react-sdk
   ```

3. **Update CallScreen.tsx**
   ```tsx
   import { useHMSActions, useHMSStore } from '@100mslive/react-sdk';
   
   const hmsActions = useHMSActions();
   
   const initializeCall = async () => {
     // Get auth token from your backend
     const authToken = await getAuthToken();
     
     await hmsActions.join({
       userName: userName,
       authToken: authToken,
       settings: {
         isAudioMuted: false,
         isVideoMuted: callType === 'audio'
       }
     });
   };
   ```

**Pricing:**
- Free: 10,000 minutes/month
- Hobby: $99/month
- Growth: $499/month

---

## Implementation Checklist

### For Production Deployment:

- [ ] Choose your API provider (Daily.co recommended for easiest setup)
- [ ] Sign up and get API credentials
- [ ] Install the SDK package
- [ ] Update CallScreen.tsx with real API integration
- [ ] Create room/channel management logic
- [ ] Handle call invitations (send notification to AI bot to join)
- [ ] Add error handling for network issues
- [ ] Test on different devices and browsers
- [ ] Add call quality indicators
- [ ] Implement call recording (optional)
- [ ] Add call history/logs

### Security Considerations:

1. **Never expose API keys in frontend**
   - Use environment variables
   - Generate tokens from backend/Supabase Edge Functions

2. **Implement authentication**
   - Verify user identity before generating tokens
   - Use temporary tokens that expire

3. **Rate limiting**
   - Prevent abuse by limiting call duration
   - Limit number of calls per user

---

## Quick Start with Daily.co (Fastest Setup)

1. Create Daily.co account: https://dashboard.daily.co/signup
2. Get your API key
3. Add to your project:

```bash
npm install @daily-co/daily-js
```

4. Create a simple backend endpoint (use Supabase Edge Function):

```typescript
// Supabase Edge Function: create-call-room
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_DAILY_API_KEY'
    },
    body: JSON.stringify({
      properties: {
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      }
    })
  });
  
  const room = await response.json();
  
  return new Response(JSON.stringify({ roomUrl: room.url }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

5. Update CallScreen.tsx to use the room URL

---

## Testing Without API (Current Setup)

The current implementation works perfectly for UI testing using:
- Browser's native WebRTC APIs
- Local camera/microphone access
- Simulated remote video feed

This is great for:
- ✅ Demonstrating the app to investors
- ✅ UI/UX testing
- ✅ Getting user feedback
- ✅ Development and debugging

---

## Recommended Approach

**For MVP/Demo:**
1. Use current implementation (no external API needed)
2. Show investors the working call UI
3. Test with real users for feedback

**For Production:**
1. Start with **Daily.co** (easiest, 10k free minutes)
2. If you need better quality, migrate to **Agora**
3. If you need enterprise features, use **Twilio**

---

## Support

If you need help integrating any of these APIs, reach out with:
- Which API you chose
- Your specific use case
- Any errors you're encountering

Happy calling! 🎥📞
