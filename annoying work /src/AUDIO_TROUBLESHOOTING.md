# 🔊 Audio Troubleshooting Guide

## Can't Hear Anything? Here's How to Fix It

### 1. **Check if you're in Demo Mode**

If you see a yellow banner during a call that says **"Can't hear audio? You're in demo mode"**, this means:

- ❌ You don't have a Vapi API key configured
- ✅ The UI works perfectly, but there's no real AI audio

**Solution:** Add your Vapi API key to enable real voice calling
- See `/START_HERE.md` for setup instructions
- First 10 minutes are FREE with Vapi.ai!

---

### 2. **If you HAVE added your API key but still can't hear:**

#### A. Grant Microphone Permissions
Your browser needs microphone access for voice calling to work:

1. Look for a microphone icon in your browser's address bar
2. Click it and select "Allow"
3. Refresh the page and try again

**Chrome/Edge:** Click the microphone icon → Allow
**Firefox:** Click the microphone icon → Allow for this session or Always allow
**Safari:** Safari → Settings for This Website → Microphone → Allow

#### B. Check Your Volume Settings
- 🔊 Increase your device volume
- 🔇 Make sure your device isn't muted
- 🎧 If using headphones, unplug and replug them
- 🔈 Check system audio settings

#### C. Browser Issues
- Try a different browser (Chrome works best)
- Clear browser cache and cookies
- Disable browser extensions that might block audio
- Try incognito/private mode

#### D. Vapi Configuration Check
Make sure your API key is correct in `/config/vapi-config.ts`:

```typescript
export const VAPI_CONFIG = {
  publicKey: "YOUR_ACTUAL_VAPI_KEY_HERE", // Not the placeholder!
};
```

---

### 3. **During the Call - Visual Indicators**

Watch for these indicators to see if audio is working:

✅ **Working correctly:**
- Green badge says "Live AI Conversation"
- AI avatar border glows green when speaking
- "AI is speaking..." text appears
- Voice visualization bars animate

❌ **Not working:**
- No green indicators
- Status stays on "Starting conversation..."
- No animation or visual feedback

---

### 4. **Common Issues**

| Issue | Solution |
|-------|----------|
| "No audio after 10 seconds" | Check microphone permissions |
| "Call connects but silent" | Increase device volume, check mute button |
| "Can't speak to AI" | Grant microphone access |
| "Audio stuttering" | Check internet connection |
| "Call drops immediately" | Verify Vapi API key is valid |

---

### 5. **Test Your Setup**

1. **Start a call** with any AI assistant
2. **Look for** the "Live AI Conversation" green badge
3. **Wait** for the AI to greet you (should happen within 3-5 seconds)
4. **Speak** and watch for the "You are speaking..." indicator
5. **Listen** for the AI response

---

### 6. **Still Not Working?**

Check the browser console (F12 → Console tab) for errors:
- Look for Vapi-related error messages
- Check for microphone permission errors
- Note any API key errors

**Demo Mode is OK!** You can still explore all the UI features - just add your API key when you're ready for real voice calling.

---

### Quick Checklist

- [ ] Vapi API key added to `/config/vapi-config.ts`
- [ ] Microphone permissions granted
- [ ] Device volume turned up
- [ ] Browser is up to date (Chrome/Edge recommended)
- [ ] Stable internet connection
- [ ] No browser extensions blocking audio/microphone

---

## 💡 Pro Tips

1. **First call always takes a bit longer** - Vapi needs to initialize
2. **Speak clearly** - The AI uses Indian English transcription for better Hinglish understanding
3. **Check the mute button** - Make sure it's not red (muted)
4. **Speaker button** - Toggle if needed for better audio output
5. **Good internet** - Voice calls need stable connection

---

## Need Help?

- 📚 Read `/START_HERE.md` for setup guide
- 🎯 See `/WHAT_TO_EXPECT.md` for features guide
- 💬 Check Vapi.ai documentation: https://docs.vapi.ai
