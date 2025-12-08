const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using Anon, but might need Service Role if RLS blocks
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Try to use service role if available

// Use Service Role if possible for admin tasks
const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

const userId = "2fca5118-c5fd-4bd7-87e2-4f3b7f208153";

async function fixUser() {
  console.log("🛠️ ATTEMPTING TO FIX MISSING USER ROW...");

  // 1. Try to Insert/Upsert the User Row
  const { error: insertError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: "user@example.com", // Placeholder
      name: "Fixed User",
      premium_user: false,
      created_at: new Date().toISOString()
    })
    .select();

  if (insertError) {
    console.error("❌ Failed to create user row:", insertError.message);
    if (insertError.message.includes("permission denied")) {
        console.error("   Reason: RLS is blocking insertion. You MUST run the SQL migration in Dashboard.");
    }
  } else {
    console.log("✅ SUCCESS: User row created/verified.");
    
    // 2. Now try to initialize Usage Stats
    const { error: usageError } = await supabase
        .from('usage_stats')
        .upsert({
            user_id: userId,
            daily_messages_count: 21, // Force it to 21 to TRIGGER PAYWALL immediately
            total_messages: 21
        });

    if (usageError) {
        console.error("❌ Failed to init usage stats:", usageError.message);
    } else {
        console.log("✅ SUCCESS: Usage stats initialized to 21 (Limit Reached).");
    }
  }
}

fixUser();
