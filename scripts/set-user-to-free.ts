#!/usr/bin/env tsx
// Script to set a user to free plan for testing payment upgrades

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xgraxcgavqeyqfwimbwt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const userId = 'c5c19cf0-dd24-4357-bf60-57b7d78c48e5';

async function setUserToFree() {
  console.log('🔄 Setting user to free plan...');
  console.log(`User ID: ${userId}`);
  console.log('');

  try {
    // Update user to free plan
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

    console.log('✅ User updated to free plan:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Premium: ${user.premium_user}`);
    console.log(`   Subscription Plan: ${user.subscription_plan || 'None'}`);
    console.log(`   Subscription Expiry: ${user.subscription_expiry || 'None'}`);
    console.log('');

    // Also clear any active subscriptions for this user
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active')
      .select();

    if (subError) {
      console.warn('⚠️  Warning: Could not update subscriptions:', subError.message);
    } else if (subscriptions && subscriptions.length > 0) {
      console.log(`✅ Cancelled ${subscriptions.length} active subscription(s)`);
    } else {
      console.log('ℹ️  No active subscriptions to cancel');
    }

    console.log('');
    console.log('🎉 User is now on free plan and ready for payment testing!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Go to the app and try to upgrade');
    console.log('   2. Complete a payment');
    console.log('   3. Check if user gets upgraded automatically');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setUserToFree();


