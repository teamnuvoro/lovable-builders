const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const userId = "2fca5118-c5fd-4bd7-87e2-4f3b7f208153"; // Your User ID from logs

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Stats: Missing ENV vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log("🔍 STARTING PAYWALL DIAGNOSTICS...");
  console.log("User ID:", userId);

  // 1. Check User Profile for Plan Columns
  console.log("\n1️⃣ Checking User Table Columns...");
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, subscription_expiry, subscription_plan')
    .eq('id', userId)
    .maybeSingle();

  if (userError) {
    console.error("❌ FAILED to read user profile:", userError.message);
    console.error("   (Possible Cause: RLS Policy blocking access)");
  } else if (!user) {
    console.warn("⚠️ User not found (Row missing or RLS hiding it)");
  } else {
    console.log("✅ User found:", user);
    console.log("   Expiry:", user.subscription_expiry || "NULL (Free)");
  }

  // 2. Check Usage Stats for Message Count
  console.log("\n2️⃣ Checking Usage Stats...");
  const { data: usage, error: usageError } = await supabase
    .from('usage_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (usageError) {
    console.error("❌ FAILED to read usage stats:", usageError.message);
  } else if (!usage) {
    console.warn("⚠️ Usage stats row missing for user.");
  } else {
    console.log("✅ Usage Stats found:", usage);
    console.log("   Current Count:", usage.daily_messages_count);
  }

  // 3. Simulate Increment (Write Test)
  console.log("\n3️⃣ Simulating Counter Increment...");
  const { error: updateError } = await supabase
    .from('usage_stats')
    .upsert({ user_id: userId, daily_messages_count: 999 }) // Try to set to high number
    .select();

  if (updateError) {
    console.error("❌ WRITE FAILED:", updateError.message);
    console.error("   CRITICAL: Backend cannot update count -> Paywall will NEVER trigger.");
  } else {
    console.log("✅ WRITE SUCCESS: Counter updated.");
  }

  console.log("\n🏁 DIAGNOSTICS COMPLETE.");
}

diagnose();
