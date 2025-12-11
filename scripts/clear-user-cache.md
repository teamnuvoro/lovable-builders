# How to Clear User Cache and See FREE Plan

The database shows you're on FREE plan, but the UI might be showing cached data.

## Quick Fix - Refresh User Data

### Option 1: Logout and Login (Easiest)
1. Click the menu (three dots) in the top right
2. Click "Logout"
3. Login again with j@gmail.com
4. You should now see FREE plan

### Option 2: Clear Browser Storage
1. Open browser DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Local Storage" → `http://localhost:8080`
4. Delete all items
5. Refresh the page (F5)

### Option 3: Hard Refresh
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

## Verify Database Status

Run this to confirm you're free in the database:
```bash
npx tsx scripts/check-user-status.ts
```

## If Still Showing Premium

The backend `/api/user/usage` endpoint might be caching. Check the backend logs when you load the chat page.


