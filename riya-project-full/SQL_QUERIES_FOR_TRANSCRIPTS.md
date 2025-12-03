# 📝 SQL Queries to View Voice Call Transcripts

## ✅ Ready-to-Use Queries

---

## Query 1: View ALL Transcripts (No User Filter)

**Use this to see all transcripts:**

```sql
SELECT 
  id,
  user_id,
  started_at,
  ended_at,
  duration_seconds,
  transcript
FROM call_sessions
WHERE transcript IS NOT NULL
  AND transcript != ''
  AND transcript != 'No transcript available'
ORDER BY started_at DESC
LIMIT 50;
```

**This shows:**
- All users
- Last 50 calls with transcripts
- Most recent first

---

## Query 2: View Recent Transcripts with Details

**Use this for detailed view:**

```sql
SELECT 
  started_at::date as call_date,
  started_at::time as call_time,
  duration_seconds || ' seconds' as duration,
  length(transcript) || ' chars' as transcript_length,
  transcript
FROM call_sessions
WHERE transcript IS NOT NULL
  AND transcript != ''
ORDER BY started_at DESC
LIMIT 20;
```

**This shows:**
- Date of call
- Time of call
- Duration
- Transcript length
- Full transcript

---

## Query 3: Today's Transcripts

**Use this to see today's calls:**

```sql
SELECT 
  started_at,
  duration_seconds,
  transcript
FROM call_sessions
WHERE DATE(started_at) = CURRENT_DATE
  AND transcript IS NOT NULL
ORDER BY started_at DESC;
```

---

## Query 4: Search Transcripts by Keyword

**Use this to search for specific words:**

```sql
SELECT 
  started_at,
  duration_seconds,
  transcript
FROM call_sessions
WHERE transcript ILIKE '%relationship%'
  AND transcript IS NOT NULL
ORDER BY started_at DESC
LIMIT 20;
```

**Replace `%relationship%` with any keyword:**
- `%love%` - Find mentions of love
- `%problem%` - Find problems discussed
- `%advice%` - Find advice given
- `%jaanu%` - Find specific Hindi terms

---

## Query 5: Get Latest Transcript (Most Recent)

**Use this to see your last call:**

```sql
SELECT 
  started_at,
  duration_seconds,
  transcript
FROM call_sessions
WHERE transcript IS NOT NULL
  AND transcript != ''
ORDER BY started_at DESC
LIMIT 1;
```

---

## Query 6: Count Transcripts

**Use this to see how many calls have transcripts:**

```sql
SELECT 
  COUNT(*) as total_calls,
  COUNT(CASE WHEN transcript IS NOT NULL AND transcript != '' THEN 1 END) as calls_with_transcript,
  ROUND(AVG(duration_seconds), 2) as avg_duration_seconds
FROM call_sessions;
```

---

## Query 7: Longest Conversations

**Use this to find longest calls:**

```sql
SELECT 
  started_at,
  duration_seconds,
  length(transcript) as transcript_chars,
  transcript
FROM call_sessions
WHERE transcript IS NOT NULL
ORDER BY duration_seconds DESC
LIMIT 10;
```

---

## Query 8: If You Know Your User ID

**Find your user ID first:**

```sql
SELECT id, name, email, phone_number 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

**Then use your actual user ID:**

```sql
SELECT 
  started_at,
  duration_seconds,
  transcript
FROM call_sessions
WHERE user_id = 'paste-your-actual-uuid-here'
ORDER BY started_at DESC;
```

---

## 🎯 How to Run Queries

### In Supabase Dashboard:

1. Go to **SQL Editor** (not Table Editor)
2. Click **"New Query"**
3. **Copy one of the queries above**
4. **Paste it** in the editor
5. Click **"Run"** or press `Ctrl+Enter`
6. View results!

---

## 📊 Understanding Results

**Columns you'll see:**
- `started_at` - When call started
- `ended_at` - When call ended
- `duration_seconds` - Call length
- `transcript` - Full conversation
- `user_id` - Who made the call

**Transcript format:**
```
[USER]: User's message
[ASSISTANT]: AI's response
[USER]: Next user message
[ASSISTANT]: Next AI response
```

---

## 🔍 Quick Test Query

**Copy and paste this to test immediately:**

```sql
-- Get last 5 transcripts with formatted output
SELECT 
  to_char(started_at, 'Mon DD, YYYY HH24:MI') as call_time,
  duration_seconds || 's' as duration,
  CASE 
    WHEN length(transcript) > 100 
    THEN left(transcript, 100) || '...' 
    ELSE transcript 
  END as transcript_preview
FROM call_sessions
WHERE transcript IS NOT NULL
  AND transcript != ''
ORDER BY started_at DESC
LIMIT 5;
```

This shows:
- Last 5 calls
- Formatted date/time
- Duration
- First 100 characters of transcript

---

## ⚠️ Important Notes

1. **Don't use** `'your-user-id'` literally
2. **Use the queries without user_id** to see all transcripts
3. **Or find your UUID** from the users table first
4. **Transcripts only save** if call has actual conversation

---

## 🎉 Ready to Use!

**Start with Query 1** (shows all transcripts) to test!

Copy it from above and run it in Supabase SQL Editor!

