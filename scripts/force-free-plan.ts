#!/usr/bin/env tsx
// Force user to free plan and clear all premium data

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xgraxcgavqeyqfwimbwt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const userId = 'c5c19cf0-dd24-4357-bf60-57b7d78c48e5';

async function forceFreePlan() {
  console.log('🔄 Forcing user to FREE plan...');
  console.log(`User ID: ${userId}`);
  console.log('');

  try {
    // 1. Update user to free
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({
        premium_user: false,
        subscription_plan: null,
        subscription_expiry: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (userError) {
      console.error('❌ Error updating user:', userError);
      process.exit(1);
    }

    console.log('✅ User set to FREE:');
    console.log(`   Premium: ${user.premium_user}`);
    console.log(`   Plan: ${user.subscription_plan || 'None'}`);
    console.log('');

    // 2. Cancel all active subscriptions
    const { data: cancelledSubs } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('status', 'active')
      .select();

    if (cancelledSubs && cancelledSubs.length > 0) {
      console.log(`✅ Cancelled ${cancelledSubs.length} active subscription(s)`);
    }

    // 3. Clear usage stats (optional - for clean testing)
    const { error: usageError } = await supabase
      .from('usage_stats')
      .update({ total_messages: 0, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (!usageError) {
      console.log('✅ Reset message count to 0');
    }

    console.log('');
    console.log('🎉 User is now on FREE plan!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Logout and login again in the app (to refresh user data)');
    console.log('   2. Or clear browser localStorage and refresh');
    console.log('   3. You should see FREE plan in the UI');
    console.log('   4. Try to upgrade and test payment flow');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

forceFreePlan();


