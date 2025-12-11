#!/usr/bin/env tsx
// Script to set a user to free plan by phone number

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xgraxcgavqeyqfwimbwt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const phoneNumber = process.argv[2] || '8828447880';

async function setUserToFree() {
  console.log('🔄 Setting user to free plan...');
  console.log(`Phone Number: ${phoneNumber}`);
  console.log('');

  try {
    // Find user by phone number
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id, name, email, phone_number, premium_user, subscription_plan')
      .eq('phone_number', phoneNumber)
      .limit(1);

    if (findError) {
      console.error('❌ Error finding user:', findError);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.error(`❌ No user found with phone number: ${phoneNumber}`);
      process.exit(1);
    }

    const user = users[0];
    console.log('👤 Found user:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Current Premium: ${user.premium_user ? '✅ YES' : '❌ NO'}`);
    console.log(`   Current Plan: ${user.subscription_plan || 'None'}`);
    console.log('');

    // Update user to free plan
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        premium_user: false,
        subscription_plan: null,
        subscription_expiry: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      process.exit(1);
    }

    console.log('✅ User updated to free plan:');
    console.log(`   Premium: ${updatedUser.premium_user ? '✅ YES' : '❌ NO'}`);
    console.log(`   Subscription Plan: ${updatedUser.subscription_plan || 'None'}`);
    console.log('');

    // Cancel any active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'active')
      .select();

    if (subError) {
      console.warn('⚠️  Warning: Could not update subscriptions:', subError.message);
    } else if (subscriptions && subscriptions.length > 0) {
      console.log(`✅ Cancelled ${subscriptions.length} active subscription(s)`);
    } else {
      console.log('ℹ️  No active subscriptions to cancel');
    }

    // Reset message count (optional - uncomment if you want to reset)
    // const { error: usageError } = await supabase
    //   .from('usage_stats')
    //   .update({
    //     total_messages: 0,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('user_id', user.id);

    // if (usageError) {
    //   console.warn('⚠️  Could not reset message count:', usageError.message);
    // } else {
    //   console.log('✅ Reset message count to 0');
    // }

    console.log('');
    console.log('🎉 User is now on free plan and ready for payment testing!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Go to the app and login with this phone number');
    console.log('   2. Send messages until you hit the 20 message limit');
    console.log('   3. Try to upgrade and complete payment');
    console.log('   4. Check if user gets upgraded automatically');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setUserToFree();

