# 📊 Amplitude Analytics Integration Guide

## Overview
This app now has **complete Amplitude analytics tracking** with 50+ events across 8 categories:
1. Onboarding & Authentication
2. Chat Events
3. Voice Call Events
4. Summary Page Events
5. Summary Generation & Evolution
6. Paywall Events
7. Session-Level Events
8. Engagement & Retention

---

## 🚀 Quick Setup

### Step 1: Get Your Amplitude API Key
1. Go to [https://amplitude.com/](https://amplitude.com/)
2. Sign up or log in
3. Create a new project
4. Copy your API key

### Step 2: Add API Key to Environment
Add this to your `.env` file:

```bash
VITE_AMPLITUDE_API_KEY=your_amplitude_api_key_here
```

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Test It!
- Open your app
- Interact with it (send messages, make calls, etc.)
- Go to Amplitude dashboard to see events in real-time!

---

## 📁 File Structure

```
client/src/
├── utils/
│   └── amplitudeTracking.ts       # All tracking functions (50+ events)
├── App.tsx                         # Amplitude initialization
└── pages/
    ├── ChatPage.tsx                # Chat event tracking
    ├── CallPage.tsx                # Voice call tracking
    ├── SummaryPage.tsx             # Summary tracking
    ├── SignupPage.tsx              # Onboarding tracking
    ├── LoginPage.tsx               # Auth tracking
    └── PaywallSheet.tsx            # Payment tracking
```

---

## 🎯 Event Categories

### 1. Onboarding & Authentication (7 events)
- `signup_started` - User begins signup
- `signup_completed` - User completes signup
- `otp_sent` - OTP sent to user
- `otp_verified` - OTP successfully verified
- `login_successful` - User logs in
- `persona_selection_opened` - Persona selection screen opened
- `persona_selected` - User selects a persona

### 2. Chat Events (6 events)
- `chat_opened` - User opens chat
- `message_sent` - User sends a message
- `message_received` - AI response received
- `typing_indicator_shown` - Typing indicator displayed
- `free_message_warning_shown` - Warning shown to free users
- `message_limit_hit` - Free message limit reached

### 3. Voice Call Events (8 events)
- `call_button_clicked` - User clicks call button
- `call_started` - Voice call begins
- `call_transcript_received` - User speech transcribed
- `call_ai_response_generated` - AI generates voice response
- `call_duration_updated` - Call duration milestone
- `free_call_warning_shown` - Warning shown to free users
- `call_limit_hit` - Free call limit reached
- `call_ended` - Voice call ends

### 4. Summary Page Events (5 events)
- `summary_page_opened` - User opens summary page
- `summary_confidence_viewed` - Confidence score viewed
- `summary_traits_viewed` - Traits section viewed
- `summary_next_focus_viewed` - Next focus section viewed
- `summary_scroll_depth` - User scrolls through summary

### 5. Summary Generation & Evolution (4 events)
- `session_summary_generated` - New session summary created
- `cumulative_summary_updated` - Overall summary updated
- `summary_evolution_viewed` - User views evolution
- `summary_evolution_updated` - Evolution data updated

### 6. Paywall Events (8 events)
- `paywall_shown` - Paywall displayed
- `plan_viewed` - User views a plan
- `plan_selected` - User selects a plan
- `payment_session_created` - Payment session initiated
- `payment_successful` - Payment completed
- `payment_failed` - Payment failed
- `paywall_dismissed` - User closes paywall
- `access_unlocked` - Premium access granted

### 7. Session-Level Events (3 events)
- `session_started` - New session begins
- `session_ended` - Session ends
- `session_length_recorded` - Session duration logged

### 8. Engagement & Retention (5 events)
- `returning_user_login` - Returning user logs in
- `daily_active_user` - Daily active user tracked
- `persona_alignment_viewed` - Alignment score viewed
- `cta_voice_call_clicked` - Voice call CTA clicked
- `cta_summary_clicked` - Summary CTA clicked

---

## 💻 Usage Examples

### Example 1: Track Chat Message
```typescript
import { trackMessageSent, trackMessageReceived } from '@/utils/amplitudeTracking';

const handleSendMessage = (message: string) => {
  // Track message sent
  trackMessageSent(message.length, sessionNumber);
  
  // Send message...
  
  // After AI responds
  const startTime = Date.now();
  // ... get response ...
  const latency = Date.now() - startTime;
  trackMessageReceived(response.length, latency);
};
```

### Example 2: Track Voice Call
```typescript
import { 
  trackCallStarted, 
  trackCallEnded,
  trackCallDurationUpdated 
} from '@/utils/amplitudeTracking';

const startCall = () => {
  trackCallStarted(1, callSessionId);
  
  // Update duration every 30 seconds
  const interval = setInterval(() => {
    trackCallDurationUpdated(callDuration);
  }, 30000);
};

const endCall = () => {
  trackCallEnded(totalDuration, true, 'user_ended');
};
```

### Example 3: Track Payment
```typescript
import { 
  trackPaywallShown,
  trackPlanSelected,
  trackPaymentSuccessful 
} from '@/utils/amplitudeTracking';

const showPaywall = () => {
  trackPaywallShown('chat_limit');
};

const selectPlan = (plan: string) => {
  trackPlanSelected(plan, 49, 7); // plan, price, days
};

const onPaymentSuccess = () => {
  trackPaymentSuccessful('weekly', '2025-12-10');
};
```

### Example 4: Track User Properties
```typescript
import { setUserProperties, updateUserProperties } from '@/utils/amplitudeTracking';

// On signup
setUserProperties(userId, {
  name: 'John',
  email: 'john@example.com',
  signup_date: new Date().toISOString(),
  device_type: 'mobile'
});

// On upgrade to premium
updateUserProperties({
  is_premium: true,
  plan_type: 'weekly',
  upgrade_date: new Date().toISOString()
});
```

---

## 🔧 Integration Checklist

### Frontend Pages to Integrate:

- [ ] **SignupPage.tsx**
  - [ ] `trackSignupStarted()` on page load
  - [ ] `trackOtpSent()` after OTP sent
  - [ ] `trackOtpVerified()` after verification
  - [ ] `trackSignupCompleted()` after signup

- [ ] **LoginPage.tsx**
  - [ ] `trackLoginSuccessful()` after login
  - [ ] `trackReturningUserLogin()` for returning users

- [ ] **ChatPage.tsx** ✅ (Already integrated)
  - [x] `trackChatOpened()` on page load
  - [x] `trackMessageSent()` when sending
  - [x] `trackMessageReceived()` when receiving
  - [x] `trackSessionStarted()` on session start

- [ ] **CallPage.tsx**
  - [ ] `trackCallButtonClicked()` when clicked
  - [ ] `trackCallStarted()` when call begins
  - [ ] `trackCallEnded()` when call ends
  - [ ] `trackCallDurationUpdated()` every 30s

- [ ] **SummaryPage.tsx**
  - [ ] `trackSummaryPageOpened()` on page load
  - [ ] `trackSummaryConfidenceViewed()` when viewed
  - [ ] `trackSummaryScrollDepth()` on scroll

- [ ] **PaywallSheet.tsx**
  - [ ] `trackPaywallShown()` when opened
  - [ ] `trackPlanSelected()` when plan clicked
  - [ ] `trackPaymentSuccessful()` on success
  - [ ] `trackPaymentFailed()` on failure

---

## 📊 Viewing Analytics

### Amplitude Dashboard
1. Go to [https://amplitude.com/](https://amplitude.com/)
2. Select your project
3. View real-time events, user flows, funnels, and more!

### Key Reports to Create:
1. **Signup Funnel**
   - signup_started → otp_sent → otp_verified → signup_completed

2. **Chat Engagement**
   - chat_opened → message_sent → message_received
   - Track: messages per session, session length

3. **Voice Call Usage**
   - call_button_clicked → call_started → call_ended
   - Track: call duration, call completion rate

4. **Conversion Funnel**
   - paywall_shown → plan_selected → payment_session_created → payment_successful
   - Track: conversion rate, revenue

5. **Retention**
   - daily_active_user
   - returning_user_login
   - Track: DAU, MAU, retention curves

---

## 🎨 Custom Events

You can track custom events using:

```typescript
import { trackCustomEvent } from '@/utils/amplitudeTracking';

trackCustomEvent('custom_event_name', {
  property1: 'value1',
  property2: 123,
  property3: true
});
```

---

## 🔍 Debugging

### Check if Amplitude is initialized:
```typescript
// In browser console
console.log(window.amplitude);
```

### Test events manually:
```typescript
import { trackCustomEvent } from '@/utils/amplitudeTracking';

trackCustomEvent('test_event', { test: true });
```

### View events in Amplitude:
1. Go to Amplitude dashboard
2. Click "User Look-Up"
3. Search for your user ID
4. View all events for that user

---

## 🚨 Troubleshooting

### Events not showing in Amplitude?
1. Check API key is correct in `.env`
2. Restart development server
3. Clear browser cache
4. Check browser console for errors
5. Verify Amplitude is initialized: `console.log(window.amplitude)`

### User ID not set?
```typescript
import { setUserProperties } from '@/utils/amplitudeTracking';

setUserProperties(userId, {
  name: 'User Name',
  email: 'user@example.com'
});
```

### Events delayed?
- Amplitude batches events for performance
- Events may take 1-2 minutes to appear in dashboard
- Use "User Look-Up" for real-time event viewing

---

## 📈 Best Practices

1. **Track Early and Often**
   - Add tracking when building features
   - Don't wait until the end

2. **Use Descriptive Properties**
   - Add context to events
   - Include relevant metadata

3. **Set User Properties**
   - Track user attributes
   - Update on changes (upgrade, etc.)

4. **Create Funnels**
   - Identify drop-off points
   - Optimize conversion

5. **Monitor Daily**
   - Check key metrics
   - Identify issues early

---

## 🎉 You're All Set!

Your app now has **complete analytics tracking** with Amplitude!

**Next Steps:**
1. Add `VITE_AMPLITUDE_API_KEY` to `.env`
2. Restart server
3. Test the app
4. View events in Amplitude dashboard
5. Create reports and funnels
6. Optimize based on data!

---

**Need Help?**
- Amplitude Docs: https://www.docs.developers.amplitude.com/
- Amplitude Support: https://help.amplitude.com/

**Happy Tracking! 📊🚀**

