# 🎤 Vapi.ai Setup Guide - Get Real AI Voice Calling in 15 Minutes!

## What is Vapi.ai?

Vapi.ai is a voice AI platform that lets you add **real AI voice conversations** to your app. Think of it like ChatGPT voice mode, but you can embed it in your own app!

## ✅ What You Get

After setup, your app will:
- ✅ Listen to your voice in real-time
- ✅ Understand what you're saying (even Hinglish!)
- ✅ AI responds with natural voice (sounds like a real person)
- ✅ Have actual conversations with Riya/Priya/Ananya/Maya
- ✅ See real-time indicators when AI is speaking
- ✅ Works on mobile and desktop

## 💰 Pricing

**Free Tier:**
- First 10 minutes FREE
- Perfect for testing

**Paid Plan:**
- $0.05 per minute
- No monthly fees
- Pay only for what you use

**Example Costs:**
- 100 users × 5 min/month = 500 minutes = **$25/month**
- 1,000 users × 3 min/month = 3,000 minutes = **$150/month**

---

## 📋 Step-by-Step Setup (15 Minutes)

### Step 1: Sign Up for Vapi.ai (3 minutes)

1. Go to: **https://vapi.ai**
2. Click "Get Started" or "Sign Up"
3. Create account with:
   - Email
   - Password
   - Or use Google/GitHub login
4. Verify your email

### Step 2: Get Your API Key (2 minutes)

1. After login, go to **Dashboard**
2. Click on **"API Keys"** in the left sidebar
3. Click **"Create New Key"**
4. Give it a name: "Riya AI Production"
5. **Copy the API key** - it looks like:
   ```
   vapi_pk_1234567890abcdef...
   ```
6. ⚠️ **IMPORTANT:** Save this key somewhere safe! You won't see it again.

### Step 3: Add API Key to Your App (2 minutes)

1. Open your project
2. Go to `/config/vapi-config.ts`
3. Find this line:
   ```typescript
   publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE",
   ```
4. Replace it with your actual key:
   ```typescript
   publicKey: "vapi_pk_1234567890abcdef...",
   ```
5. Save the file

### Step 4: Install Vapi Package (5 minutes)

Open your terminal and run:

```bash
npm install @vapi-ai/web
```

Wait for it to finish installing.

### Step 5: Test It! (3 minutes)

1. Start your app:
   ```bash
   npm run dev
   ```

2. Go to the app in your browser

3. Click on any AI assistant (Riya, Priya, etc.)

4. Click the **audio call button** (phone icon)

5. **Allow microphone access** when prompted

6. Wait 3 seconds - the AI will greet you first!

7. **Start talking!** Say something like:
   - "Hi Riya, how are you?"
   - "I need relationship advice"
   - "Tell me about yourself"

8. The AI will respond with voice! 🎉

---

## 🎯 What You'll See When It Works

### Before AI Speaks:
- Status: "👂 Listening to you..."
- You can start talking

### When AI is Speaking:
- Green glowing border around AI image
- Text: "🎤 AI is speaking..."
- Voice comes from your speakers

### When You're Speaking:
- Blue indicator: "You are speaking..."
- Your voice is being sent to AI

### Live Conversation Badge:
- Green badge at top: "Live AI Conversation"
- This means everything is working!

---

## 🐛 Troubleshooting

### Problem: "Failed to start AI call"

**Solution:**
1. Check if you added your API key correctly
2. Make sure it starts with `vapi_pk_`
3. No spaces before or after the key
4. Refresh the page and try again

### Problem: "Microphone access denied"

**Solution:**
1. Click the 🔒 lock icon in browser address bar
2. Allow microphone permissions
3. Refresh the page
4. Try calling again

### Problem: "AI doesn't respond"

**Solution:**
1. Check your internet connection
2. Make sure you have Vapi credits (check dashboard)
3. Try speaking louder or closer to mic
4. Check browser console for errors (F12 → Console)

### Problem: "No sound from AI"

**Solution:**
1. Check your device volume
2. Make sure speaker/earphones are connected
3. Click the speaker button in call (should be ON)
4. Try using earphones

### Problem: "AI takes long to respond"

**Solution:**
- This is normal for first message (5-10 seconds)
- Subsequent responses are faster (1-3 seconds)
- If it's always slow, check your internet speed

---

## 🎨 Customization Options

### Change AI Voice

In `/config/vapi-config.ts`, you can change the voice:

```typescript
voice: "pNInz6obpgDQGcFmaJgB", // Current voice
```

