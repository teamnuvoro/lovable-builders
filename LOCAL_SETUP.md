# Local Development Setup Guide

This guide will help you run the Riya AI Companion app on your localhost.

## Prerequisites

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Supabase account** (for database) - [Sign up free](https://supabase.com)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy this template and fill in your values
cp .env.example .env  # If .env.example exists, or create manually
```

### Required Environment Variables

Create a `.env` file with these variables:

```env
# ==========================================
# SUPABASE (Required for database)
# ==========================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# ==========================================
# SERVER CONFIGURATION
# ==========================================
NODE_ENV=development
PORT=5000

# ==========================================
# AI SERVICES (Required for chat)
# ==========================================
GROQ_API_KEY=your-groq-api-key

# ==========================================
# OPTIONAL SERVICES
# ==========================================

# Voice Calling (VAPI) - Optional
VAPI_PUBLIC_KEY=your-vapi-public-key
VAPI_PRIVATE_KEY=your-vapi-private-key
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key

# Payments (Cashfree) - Optional
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENV=TEST

# Email (for OTP) - Optional for local dev
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Session Secret (generate a random string)
SESSION_SECRET=your-random-secret-key-here
```

### How to Get Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **Service Role Secret** → `SUPABASE_SERVICE_ROLE_KEY`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

### How to Get Groq API Key

1. Go to [Groq Console](https://console.groq.com)
2. Sign up/login
3. Go to **API Keys**
4. Create a new API key
5. Copy it to `GROQ_API_KEY`

### Generate Session Secret

```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use any random string generator
```

## Step 3: Set Up Database

### Option A: Use Supabase (Recommended)

1. Go to your Supabase project dashboard
2. Click **SQL Editor**
3. Run the migrations in order:
   ```bash
   # Run these SQL files in Supabase SQL Editor:
   supabase/migrations/20251208_safe_migration.sql
   supabase/migrations/20250109_payment_upgrade_automation.sql
   supabase/migrations/20250112_fix_rls_for_upgrade_triggers.sql
   ```

### Option B: Skip Database (Development Only)

If you just want to test the UI without a database, you can skip this step. The app will show errors but the frontend will still load.

## Step 4: Run the Development Server

### Start Both Frontend and Backend Together

```bash
npm run dev
```

This command:
- Starts the Express backend server on port 5000
- Starts the Vite frontend dev server
- Enables hot module replacement (HMR) for instant updates

### Or Run Separately (Advanced)

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Step 5: Access the App

Open your browser and go to:

```
http://localhost:5000
```

The app should load! 🎉

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, either:

1. **Kill the process using port 5000:**
   ```bash
   # Mac/Linux:
   lsof -ti:5000 | xargs kill -9
   
   # Or use the provided script:
   node KILL_PORT.md  # If it exists
   ```

2. **Use a different port:**
   ```bash
   PORT=3000 npm run dev
   ```

### Database Connection Errors

- Verify your Supabase credentials in `.env`
- Check that your Supabase project is active
- Make sure you've run the database migrations

### API Key Errors

- Verify all API keys are correct in `.env`
- Check that keys don't have extra spaces or quotes
- For Groq: Make sure your API key is active

### Module Not Found Errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check for type errors
npm run check
```

## Development Tips

### Hot Reload

- Frontend changes: Automatically reload in browser
- Backend changes: Restart server with `npm run dev:server`

### Environment Variables

- Never commit `.env` to git (it's in `.gitignore`)
- Use `.env.local` for local overrides (also ignored by git)

### Database Changes

After modifying the schema:
```bash
npm run db:push
```

### Build for Production

```bash
npm run build:all
npm start
```

## Next Steps

- ✅ App is running on `http://localhost:5000`
- ✅ Test authentication (OTP login)
- ✅ Test chat functionality
- ✅ Check Supabase dashboard for data

## Need Help?

- Check the [README.md](./README.md) for more details
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Check server logs in terminal for errors

---

**Happy coding! 🚀**


