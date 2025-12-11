# Simple Supabase Setup for Local Testing

## Step 1: Get Your Supabase Keys

1. Go to: https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/settings/api

2. Copy these 4 values:
   - **Project URL** → Use for `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **Service Role Secret** → Use for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)
   - **Anon Public Key** → Use for `VITE_SUPABASE_ANON_KEY`

## Step 2: Create/Update Your .env File

Create a `.env` file in the root directory with these exact variables:

```env
# Supabase (REQUIRED for payments and user upgrades)
SUPABASE_URL=https://xgraxcgavqeyqfwimbwt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VITE_SUPABASE_URL=https://xgraxcgavqeyqfwimbwt.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Server
NODE_ENV=development
PORT=3000

# AI Chat (REQUIRED)
GROQ_API_KEY=your-groq-api-key-here

# Payments (REQUIRED for testing payments)
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENV=TEST

# Session
SESSION_SECRET=any-random-string-here
```

## Step 3: Verify Connection

Run this to test your Supabase connection:
```bash
npm run test:supabase
```

## That's It!

Now run:
```bash
./start-dev.sh
```

Your payments and user upgrades will work with the real Supabase database.


