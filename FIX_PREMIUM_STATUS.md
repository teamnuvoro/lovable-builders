# Fix: User Always Showing Premium

## Problem
User is showing as premium even though database says `premium_user = false`.

## Root Cause
Frontend was prioritizing `userUsage?.premiumUser` over `user?.premium_user`, and the cached data might be stale.

## Solution Applied

### 1. Fixed Premium Check Logic
**Before:**
```typescript
const isPremium = userUsage?.premiumUser || user?.premium_user || false;
```

**After:**
```typescript
const isPremium = user?.premium_user === true ? true : (userUsage?.premiumUser === true);
```

Now it prioritizes the `user` object (from auth context) which comes directly from the database.

### 2. Fixed Message Limit
**Before:** Limit was 5 (incorrect)
**After:** Limit is 20 (correct)

### 3. Backend Verification
Backend now double-checks and ensures `premium_user=false` is respected.

## How to Force Refresh

### Option 1: Logout and Login
1. Click logout
2. Clear browser cache: `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows)
3. Login again with phone: `8828447880`
4. Should show FREE PLAN

### Option 2: Clear LocalStorage
Open browser console and run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Option 3: Hard Refresh
- Mac: `Cmd+Shift+R`
- Windows: `Ctrl+Shift+R`

## Verify in Database

Run this SQL in Supabase SQL Editor:
```sql
SELECT 
  id, 
  name, 
  email, 
  phone_number,
  premium_user,
  subscription_plan,
  subscription_expiry
FROM users
WHERE phone_number = '8828447880';
```

Should show:
- `premium_user`: `false`
- `subscription_plan`: `null`
- `subscription_expiry`: `null`

## If Still Showing Premium

1. Check which user ID you're logged in as (check browser console logs)
2. Verify that user ID in database has `premium_user = false`
3. Clear all browser storage and login again

