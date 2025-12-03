# ✅ Testing Checklist - Verify Real Voice Calling Works

## Before You Start

- [ ] Added Vapi API key to `/config/vapi-config.ts`
- [ ] Ran `npm install`
- [ ] Started app with `npm run dev`
- [ ] Using Chrome, Edge, or Safari (best browsers for voice)

---

## 🎤 Test Real Voice Calling

### Test 1: Audio Call with Riya

1. [ ] Open app in browser
2. [ ] Skip welcome screen
3. [ ] Fill registration (any name/email/phone)
4. [ ] Select **Riya** from AI carousel
5. [ ] Click **phone icon** (bottom left)
6. [ ] Allow microphone when prompted
7. [ ] Wait 3-5 seconds
8. [ ] **EXPECTED:** Hear Riya say "Namaste! Main Riya hoon..."
9. [ ] Say: "Hi Riya, how are you?"
10. [ ] **EXPECTED:** Riya responds with voice
11. [ ] Check for green badge: "Live AI Conversation"
12. [ ] Check for status: "🎤 AI is speaking..."
13. [ ] Say: "Tell me about yourself"
14. [ ] **EXPECTED:** Riya talks about being a relationship advisor
15. [ ] Click red phone button to end call
16. [ ] **EXPECTED:** Call ends, back to chat

**✅ PASS if you heard Riya's voice and she responded to you**

---

### Test 2: Audio Call with Different AI

1. [ ] Go back to AI selection
2. [ ] Select **Priya**
3. [ ] Click phone icon
4. [ ] Wait for greeting
5. [ ] **EXPECTED:** Hear Priya's voice (different from Riya)
6. [ ] Say: "What's your personality?"
7. [ ] **EXPECTED:** Priya describes being direct and practical
8. [ ] End call

**✅ PASS if Priya sounds different and has different personality**

---

### Test 3: Mute/Unmute

1. [ ] Start call with any AI
2. [ ] Wait for AI to finish speaking
3. [ ] Click **mute button** (microphone icon)
4. [ ] **EXPECTED:** Mic button turns red
5. [ ] Try talking
6. [ ] **EXPECTED:** AI doesn't respond (you're muted)
7. [ ] Click mute button again to unmute
8. [ ] Say: "Can you hear me now?"
9. [ ] **EXPECTED:** AI responds

**✅ PASS if mute prevents AI from hearing you**

---

### Test 4: Real-time Status Indicators

1. [ ] Start call
2. [ ] Watch the screen while AI is talking
3. [ ] **EXPECTED:** 
   - AI image has green glowing border
   - Text shows "🎤 AI is speaking..."
   - Green pulse animation
4. [ ] Start talking (while not muted)
5. [ ] **EXPECTED:**
   - Status shows "You are speaking..."
   - Blue indicator appears
6. [ ] Stop talking
7. [ ] **EXPECTED:** Status shows "👂 Listening to you..."

**✅ PASS if status changes in real-time**

---

### Test 5: Long Conversation

1. [ ] Start call with any AI
2. [ ] Have a 2-minute conversation about:
   - Your relationship status
   - A problem you're facing
   - Ask for advice
3. [ ] **EXPECTED:**
   - AI remembers context from earlier in conversation
   - AI asks follow-up questions
   - AI provides relevant advice
   - No disconnections
   - Clear audio quality
4. [ ] Check call duration timer
5. [ ] **EXPECTED:** Shows accurate time (around 2:00)

**✅ PASS if AI maintains context and quality throughout**

---

### Test 6: Video Call (Optional)

1. [ ] Click **video icon** (camera button)
2. [ ] Allow camera access
3. [ ] **EXPECTED:**
   - See yourself in small window (top right)
   - AI's image in center
   - All audio features still work
4. [ ] Toggle camera off
5. [ ] **EXPECTED:** Your video turns off, audio continues
6. [ ] Toggle camera back on
7. [ ] End call

**✅ PASS if video shows and audio still works**

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to start AI call"

**Possible causes:**
- [ ] API key not added
- [ ] API key is incorrect
- [ ] Package not installed

