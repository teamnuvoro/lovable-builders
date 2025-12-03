# 🎤 Complete Vapi API Integration Guide

## Get Your Riya AI Voice Calling Working in 5 Minutes!

---

## Step 1: Sign Up for Vapi.ai (FREE)

### 1.1 Create Your Account

1. **Go to Vapi.ai:**
   - Visit: **https://vapi.ai/signup**
   
2. **Sign up options:**
   - Sign up with Google (easiest)
   - Or use email + password

3. **Verify your email** if you used email signup

✅ **What you get for FREE:**
- $10 in free credits (≈ 10 minutes of AI calling)
- No credit card required initially
- Full access to all features

---

## Step 2: Get Your API Key

### 2.1 Navigate to Dashboard

1. After signing up, you'll be on the **Vapi Dashboard**
2. Look for the sidebar menu on the left

### 2.2 Find API Keys

1. In the sidebar, click on **"API Keys"** or **"Settings"**
2. You'll see a section called **"Public Key"** or **"API Keys"**

### 2.3 Copy Your Public Key

1. Look for a key that starts with something like `pk_...` or similar
2. This is your **Public Key** (NOT the Private Key!)
3. Click the **Copy** button or manually select and copy it

**Example of what it looks like:**
```
pk_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

⚠️ **Important:** Use the **PUBLIC** key, not the private/secret key!

---

## Step 3: Add API Key to Your App

### 3.1 Open the Config File

In your project, navigate to:
```
/config/vapi-config.ts
```

### 3.2 Replace the Placeholder

You'll see this code:

```typescript
export const VAPI_CONFIG = {
  publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE", // Replace with your actual key
};
```

**Replace it with your actual key:**

```typescript
export const VAPI_CONFIG = {
  publicKey: "pk_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz", // Your real key
};
```

### 3.3 Save the File

- Save the file (Ctrl+S / Cmd+S)
- The app will automatically reload

---

## Step 4: Test Voice Calling

### 4.1 Start the App

1. Refresh your browser if it didn't auto-reload
2. You should see a **green checkmark** in the console saying:
   ```
   ✅ REAL AI VOICE CALLING ENABLED!
   ```

### 4.2 Make Your First Call

1. Click through the app: Welcome → Form → Select AI
2. Choose any AI assistant (Riya, Priya, Ananya, or Maya)
3. Click the **Phone icon** (Audio Call) button
4. **Grant microphone permission** when prompted

### 4.3 What Should Happen

1. **Connecting screen** shows (1-2 seconds)
2. **Ringing animation** appears (2-3 seconds)
3. **Call connects** - you'll see:
   - ✅ Green "Live AI Conversation" badge
   - 🎤 AI greets you in Hinglish within 5 seconds
   - 💬 You can start talking!

**Example AI greeting:**
> "Namaste! Main Riya hoon. Kaise ho aap? Aaj kya baat karni hai?"

---

## Step 5: Verify It's Working

### ✅ Signs It's Working Correctly:

| Indicator | What to Look For |
|-----------|-----------------|
| **Green Badge** | "Live AI Conversation" appears at top |
| **AI Speaking** | Avatar border glows green, "AI is speaking..." text |
| **You Speaking** | Blue indicator shows "You are speaking..." |
| **Audio** | You can HEAR the AI's voice through speakers |
| **Conversation** | AI responds to what you say |

### ❌ Signs It's NOT Working:

| Problem | What's Wrong |
|---------|--------------|
| Yellow banner | Still in demo mode - API key not added correctly |
| No audio | Check microphone permissions & volume |
| Stays on "Connecting" | API key is invalid |
| Immediate disconnect | Check API key, might be private key instead of public |

---

## Common Integration Issues & Fixes

### Issue 1: "Still showing demo mode banner"

**Problem:** API key not saved correctly

**Solutions:**
1. Make sure you saved `/config/vapi-config.ts`
2. Refresh the browser (Ctrl+R / Cmd+R)
3. Check for typos in the API key
4. Make sure no extra spaces before/after the key
5. Make sure you replaced the entire placeholder string

---

### Issue 2: "Call connects but no audio"

**Problem:** Browser permissions or settings

**Solutions:**
1. **Check microphone permission:**
   - Look for microphone icon in browser address bar
   - Click it and select "Allow"

2. **Check volume:**
   - Turn up your device volume
   - Unmute if muted

3. **Try different browser:**
   - Chrome/Edge work best
   - Safari might have issues

---

### Issue 3: "Invalid API key error"

**Problem:** Wrong type of key

**Solutions:**
1. Make sure you copied the **PUBLIC** key (starts with `pk_`)
2. NOT the private/secret key (starts with `sk_`)
3. Go back to Vapi dashboard and double-check

---

### Issue 4: "Call drops after a few seconds"

**Problem:** Ran out of credits or bad connection

**Solutions:**
1. Check your Vapi dashboard for remaining credits
2. Check your internet connection
3. Try again - first call sometimes has issues

---

## Understanding Your Vapi Dashboard

### What You'll See:

1. **Credits/Balance:**
   - Shows how much calling time you have left
   - $10 free ≈ 10 minutes

2. **Call Logs:**
   - See all your test calls
   - Check duration and costs

3. **Usage Statistics:**
   - Minutes used
   - Total calls made

### Pricing After Free Credits:

- **Pay as you go:** ~$0.10-0.15 per minute
- **No monthly fees**
- Only pay for what you use

---

## Advanced Configuration (Optional)

### Customize AI Voice & Behavior

The AI personalities are already configured in `/config/vapi-config.ts`:

```typescript
export const AI_ASSISTANTS = {
  Riya: {
    name: "Riya",
    voice: "pNInz6obpgDQGcFmaJgB", // ElevenLabs voice ID
    systemPrompt: `You are Riya, a warm and caring AI...`,
  },
  // ... other assistants
};
```

**You can customize:**
- `voice`: Change to different ElevenLabs voice IDs
- `systemPrompt`: Modify AI personality and behavior
- Add more AI assistants

### Available Voice Providers:

Vapi supports:
- **ElevenLabs** (currently used - highest quality)
- **PlayHT**
- **Deepgram**
- **Azure**

---

## Testing Checklist

Before launching your app, test these:

- [ ] API key added to `/config/vapi-config.ts`
- [ ] File saved and app refreshed
- [ ] Console shows "✅ REAL AI VOICE CALLING ENABLED!"
- [ ] Can make audio call with each AI assistant
- [ ] AI greets you within 5 seconds
- [ ] You can hear AI's voice clearly
- [ ] AI responds to your questions
- [ ] Can mute/unmute microphone
- [ ] Can end call properly
- [ ] Video call works (if testing that)

---

## Quick Reference

### Your Integration Checklist:

```
1. ✅ Sign up at https://vapi.ai/signup
2. ✅ Get Public Key from Dashboard → API Keys
3. ✅ Add to /config/vapi-config.ts
4. ✅ Save file and refresh browser
5. ✅ Grant microphone permission
6. ✅ Test call with AI assistant
```

---

## Need Help?

### Resources:
- 📚 **Vapi Documentation:** https://docs.vapi.ai
- 💬 **Vapi Discord:** Join for support
- 🎥 **Video Tutorials:** Check Vapi YouTube channel

### Check These Files:
- `/START_HERE.md` - Quick start guide
- `/AUDIO_TROUBLESHOOTING.md` - Fix audio issues
- `/WHAT_TO_EXPECT.md` - Feature details

---

## What Happens Next?

Once integrated, your users can:

1. **Talk to AI girlfriends** in real-time
2. **Get relationship advice** through voice
3. **Have natural Hinglish conversations**
4. **Get instant emotional support**

The AI will:
- Understand both Hindi and English (Hinglish)
- Respond naturally like a caring companion
- Remember conversation context
- Provide relationship insights

---

## 🎉 You're All Set!

Your Riya AI app now has **REAL voice calling** powered by Vapi.ai!

Enjoy testing and building your AI girlfriend companion app! 💜