**Available ElevenLabs voices:**
- `pNInz6obpgDQGcFmaJgB` - Rachel (Female, warm)
- `EXAVITQu4vr4xnSDxMaL` - Bella (Female, soft)
- `ErXwobaYiN019PkySvjV` - Antoni (Male, calm)
- `MF3mGyEYCl7XYWbV9V6O` - Elli (Female, energetic)
- `pMsXgVXv3BLzUgSXRplE` - Domi (Female, confident)

### Change AI Personality

Edit the `systemPrompt` in `/config/vapi-config.ts`:

```typescript
systemPrompt: `You are Riya, a warm and caring AI...
Change this text to modify how the AI behaves!`
```

### Change First Message

In `/components/CallScreen.tsx`, find:

```typescript
firstMessage: `Namaste! Main ${assistantConfig.name} hoon...`
```

Change it to whatever you want the AI to say first!

---

## 📊 Monitoring Usage

### Check Your Usage

1. Go to **Vapi Dashboard**
2. Click **"Usage"** in sidebar
3. See:
   - Total minutes used
   - Cost this month
   - Call history
   - Transcripts of conversations

### Set Budget Alerts

1. Dashboard → **"Settings"**
2. **"Billing Alerts"**
3. Set maximum spending limit
4. Get email when you reach 80%

---

## 🚀 Advanced Features (Optional)

### Record Conversations

Add this to Vapi config:

```typescript
recordingEnabled: true,
```

You can download recordings from dashboard.

### Custom Wake Words

Make AI respond to specific words:

```typescript
endCallPhrases: ["goodbye", "bye", "end call", "tata"],
```

### Multi-language Support

Change language in config:

```typescript
language: "hi-IN", // Hindi
// or
language: "en-IN", // English (India)
```

---

## 💡 Tips for Best Results

### For Better Voice Recognition:

1. **Speak clearly** - Not too fast
2. **Reduce background noise** - Find quiet place
3. **Use good microphone** - Earphones with mic work great
4. **Stable internet** - At least 2 Mbps

### For Better AI Responses:

1. **Be specific** - "I'm having trust issues with my girlfriend" vs "I need help"
2. **Wait for AI to finish** - Don't interrupt
3. **Natural language** - Talk like you would to a friend
4. **Use Hinglish** - Mix Hindi and English naturally

### Cost Optimization:

1. **End calls when done** - Don't leave running
2. **Test with short calls** - 1-2 minutes
3. **Monitor usage** - Check dashboard weekly
4. **Set budget limits** - Prevent overspending

---

## 🎯 Next Steps

### After Testing:

1. ✅ Test all 4 AI assistants (Riya, Priya, Ananya, Maya)
2. ✅ Try different questions
3. ✅ Test on mobile device
4. ✅ Get feedback from friends
5. ✅ Monitor costs in dashboard

### Before Production:

1. 📝 Add more personality to AI prompts
2. 🎨 Customize voices for each assistant
3. 💳 Add payment method to Vapi
4. 📊 Set up analytics
5. 🚀 Deploy your app!

---

## 🆘 Need Help?

### Vapi Support:
- Email: support@vapi.ai
- Docs: https://docs.vapi.ai
- Discord: https://discord.gg/vapi

### Your App Issues:
- Check browser console (F12 → Console)
- Look for red error messages
- Copy error and Google it
- Or DM me the error!

---

## ✅ Quick Checklist

Before you test, make sure:

- [ ] Signed up for Vapi.ai
- [ ] Got API key from dashboard
- [ ] Added key to `/config/vapi-config.ts`
- [ ] Ran `npm install @vapi-ai/web`
- [ ] Started app with `npm run dev`
- [ ] Allowed microphone access
- [ ] Device volume is up
- [ ] Internet is working
- [ ] Clicked audio call button
- [ ] Waiting for AI to speak first

---

## 🎉 You're Ready!

Once you complete the setup, your users will be able to have **REAL voice conversations** with the AI assistants!

**No more demo UI - this is the real deal!** 🚀

The AI will:
- 🎤 Listen to what they say
- 🧠 Understand their problems
- 💬 Respond with helpful advice
- 🗣️ Sound like a real person
- ❤️ Provide emotional support

**Total setup time: 15 minutes**
**Cost to test: FREE (first 10 minutes)**

---

## 🔥 Pro Tip

Want to impress users? Update the system prompts to:
- Use more Hinglish phrases
- Reference Indian culture
- Understand relationship dynamics specific to India
- Use local examples and metaphors

The AI is super smart and will adapt to whatever personality you give it!

---

Ready to test? Let's go! 🚀
