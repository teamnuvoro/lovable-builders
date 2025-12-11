#!/usr/bin/env tsx
/**
 * Script to check if a user was upgraded after payment
 * Usage: npx tsx scripts/check-payment-upgrade.ts <userId>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserUpgrade(userId: string) {
  console.log(`\n🔍 Checking upgrade status for user: ${userId}\n`);

  // Get user info
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, name, premium_user, subscription_plan, created_at')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    console.error('❌ User not found:', userError);
    return;
  }

  console.log('👤 User Info:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name || 'N/A'}`);
  console.log(`   Premium User: ${user.premium_user ? '✅ YES' : '❌ NO'}`);
  console.log(`   Subscription Plan: ${user.subscription_plan || 'N/A'}`);
  console.log('');

  // Get latest payment
  const { data: payments, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (paymentError) {
    console.error('❌ Error fetching payments:', paymentError);
  } else if (payments && payments.length > 0) {
    const payment = payments[0];
    console.log('💳 Latest Payment:');
    console.log(`   Order ID: ${payment.cashfree_order_id}`);
    console.log(`   Amount: ₹${payment.amount}`);
    console.log(`   Status: ${payment.status}`);
    console.log(`   Created: ${payment.created_at}`);
    console.log('');
  } else {
    console.log('💳 No payments found');
    console.log('');
  }

  // Get latest subscription
  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (subError) {
    console.error('❌ Error fetching subscriptions:', subError);
  } else if (subscriptions && subscriptions.length > 0) {
    const sub = subscriptions[0];
    console.log('📅 Latest Subscription:');
    console.log(`   Plan Type: ${sub.plan_type}`);
    console.log(`   Status: ${sub.status}`);
    console.log(`   Amount: ₹${sub.amount}`);
    console.log(`   Started: ${sub.started_at}`);
    console.log(`   Expires: ${sub.expires_at}`);
    console.log(`   Created: ${sub.created_at}`);
    console.log('');

    // Check if upgrade should have happened
    if (sub.status === 'active' && !user.premium_user) {
      console.log('⚠️  ISSUE DETECTED:');
      console.log('   Subscription is active but user is NOT marked as premium!');
      console.log('   The upgrade trigger may not have fired.');
      console.log('');
      console.log('🔧 Attempting manual upgrade...');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          premium_user: true,
          subscription_plan: sub.plan_type,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Failed to manually upgrade:', updateError);
      } else {
        console.log('✅ User manually upgraded to premium!');
      }
    } else if (sub.status === 'active' && user.premium_user) {
      console.log('✅ UPGRADE SUCCESSFUL!');
      console.log('   User is premium and subscription is active.');
    }
  } else {
    console.log('📅 No subscriptions found');
    console.log('');
  }

  console.log('\n' + '='.repeat(50));
}

// Get userId from command line or use default test user
const userId = process.argv[2] || 'c5c19cf0-dd24-4357-bf60-57b7d78c48e5';

checkUserUpgrade(userId).catch(console.error);

