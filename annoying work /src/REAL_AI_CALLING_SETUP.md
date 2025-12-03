# 🎯 Real AI Voice/Video Calling Setup Guide

## What You Need for REAL AI Calling

To have actual conversations with the AI bot (like talking to ChatGPT voice mode), you need **3 components**:

### 1. 📞 Video/Audio Infrastructure
**Purpose:** Handle the actual call connection between user and AI

**Best Options:**
- **Daily.co** (Easiest) - Recommended for you
- **Agora.io** (Best quality)
- **Twilio** (Enterprise-grade)

### 2. 🤖 AI Voice Service
**Purpose:** The AI brain that listens and talks back

**Best Options:**
- **OpenAI Realtime API** (Recommended - Like ChatGPT Voice)
- **ElevenLabs + OpenAI** (Best voice quality)
- **Google Cloud Speech + Dialogflow**
- **Assembly AI + GPT-4**

### 3. 🔗 Backend Service
**Purpose:** Connect everything together securely

**Best Options:**
- **Supabase Edge Functions** (Recommended for you)
- **Vercel Serverless Functions**
- **AWS Lambda**

---

## 🚀 Quickest Setup: Daily.co + OpenAI Realtime API

This is the **fastest way** to get real AI calling working (30-60 minutes setup).

### Step 1: Sign Up for Services

