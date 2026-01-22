#!/usr/bin/env tsx
// Clear all subscriptions for a user to force free status

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xgraxcgavqeyqfwimbwt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get user ID from command line or use default
const userId = process.argv[2] || 'f9576300-b0b0-4f33-b877-d0dca957590e';

async function clearSubscriptions() {
  console.log('🔄 Clearing all subscriptions for user...');
  console.log(`User ID: ${userId}`);
  console.log('');

  try {
    // 1. Get all subscriptions for this user
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subError) {
      console.error('❌ Error fetching subscriptions:', subError);
      process.exit(1);
    }

    console.log(`Found ${subscriptions?.length || 0} subscription(s)`);
    
    if (subscriptions && subscriptions.length > 0) {
      // 2. Mark all subscriptions as expired
      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'expired', 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .select();

      if (updateError) {
        console.error('❌ Error updating subscriptions:', updateError);
        process.exit(1);
      }

      console.log(`✅ Marked ${updated?.length || 0} subscription(s) as expired`);
      subscriptions.forEach(sub => {
        console.log(`   - Subscription ${sub.id}: ${sub.plan_type} (order: ${sub.cashfree_order_id})`);
      });
    }

    // 3. Update user to free
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

    console.log('');
    console.log('✅ User set to FREE:');
    console.log(`   Premium: ${user.premium_user}`);
    console.log(`   Plan: ${user.subscription_plan || 'None'}`);
    console.log('');
    console.log('🔄 Please refresh your browser to see the changes');

  } catch (error: any) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearSubscriptions();
