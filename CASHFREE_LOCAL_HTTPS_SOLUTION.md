# Cashfree Local HTTPS Solution

## Problem
Cashfree requires **HTTPS URLs** for whitelisting, but `http://localhost:8080` is HTTP.

## Solution: Use ngrok (HTTPS Tunnel)

ngrok creates a secure HTTPS tunnel to your localhost, giving you a URL like `https://abc123.ngrok.io` that Cashfree can whitelist.

### Step 1: Install ngrok

```bash
# macOS (using Homebrew)
brew install ngrok

# Or download from: https://ngrok.com/download
```

### Step 2: Start Your Local Server

```bash
# Terminal 1: Start backend
./start-dev.sh

# Terminal 2: Start frontend
npm run dev
```

### Step 3: Create HTTPS Tunnel

```bash
# Terminal 3: Start ngrok tunnel to port 8080
ngrok http 8080
```

This will give you output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### Step 4: Whitelist ngrok URL in Cashfree

1. Go to: https://merchant.cashfree.com/developers/whitelisting
2. Click "Add New"
3. Enter your ngrok HTTPS URL: `https://abc123.ngrok-free.app`
4. Click "Proceed" and complete the whitelisting

### Step 5: Update Code to Use ngrok URL

Update the returnUrl in your code to use the ngrok URL:

**Option A: Set Environment Variable (Recommended)**
```bash
# Add to .env file
NGROK_URL=https://abc123.ngrok-free.app
```

Then update `server/routes/payment.ts` to use it:
```typescript
returnUrl: `${process.env.NGROK_URL || 'http://localhost:8080'}/payment/callback?orderId=${orderId}`,
```

**Option B: Update Frontend PaywallSheet**
Update `client/src/components/paywall/PaywallSheet.tsx`:
```typescript
returnUrl: `${process.env.VITE_NGROK_URL || window.location.origin}/payment/callback?orderId=${orderData.order_id}`,
```

### Step 6: Restart and Test

1. Restart backend: `./start-dev.sh`
2. Refresh frontend
3. Try payment flow - it should now work!

## Important Notes

⚠️ **ngrok URLs change each time** (unless you have a paid plan with fixed domain)

- Free ngrok: URL changes on restart → need to re-whitelist
- Paid ngrok: Can set fixed domain → whitelist once

⚠️ **Alternative: Use Production Domain**

If you have a production domain already whitelisted (like `https://riya-ai.site`), you can use that for testing by updating the returnUrl to point to your production domain's callback endpoint.

## Quick Setup Script

I can create a script to automate this. Would you like me to:
1. Create a script that starts ngrok and updates the returnUrl automatically?
2. Or help you set up a fixed domain solution?


