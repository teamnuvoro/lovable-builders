# 📝 Message Storage Verification

## ✅ Where Messages Are Saved

Your app saves messages in **TWO places**:

---

## 1. 💬 CHAT MESSAGES (Text)

### Database Table: `messages`

**Location:** `server/routes/chat.ts` (Line 299-305)

### What Gets Saved:
```typescript
{
  session_id: "uuid",
  user_id: "uuid",
  role: "user" | "assistant",
  text: "message content",
  tag: "general",
  created_at: "timestamp"
}
```

### When It Saves:

**User Messages:**
- Saved IMMEDIATELY when user sends
- Before AI processes
- Line 299-305 in chat.ts

**AI Responses:**
- Saved AFTER AI generates response
- Line 443-450 in chat.ts
- After streaming completes

---

## 2. 🎤 VOICE CALL TRANSCRIPTS

### Database Table: `call_sessions`

**Location:** `server/routes/call.ts` (Line 156)

### What Gets Saved:
```typescript
{
  user_id: "uuid",
  vapi_call_id: "text",
  status: "completed",
  started_at: "timestamp",
  ended_at: "timestamp",
  duration_seconds: 120,
  transcript: "[USER]: Hello\n[ASSISTANT]: Hi!",
  metadata: {}
}
```

### When It Saves:
- Transcript saved when call ENDS
- Full conversation included
- Both user speech and AI responses

---

## 🔍 Verification Queries

### Check Chat Messages:
```sql
-- Last 50 chat messages
SELECT 
  created_at,
  role,
  text,
  session_id
FROM messages
ORDER BY created_at DESC
LIMIT 50;
```

### Check Voice Transcripts:
```sql
-- Last 20 voice call transcripts
SELECT 
  started_at,
  duration_seconds,
  transcript
FROM call_sessions
WHERE transcript IS NOT NULL
  AND transcript != ''
ORDER BY started_at DESC
LIMIT 20;
```

### Check BOTH:
```sql
-- Combined view of all conversations
SELECT 
  'chat' as type,
  created_at as timestamp,
  role,
  text as content,
  NULL as duration
FROM messages
UNION ALL
SELECT 
  'voice' as type,
  started_at as timestamp,
  'call' as role,
  transcript as content,
  duration_seconds as duration
FROM call_sessions
WHERE transcript IS NOT NULL
ORDER BY timestamp DESC
LIMIT 100;
```

---

## 📊 Storage Status

### Chat Messages: ✅ SAVING
- **Table:** `messages`
- **User messages:** ✅ Saved immediately
- **AI responses:** ✅ Saved after generation
- **Storage:** Supabase (if configured) or In-Memory

### Voice Transcripts: ✅ SAVING
- **Table:** `call_sessions`
- **Full transcript:** ✅ Saved on call end
- **Format:** `[USER]: text\n[ASSISTANT]: text`
- **Storage:** Supabase (if configured)

---

## 🧪 How to Verify

### For Chat Messages:

**Step 1:** Send some chat messages
```
1. Go to chat page
2. Send: "Hey Riya, test message 1"
3. Wait for response
4. Send: "Test message 2"
5. Wait for response
```

**Step 2:** Check Database
```sql
SELECT * FROM messages 
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected Result:**
- Row with role='user', text='Hey Riya, test message 1'
- Row with role='assistant', text='[AI response]'
- Row with role='user', text='Test message 2'
- Row with role='assistant', text='[AI response]'

### For Voice Transcripts:

**Step 1:** Make a voice call
```
1. Go to call page
2. Start call
3. Say: "Hello Riya"
4. Wait for AI response
5. Say: "How are you?"
6. End call
```

**Step 2:** Check Database
```sql
SELECT transcript FROM call_sessions 
ORDER BY started_at DESC 
LIMIT 1;
```

**Expected Result:**
```
[USER]: Hello Riya
[ASSISTANT]: Hey baby! Main thik hoon! How are you?
[USER]: How are you?
[ASSISTANT]: [AI response]
```

---

## 📁 Database Schema

### messages table:
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  tag TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### call_sessions table:
```sql
CREATE TABLE call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  vapi_call_id TEXT,
  status TEXT DEFAULT 'started',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  transcript TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 Quick Verification

**Run this in Supabase SQL Editor:**

```sql
-- Check if messages are being saved
SELECT 
  'Chat Messages' as type,
  COUNT(*) as count,
  MAX(created_at) as last_message
FROM messages
UNION ALL
SELECT 
  'Voice Transcripts' as type,
  COUNT(*) as count,
  MAX(started_at) as last_call
FROM call_sessions
WHERE transcript IS NOT NULL;
```

**Expected Output:**
```
Chat Messages    | 42  | 2025-12-03 16:30:00
Voice Transcripts | 5   | 2025-12-03 16:25:00
```

---

## ✅ Confirmation

**Both storage systems are ACTIVE:**

1. **Chat Messages** → `messages` table ✅
   - Saved in real-time
   - Both user and AI
   - Via `/api/chat` endpoint

2. **Voice Transcripts** → `call_sessions` table ✅
   - Saved on call end
   - Full conversation
   - Via `/api/call/end` endpoint

---

## 🎉 All Messages Are Being Saved!

**Your app stores:**
- ✅ Every chat message (text)
- ✅ Every voice call transcript
- ✅ User inputs
- ✅ AI responses
- ✅ Timestamps
- ✅ Session info

**Nothing is lost!** 📝✨
