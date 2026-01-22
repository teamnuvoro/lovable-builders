# How to Create Products in Dodo Payments Dashboard

**Error:** `422 Product pdt_default does not exist`

**Solution:** Create products in Dodo Dashboard and add product IDs to `.env`

---

## Step 1: Create Products in Dodo Dashboard

1. **Go to Dodo Dashboard:**
   - Navigate to **Products** section (left sidebar)

2. **Create Daily Plan Product:**
   - Click **"Create Product"** or **"Add Product"**
   - **Name:** `Daily Premium Plan` (or any name)
   - **Price:** `29` (in INR)
   - **Description:** `Daily premium access to Riya AI`
   - Click **"Save"** or **"Create"**
   - **Copy the Product ID** (starts with `pdt_`)

3. **Create Weekly Plan Product:**
   - Click **"Create Product"** again
   - **Name:** `Weekly Premium Plan` (or any name)
   - **Price:** `49` (in INR)
   - **Description:** `Weekly premium access to Riya AI`
   - Click **"Save"** or **"Create"**
   - **Copy the Product ID** (starts with `pdt_`)

---

## Step 2: Add Product IDs to `.env`

Add the product IDs you just copied:

```env
# Dodo Products (REQUIRED - get from Dodo Dashboard → Products)
DODO_PRODUCT_ID_DAILY=pdt_xxxxxxxxxxxxx  # Replace with your daily product ID
DODO_PRODUCT_ID_WEEKLY=pdt_yyyyyyyyyyyyy  # Replace with your weekly product ID
```

---

## Step 3: Restart Backend

After adding product IDs:

```bash
# Restart your backend server
npm run dev:server
```

---

## Verification

After adding product IDs, test payment flow:

1. Open paywall
2. Select a plan
3. Should create checkout session successfully
4. Should redirect to Dodo checkout page

---

## Common Issues

### "Product does not exist"
- **Cause:** Product ID is incorrect or product was deleted
- **Fix:** Verify product ID in Dodo Dashboard → Products

### "422 UnprocessableEntity"
- **Cause:** Product ID format is wrong
- **Fix:** Ensure product ID starts with `pdt_` and matches exactly from dashboard

### "Product ID not configured"
- **Cause:** Environment variable not set
- **Fix:** Add `DODO_PRODUCT_ID_DAILY` and `DODO_PRODUCT_ID_WEEKLY` to `.env`

---

**Important:** Products must be created in the same environment (test_mode or live_mode) as your API key.
