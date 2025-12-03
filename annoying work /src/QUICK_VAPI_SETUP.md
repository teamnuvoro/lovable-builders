# ⚡ Quick Vapi Setup (5 Minutes)

## Make Voice Calling Work RIGHT NOW! 🎤

---

## 🚀 Super Fast Setup

### Step 1: Get Your FREE Vapi Account (2 mins)

**Go here:** https://vapi.ai/signup

**Click:** "Sign up with Google" (fastest way)

**That's it!** You're in the dashboard.

---

### Step 2: Copy Your API Key (1 min)

**In Vapi Dashboard:**

1. Look at left sidebar
2. Click **"API Keys"** or **"Settings"**
3. Find the **Public Key** (starts with `pk_...`)
4. Click **COPY** button

**It looks like this:**
```
pk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z
```

---

### Step 3: Add to Your App (1 min)

**Open this file in your project:**
```
/config/vapi-config.ts
```

**Find this line:**
```typescript
publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE",
```

**Replace with your key:**
```typescript
publicKey: "pk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
```

**Save file:** Ctrl+S (Windows) or Cmd+S (Mac)

---

### Step 4: Test It! (1 min)

**Refresh your app** (browser will auto-reload)

**You should see in console:**
```
✅ REAL AI VOICE CALLING ENABLED!
```

**Now click through the app:**
1. Welcome screen → **"Let's Get Started"**
2. Fill form → **Submit**
3. Select any AI → **Continue**
4. Click **Phone icon** (Audio Call)
5. **Allow microphone** when prompted

**🎉 AI will greet you in 3-5 seconds!**

---

## ✅ It's Working If You See:

- ✅ Green badge: "Live AI Conversation"
- ✅ AI avatar glows green when speaking
- ✅ You HEAR the AI's voice
- ✅ AI responds to what you say

---

## ❌ Still Not Working?

### Problem: "Still shows demo mode"

**Fix:**
- Check if you saved the file
- Refresh browser (Ctrl+R)
- Make sure no typos in API key

---

### Problem: "No audio"

**Fix:**
- Click microphone icon in browser address bar
- Select "Allow"
- Turn up volume
- Try Chrome browser

---

### Problem: "API key invalid"

**Fix:**
- Make sure you copied the **PUBLIC** key (`pk_...`)
- NOT the private key (`sk_...`)
- Check for extra spaces

---

## 💰 FREE Credits

You get **$10 FREE** = About **10 minutes** of AI calling

**No credit card needed** to start!

---

## 🆘 Need More Help?

Read the detailed guide:
- `/VAPI_INTEGRATION_GUIDE.md` - Complete walkthrough
- `/AUDIO_TROUBLESHOOTING.md` - Fix audio issues

---

## That's It! 🎊

**4 steps. 5 minutes. Voice calling works!**

Now your AI girlfriends can actually TALK to your users! 💜🎤
