# 🚀 Quick Start - Real AI Voice Calling (5 Steps)

## Get Vapi API Key & Start Talking to AI in 15 Minutes!

---

### Step 1: Get API Key (5 min)

1. Go to: **https://vapi.ai/signup**
2. Create account (email + password)
3. Click **"API Keys"** → **"Create New Key"**
4. Copy the key (starts with `vapi_pk_...`)

---

### Step 2: Add Key to App (1 min)

1. Open `/config/vapi-config.ts`
2. Replace this:
   ```typescript
   publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE"
   ```
3. With your key:
   ```typescript
   publicKey: "vapi_pk_your_actual_key_here"
   ```
4. Save file

---

### Step 3: Install Package (3 min)

Run in terminal:
```bash
npm install @vapi-ai/web
```

---

### Step 4: Start App (1 min)

```bash
npm run dev
```

---

### Step 5: Test! (2 min)

1. Open app in browser
2. Select any AI (Riya, Priya, Ananya, Maya)
3. Click **phone icon** (audio call)
4. **Allow microphone** when asked
5. Wait 3 seconds - AI will say "Namaste!"
6. **Start talking!**

---

## ✅ It's Working If You See:

- ✅ Green badge: "Live AI Conversation"
- ✅ Status: "🎤 AI is speaking..." when AI talks
- ✅ Status: "You are speaking..." when you talk
- ✅ You hear AI's voice responding

---

## 💰 Cost

- **First 10 minutes:** FREE
- **After that:** $0.05 per minute
- **No monthly fees**

**Example:** 100 users × 5 min = $25/month

---

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| "Failed to start AI call" | Check API key is correct |
| No microphone access | Allow permissions in browser |
| Can't hear AI | Check volume, enable speaker |
| AI doesn't respond | Check internet, speak clearly |

---

## 🎯 What to Say to AI

Try these:
- "Hi Riya, I need relationship advice"
- "I'm confused about my feelings"
- "How do I know if she likes me?"
- "Tell me about yourself"

---

## 📚 Full Guides

- **Detailed Setup:** See `/VAPI_SETUP_GUIDE.md`
- **All Options:** See `/REAL_AI_CALLING_SETUP.md`

---

## 🆘 Support

- Vapi Docs: https://docs.vapi.ai
- Vapi Support: support@vapi.ai
- Check console for errors: Press F12 → Console tab

---

**That's it! You now have REAL AI voice calling!** 🎉

Your users can actually talk to Riya, Priya, Ananya, and Maya and get AI-powered relationship advice through voice!
