# How to Get Your API Keys

## Supabase Keys (REQUIRED)

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/settings/api

2. **Copy these 3 values:**
   - **Project URL** → Already set in .env as `https://xgraxcgavqeyqfwimbwt.supabase.co`
   - **Service Role Secret** → Copy this (long string starting with `eyJ...`) → Paste as `SUPABASE_SERVICE_ROLE_KEY`
   - **Anon Public Key** → Copy this (long string starting with `eyJ...`) → Paste as `VITE_SUPABASE_ANON_KEY`

   ⚠️ **Important:** Use "Service Role Secret" NOT "Anon Key" for `SUPABASE_SERVICE_ROLE_KEY`

## Groq API Key (REQUIRED for chat)

1. **Go to Groq Console:**
   https://console.groq.com

2. **Sign up/Login**

3. **Go to API Keys section**

4. **Create a new API key** (or copy existing one)

5. **Paste as `GROQ_API_KEY` in .env**

## Cashfree Keys (REQUIRED for payment testing)

1. **Go to Cashfree Dashboard:**
   https://www.cashfree.com/developers

2. **Get your App ID and Secret Key** (test/sandbox keys are fine for local testing)

3. **Paste as `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` in .env**


