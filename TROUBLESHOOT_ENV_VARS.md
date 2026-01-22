# Troubleshooting: Environment Variables Not Loading

## Problem
Backend server shows: "Product ID not configured" even though product IDs are in `.env` file.

## Root Cause
**The backend server process was started BEFORE the environment variables were added to `.env`.**

Node.js only loads environment variables from `.env` when the process starts. Adding variables to `.env` while the server is running does NOT update the running process.

## Solution: Restart Backend Server

### Step 1: Stop the Current Server
- Find the terminal where the backend is running
- Press `Ctrl+C` to stop it
- Wait for it to fully stop

### Step 2: Verify .env File
The `.env` file should contain:
```env
DODO_PRODUCT_ID_DAILY=pdt_0NWqC74RstuwjFqmtaXuM
DODO_PRODUCT_ID_WEEKLY=pdt_0NWqCOKnCmDnEvrpvpY1W
```

### Step 3: Restart the Server
```bash
npm run dev:server
```

### Step 4: Check Server Logs
After restart, you should see in the logs:
```
[Dodo] Environment variables check: {
  DODO_PRODUCT_ID_DAILY: 'pdt_0NWqC...',
  DODO_PRODUCT_ID_WEEKLY: 'pdt_0NWqC...',
  planType: 'daily'
}
```

If you see "NOT SET", the environment variables are still not loading.

## Debugging Steps

### 1. Check if .env is in the right location
The `.env` file must be in the **project root** (same directory as `package.json`).

### 2. Check for .env file conflicts
Make sure there's only one `.env` file. Check for:
- `.env.local`
- `.env.development`
- `.env.production`

### 3. Verify dotenv is loading
The server uses `import "dotenv/config"` at the top of `server/index.ts`. This should automatically load `.env`.

### 4. Check for Supabase secrets override
If you're using Supabase secrets, they might override `.env` values. Check `server/secrets.ts` - it only sets env vars if they don't exist, so this shouldn't be the issue.

### 5. Manual verification
Add this to `server/services/dodo.ts` temporarily to debug:
```typescript
console.log('All DODO env vars:', {
  DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY ? 'SET' : 'NOT SET',
  DODO_PRODUCT_ID_DAILY: process.env.DODO_PRODUCT_ID_DAILY || 'NOT SET',
  DODO_PRODUCT_ID_WEEKLY: process.env.DODO_PRODUCT_ID_WEEKLY || 'NOT SET',
});
```

## Common Issues

### Issue 1: Server not restarted
**Symptom:** Variables in `.env` but server can't see them  
**Fix:** Restart the server

### Issue 2: Wrong .env file location
**Symptom:** Variables not loading  
**Fix:** Ensure `.env` is in project root (where `server/` folder is)

### Issue 3: Whitespace in .env
**Symptom:** Variables appear set but have trailing spaces  
**Fix:** Use `.trim()` when reading (already added in code)

### Issue 4: Multiple .env files
**Symptom:** Conflicting values  
**Fix:** Use only one `.env` file in project root

## After Restart

Once the server is restarted, try the payment flow again. The debug logs will show:
- Whether environment variables are loaded
- Which product ID is being used
- Any other configuration issues

If the error persists after restart, check the server logs for the debug output.
