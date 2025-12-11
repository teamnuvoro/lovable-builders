# ✅ Local Development Setup - Fixed

## Issue Fixed
The Vite dev server was looking for `/src/main.tsx` but the file is at `client/src/main.tsx`.

## Solution Applied
1. **Vite Root**: Set to `client` directory (in `server/vite.ts`)
2. **index.html**: Updated to reference `/src/main.tsx` (relative to client root)
3. **Template Transformation**: Fixed path replacement in `server/vite.ts`

## How to Run Locally

### Option 1: Using tsx (Recommended)
```bash
NODE_ENV=development tsx server/index.ts
```

### Option 2: Using npm script
```bash
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000 (or port shown in terminal)
- **Backend API**: http://localhost:3000/api/health

## Payment Gateway Testing

To test payment gateway locally:

1. **Set up `.env.local`** with Cashfree TEST credentials:
```bash
CASHFREE_APP_ID=your_test_app_id
CASHFREE_SECRET_KEY=your_test_secret_key
CASHFREE_ENV=TEST
```

2. **Remove hardcoded credentials** from `server/routes/payment.ts` (lines 73-76) for local testing

3. **Test payment flow**:
   - Navigate to http://localhost:3000
   - Login/Signup
   - Try to upgrade to premium
   - Use Cashfree test payment methods

## Important Notes
- **NO GITHUB PUSH**: Changes made for payment gateway fixes will NOT be pushed unless you explicitly ask
- All payment-related changes are local-only for now
- Test thoroughly before deploying

