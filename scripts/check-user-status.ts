#!/usr/bin/env tsx
// Quick script to check user premium status

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

async function checkStatus() {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, premium_user, subscription_plan, subscription_expiry, updated_at')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log('📊 User Status:');
  console.log(`   Name: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Premium: ${user.premium_user ? '✅ YES' : '❌ NO'}`);
  console.log(`   Plan: ${user.subscription_plan || 'None'}`);
  console.log(`   Expiry: ${user.subscription_expiry || 'None'}`);
  console.log(`   Last Updated: ${user.updated_at}`);
  console.log('');

  // Check subscriptions
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('id, status, plan_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (subs && subs.length > 0) {
    console.log('📋 Recent Subscriptions:');
    subs.forEach((sub, i) => {
      console.log(`   ${i + 1}. ${sub.plan_type} - ${sub.status} (${sub.created_at})`);
    });
  }

  // Check payments
  const { data: payments } = await supabase
    .from('payments')
    .select('id, status, plan_type, amount, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (payments && payments.length > 0) {
    console.log('');
    console.log('💳 Recent Payments:');
    payments.forEach((pay, i) => {
      console.log(`   ${i + 1}. ${pay.plan_type} - ${pay.status} - ₹${pay.amount} (${pay.created_at})`);
    });
  }
}

checkStatus();