#### A. Daily.co Account
1. Go to https://daily.co/signup
2. Sign up (it's free)
3. Go to Dashboard → Developers → API Keys
4. Copy your API key
5. **Free tier: 10,000 minutes/month**

#### B. OpenAI Account
1. Go to https://platform.openai.com/signup
2. Sign up and add payment method
3. Go to API Keys section
4. Create new API key
5. Copy the key
6. **Cost: ~$0.06 per minute of conversation**

### Step 2: Set Up Backend (Supabase Edge Function)

You need a backend to:
- Create Daily.co rooms securely
- Handle OpenAI API calls
- Manage the AI conversation

**Create this Supabase Edge Function:**

```typescript
// supabase/functions/create-ai-call/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  try {
    const { aiName } = await req.json()

    // 1. Create Daily.co room
    const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
          enable_screenshare: false,
          enable_chat: false,
          max_participants: 2
        }
      })
    })

    const room = await roomResponse.json()

    // 2. Start AI bot in the room
    // This triggers your AI service to join
    await fetch('https://api.daily.co/v1/bots/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        bot_profile: 'voice_assistant',
        room_url: room.url,
        config: {
          openai_api_key: OPENAI_API_KEY,
          assistant_name: aiName,
          voice: 'alloy', // OpenAI voice
          instructions: `You are ${aiName}, a caring AI relationship advisor. 
                         Speak naturally and empathetically. 
                         Help users understand their relationship patterns.`
        }
      })
    })

    return new Response(JSON.stringify({ 
      roomUrl: room.url,
      roomName: room.name
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})
```

### Step 3: Update CallScreen to Use Real Calling

Install Daily.co package:
```bash
npm install @daily-co/daily-js
```

Update your CallScreen component:

```typescript
import DailyIframe from '@daily-co/daily-js';

// Add this to your CallScreen component:
const [dailyCall, setDailyCall] = useState<any>(null);

const initializeRealCall = async () => {
  try {
    // 1. Create AI call room via your backend
    const response = await fetch('YOUR_SUPABASE_URL/functions/v1/create-ai-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
      },
      body: JSON.stringify({
        aiName: aiName
      })
    });

    const { roomUrl } = await response.json();

    // 2. Join the call room
    const callFrame = DailyIframe.createCallObject({
      audioSource: true,
      videoSource: callType === 'video'
    });

    await callFrame.join({ url: roomUrl });

    // 3. Set up event listeners
    callFrame.on('participant-joined', (event) => {
      console.log('AI joined the call:', event.participant);
    });

    callFrame.on('track-started', (event) => {
      if (event.participant.local) {
        // Your video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = new MediaStream([event.track]);
        }
      } else {
        // AI video (if video call)
        if (videoRef.current) {
          videoRef.current.srcObject = new MediaStream([event.track]);
        }
      }
    });

    setDailyCall(callFrame);

  } catch (error) {
    console.error('Failed to start AI call:', error);
  }
};

// Call this instead of initializeMedia():
useEffect(() => {
  if (callState === 'connected') {
    initializeRealCall();
  }
}, [callState]);
```

---

## 💰 Cost Breakdown

### Option 1: Daily.co + OpenAI Realtime API (Recommended)

**Monthly Costs:**
- **Daily.co:** FREE (up to 10,000 minutes)
- **OpenAI Realtime API:** $0.06 per minute
- **Example:** 100 users × 10 min/month = 1,000 minutes = **$60/month**

### Option 2: Agora + ElevenLabs + GPT-4

**Monthly Costs:**
- **Agora:** FREE (up to 10,000 minutes)
- **ElevenLabs:** $99/month (100k characters)
- **GPT-4 API:** $0.03 per 1k tokens
- **Example:** ~**$150/month** for 100 active users

### Option 3: Custom Solution (Most Control)

**Monthly Costs:**
- **Twilio Voice:** $0.013/minute
- **Deepgram (Speech-to-Text):** $0.0043/minute
- **OpenAI GPT-4:** $0.03 per 1k tokens
- **ElevenLabs (Text-to-Speech):** $99/month
- **Example:** ~**$100-200/month** for 100 active users

---

## 🎤 Alternative: Simpler Voice-Only Setup

If you don't need video, here's a **much simpler** approach:

### Use OpenAI Realtime API Directly

```typescript
// Simple voice conversation without video calling infrastructure

const startVoiceConversation = async () => {
  const websocket = new WebSocket(
    'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    }
  );

  // Get user's microphone
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // Set up audio processing
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);

  processor.onaudioprocess = (e) => {
    // Send audio to OpenAI
    const audioData = e.inputBuffer.getChannelData(0);
    websocket.send(JSON.stringify({
      type: 'input_audio_buffer.append',
      audio: arrayBufferToBase64(audioData)
    }));
  };

  source.connect(processor);
  processor.connect(audioContext.destination);

  // Receive AI voice response
  websocket.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'response.audio.delta') {
      // Play AI's voice response
      const audioBuffer = base64ToArrayBuffer(data.delta);
      playAudio(audioBuffer);
    }
  };
};
```

**Cost:** $0.06/minute
**Setup Time:** 1-2 hours
**Complexity:** Medium

---

## 📋 Setup Checklist

### For Real AI Calling:

- [ ] Sign up for Daily.co (or Agora/Twilio)
- [ ] Get API key
- [ ] Sign up for OpenAI
- [ ] Get API key (enable Realtime API)
- [ ] Set up Supabase project
- [ ] Create Edge Function for room creation
- [ ] Add environment variables
- [ ] Install @daily-co/daily-js
- [ ] Update CallScreen component
- [ ] Test with real microphone
- [ ] Test AI responses
- [ ] Deploy to production

### Estimated Total Setup Time:
- **Basic (voice only):** 1-2 hours
- **Full (video + voice):** 3-4 hours
- **Production-ready:** 1-2 days

---

## 🎯 Recommended Approach for You

Given your app "Riya AI", here's what I recommend:

### Phase 1: MVP (This Week)
1. **Use OpenAI Realtime API** for voice
2. **Skip video for now** (simpler)
3. **Use WebSocket direct connection** (no Daily.co needed)
4. **Cost:** ~$0.06/minute

**Pros:**
- ✅ Fastest to implement
- ✅ Lowest cost
- ✅ Works immediately
- ✅ Great voice quality

**Cons:**
- ❌ No video
- ❌ Need to handle audio encoding
- ❌ More complex frontend code

### Phase 2: Upgrade (Next Month)
1. **Add Daily.co** for video calling
2. **Keep OpenAI Realtime API** for voice
3. **Use Daily.co bots** to connect AI

**Pros:**
- ✅ Full video + voice
- ✅ Professional quality
- ✅ Scalable

---

## 🆘 Need Help?

### Option 1: I Can Help You Implement
Tell me which approach you want, and I'll:
1. Create all the code
2. Set up the backend functions
3. Update your CallScreen component
4. Provide testing instructions

### Option 2: Hire a Developer
If you want someone to do it all:
- **Freelancer:** $500-1,000 (1-2 weeks)
- **Agency:** $2,000-5,000 (2-4 weeks)

### Option 3: Use Pre-Built Services

**Vapi.ai** - Voice AI calling platform:
- No coding needed
- Just integrate their widget
- $0.05/minute
- https://vapi.ai

**Retell AI** - Similar service:
- Voice AI conversations
- Easy integration
- $0.06/minute
- https://retellai.com

---

## 🔥 Quick Start: Vapi.ai (Easiest!)

If you want it working **TODAY** without complex setup:

```bash
npm install @vapi-ai/web
```

```typescript
import { useVapi } from '@vapi-ai/web';

export function CallScreen({ aiName, onEndCall }: CallScreenProps) {
  const { start, stop, isCallActive } = useVapi();

  const handleStartCall = () => {
    start({
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2'
      },
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: `You are ${aiName}, a caring AI relationship advisor...`
        }]
      },
      voice: {
        provider: 'eleven-labs',
        voiceId: 'pNInz6obpgDQGcFmaJgB' // Female voice
      }
    });
  };

  return (
    // Your existing UI
    <button onClick={handleStartCall}>
      Start Real AI Call
    </button>
  );
}
```

**Setup Time:** 30 minutes
**Cost:** $0.05/minute
**Complexity:** Very Low ⭐

---

## Which Option Should You Choose?

| Feature | OpenAI Realtime | Daily.co + OpenAI | Vapi.ai |
|---------|----------------|-------------------|---------|
| Setup Time | 2 hours | 4 hours | 30 minutes |
| Cost/minute | $0.06 | $0.06 | $0.05 |
| Video Support | ❌ | ✅ | ❌ |
| Voice Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Complexity | Medium | High | Very Low |
| **Recommended For** | MVP | Final Product | Quick Launch |

---

## 🎯 My Recommendation for You

**Start with Vapi.ai** for these reasons:

1. ✅ Working in 30 minutes
2. ✅ No backend needed
3. ✅ Great voice quality
4. ✅ Easy to implement
5. ✅ Affordable pricing
6. ✅ You can switch later if needed

**Then upgrade to Daily.co + OpenAI** when:
- You need video calling
- You have >1,000 users
- You want more control
- You have development resources

---

Would you like me to:
1. **Implement Vapi.ai integration** (30 mins, easiest)
2. **Set up OpenAI Realtime API** (2 hours, more control)
3. **Build full Daily.co + OpenAI system** (4 hours, complete solution)

Let me know which path you prefer! 🚀
