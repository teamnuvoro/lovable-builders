# Dodo Payments - Minimum Amount Error Fix

## Error
```
Failed to submit form: Minimum amount of 1.00 USD is required to process payment
```

## Problem
Dodo Payments has a **minimum transaction amount of $1.00 USD** in live mode. Your current prices:
- Daily Plan: ₹29 ≈ $0.35 USD ❌ (Below minimum)
- Weekly Plan: ₹49 ≈ $0.59 USD ❌ (Below minimum)

## Solutions

### Option 1: Increase Product Prices (Recommended)
Update your product prices in Dodo Dashboard to meet the $1 USD minimum:

**Current Exchange Rate:** ~₹83 = $1 USD

**New Prices:**
- Daily Plan: **₹100** (≈ $1.20 USD) ✅
- Weekly Plan: **₹150** (≈ $1.80 USD) ✅

**Steps:**
1. Go to Dodo Dashboard → Products (Live Mode)
2. Edit "Daily Premium Plan"
3. Change price from ₹29 to ₹100
4. Save
5. Edit "Weekly Premium Plan"
6. Change price from ₹49 to ₹150
7. Save
8. Update your app's plan config in `server/config.ts`:

```typescript
export function getDodoPlanConfig() {
  return {
    currency: "INR",
    plans: {
      daily: 100,  // Updated from 29
      weekly: 150, // Updated from 49
    },
  };
}
```

9. Restart backend server

### Option 2: Check Product Configuration
Verify products in Dodo Dashboard are configured correctly:
- Currency should be **INR** (not USD)
- Prices should match what you're sending
- Products should be in **Live Mode** (not Test Mode)

### Option 3: Contact Dodo Support
If you need to keep lower prices, contact Dodo Payments support to:
- Request a lower minimum amount
- Check if there's a way to configure minimums per currency
- Verify if INR has different minimum requirements

## Verification

After updating prices:
1. Restart backend server
2. Try payment flow again
3. Should work if prices meet $1 USD minimum

## Note on Test Mode

Test mode might have different minimums or no minimums, which is why it worked in test mode but not in live mode.

---

**Action Required:** Update product prices in Dodo Dashboard to meet $1 USD minimum, or contact Dodo support for lower minimums.
