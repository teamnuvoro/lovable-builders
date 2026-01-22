#!/usr/bin/env tsx
// Set ALL users to free plan and clear all subscriptions for testing

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xgraxcgavqeyqfwimbwt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAllUsersToFree() {
  console.log('🔄 Setting ALL users to FREE plan...');
  console.log('');

  try {
    // 1. Get all users with premium status
    const { data: premiumUsers, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, premium_user, subscription_plan')
      .eq('premium_user', true);

    if (usersError) {
      console.error('❌ Error fetching premium users:', usersError);
      process.exit(1);
    }

    console.log(`Found ${premiumUsers?.length || 0} premium user(s)`);
    console.log('');

    // 2. Set ALL users to free (not just premium ones, to be safe)
    const { data: allUsers, error: updateError } = await supabase
      .from('users')
      .update({
        premium_user: false,
        subscription_plan: null,
        subscription_expiry: null,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Don't update system users
      .select('id, name, email');

    if (updateError) {
      console.error('❌ Error updating users:', updateError);
      process.exit(1);
    }

    console.log(`✅ Set ${allUsers?.length || 0} user(s) to FREE plan`);
    if (premiumUsers && premiumUsers.length > 0) {
      console.log('   Previously premium users:');
      premiumUsers.forEach(user => {
        console.log(`   - ${user.name || user.email || user.id} (was: ${user.subscription_plan || 'premium'})`);
      });
    }
    console.log('');

    // 3. Mark ALL active subscriptions as expired
    const { data: activeSubs, error: subsError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan_type, status, cashfree_order_id')
      .eq('status', 'active');

    if (subsError) {
      console.error('❌ Error fetching subscriptions:', subsError);
      process.exit(1);
    }

    console.log(`Found ${activeSubs?.length || 0} active subscription(s)`);

    if (activeSubs && activeSubs.length > 0) {
      const { data: expiredSubs, error: expireError } = await supabase
        .from('subscriptions')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('status', 'active')
        .select('id, plan_type, cashfree_order_id');

      if (expireError) {
        console.error('❌ Error expiring subscriptions:', expireError);
        process.exit(1);
      }

      console.log(`✅ Marked ${expiredSubs?.length || 0} subscription(s) as expired`);
      activeSubs.forEach(sub => {
        const orderId = sub.cashfree_order_id || 'N/A';
        const isMock = orderId.startsWith('mock_order_') ? ' (MOCK)' : '';
        console.log(`   - Subscription ${sub.id}: ${sub.plan_type}${isMock}`);
      });
    } else {
      console.log('✅ No active subscriptions to expire');
    }

    console.log('');
    console.log('✅ All users are now on FREE plan');
    console.log('✅ All subscriptions are expired');
    console.log('');
    console.log('🔄 Ready for testing payment flow!');
    console.log('   - Users will see "FREE PLAN" badge');
    console.log('   - Paywall will appear after 20 messages or 2 minutes of calls');
    console.log('   - After payment, users will be upgraded to premium');

  } catch (error: any) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setAllUsersToFree();
