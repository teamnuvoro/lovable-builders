# Apply Dodo Payments Migration

**Issue:** `subscriptions` table is missing `dodo_order_id` column

**Error:** `Could not find the 'dodo_order_id' column of 'subscriptions' in the schema cache`

---

## Quick Fix: Run This SQL

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/sql/new
   ```

2. **Copy and paste this SQL:**

```sql
-- Step 1: Make cashfree_order_id nullable (if it has NOT NULL constraint)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'cashfree_order_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE subscriptions 
        ALTER COLUMN cashfree_order_id DROP NOT NULL;
        
        RAISE NOTICE 'Made cashfree_order_id nullable';
    END IF;
END $$;

-- Step 2: Add dodo_order_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'dodo_order_id'
    ) THEN
        ALTER TABLE subscriptions 
        ADD COLUMN dodo_order_id TEXT;
        
        RAISE NOTICE 'Added dodo_order_id column to subscriptions table';
    ELSE
        RAISE NOTICE 'dodo_order_id column already exists in subscriptions table';
    END IF;
END $$;

-- Step 3: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_dodo_order_id 
ON subscriptions(dodo_order_id) 
WHERE dodo_order_id IS NOT NULL;
```

3. **Click "Run"**

### Option 2: Using Migration File

The migration file is already created at:
```
supabase/migrations/20250122_add_dodo_order_id.sql
```

You can copy its contents and run in Supabase SQL Editor.

---

## Verify Migration

After running, verify the column exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name = 'dodo_order_id';
```

Should return:
```
column_name    | data_type
---------------|----------
dodo_order_id  | text
```

---

## After Migration

1. ✅ Restart your backend server
2. ✅ Test payment flow again
3. ✅ Should work now!

---

**Migration File:** `supabase/migrations/20250122_add_dodo_order_id.sql`
