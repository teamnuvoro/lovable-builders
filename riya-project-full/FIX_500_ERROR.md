# 🔧 FIXING 500 ERROR - Database Issue

## Problem:

OTP verification passed ✅
But creating user in Supabase failed ❌

Error: "Failed to create user account"

## Root Cause:

Either:
1. Supabase tables don't exist
2. Schema mismatch (columns missing/wrong type)
3. Service key not configured
4. Connection issue

## SOLUTION:

### Step 1: Create Tables in Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Copy the contents of `CREATE_SUPABASE_TABLES.sql`
5. Paste in SQL Editor
6. Click **RUN**
7. You'll see: "All tables created successfully!"

### Step 2: Verify Service Key in .env

Check your `.env` file has:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Restart Server

```bash
Ctrl+C
npm run dev
```

### Step 4: Test Again

1. Go to signup
2. Get OTP
3. Enter OTP
4. **IT WILL WORK!**

---

## Quick Check:

Run this in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- users
- usage_stats
- sessions
- messages
- user_summary_latest

If any are missing, run the CREATE_SUPABASE_TABLES.sql script!

---

**Create the tables and it will work immediately!**