**Fix:**
1. Open `/config/vapi-config.ts`
2. Verify key starts with `vapi_pk_`
3. Run `npm install @vapi-ai/web`
4. Restart dev server

---

### Issue: Can't hear AI

**Possible causes:**
- [ ] Volume is muted
- [ ] Wrong audio output device
- [ ] Speaker button is off

**Fix:**
1. Check system volume
2. Check browser isn't muted (right-click browser tab)
3. Click speaker button in call (should show Volume2 icon)
4. Try using earphones

---

### Issue: AI doesn't hear me

**Possible causes:**
- [ ] Microphone is muted
- [ ] Wrong input device
- [ ] Microphone permissions denied

**Fix:**
1. Check mute button (shouldn't be red)
2. Check browser permissions (click lock icon in address bar)
3. Check system microphone isn't muted
4. Try different browser

---

### Issue: Delayed responses

**Possible causes:**
- [ ] Slow internet
- [ ] First message (always slower)
- [ ] High Vapi server load

**Fix:**
- First message: 5-10 seconds is normal
- Later messages: 1-3 seconds is normal
- Check internet speed (need 2+ Mbps)
- Try again in a few minutes

---

## 📊 Quality Checklist

After testing, verify:

### Audio Quality
- [ ] AI voice is clear and natural
- [ ] No robotic/distorted sound
- [ ] No echo or feedback
- [ ] Volume is comfortable

### Response Quality
- [ ] AI understands your questions
- [ ] Responses are relevant
- [ ] AI speaks in Hinglish
- [ ] AI maintains personality

### Technical Performance
- [ ] No disconnections
- [ ] Smooth conversation flow
- [ ] Status indicators work
- [ ] Timer is accurate
- [ ] Mute button works
- [ ] End call works instantly

### UI/UX
- [ ] Call screen looks good
- [ ] Animations are smooth
- [ ] Buttons are responsive
- [ ] Text is readable
- [ ] Indicators are visible

---

## 💰 Cost Test

Check Vapi usage:

1. [ ] Go to https://vapi.ai/dashboard
2. [ ] Click "Usage"
3. [ ] Find your test calls
4. [ ] **EXPECTED:** See call duration and cost
5. [ ] Verify cost is ~$0.05 per minute

**Example:**
- 5 minute call = $0.25
- 10 minute call = $0.50

---

## 🎯 Success Criteria

Your voice calling is **FULLY WORKING** if:

✅ You can hear AI's voice clearly
✅ AI can hear and understand you
✅ Conversation flows naturally
✅ Status indicators work in real-time
✅ All 4 AI personalities sound different
✅ Mute/unmute works
✅ Calls don't disconnect
✅ Dashboard shows usage

---

## 📱 Mobile Testing (Bonus)

If testing on mobile:

1. [ ] Deploy to Vercel/Netlify
2. [ ] Open on phone
3. [ ] Test with mobile browser
4. [ ] **EXPECTED:** 
   - Microphone works
   - Audio plays from speaker
   - UI scales properly
   - Touch controls work

---

## 🚀 Production Readiness

Before deploying to production:

- [ ] All tests pass
- [ ] Cost is acceptable
- [ ] Audio quality is good
- [ ] No console errors
- [ ] Works on mobile
- [ ] Budget alerts set
- [ ] API keys are secure

---

## 📝 Test Notes

**Date tested:** _________________

**Browser used:** _________________

**Total test duration:** _________ minutes

**Total cost:** $__________

**Issues found:** 

_________________________________

_________________________________

_________________________________

**Overall rating:** ⭐⭐⭐⭐⭐

---

## ✅ Final Verification

I verify that:
- [ ] Voice calling works perfectly
- [ ] All AI personalities work
- [ ] Audio quality is production-ready
- [ ] No critical bugs found
- [ ] Ready to deploy

**Tester signature:** _________________

---

**Congratulations! Your real AI voice calling is working! 🎉**

You can now deploy this to production and let real users talk to your AI assistants!
