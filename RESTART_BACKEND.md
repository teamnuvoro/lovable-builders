# Backend Server Restart Required

## Problem
The error "Product ID not configured" occurs because the backend server is still running with old environment variables.

## Solution
**Restart the backend server** to load the new `DODO_PRODUCT_ID_DAILY` and `DODO_PRODUCT_ID_WEEKLY` from `.env`.

## Steps

### 1. Stop the current backend server
- Press `Ctrl+C` in the terminal where the backend is running
- Or kill the process if running in background

### 2. Restart the backend
```bash
npm run dev:server
```

### 3. Verify environment variables are loaded
After restart, you should see in the logs that the server started successfully. The product IDs will now be available to `process.env.DODO_PRODUCT_ID_DAILY` and `process.env.DODO_PRODUCT_ID_WEEKLY`.

## Why This Happens
- Node.js loads environment variables from `.env` only when the process starts
- Adding variables to `.env` while the server is running doesn't update the running process
- The server must be restarted to pick up new environment variables

## Verification
After restart, try the payment flow again. The error should be resolved.
