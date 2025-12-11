#!/usr/bin/env tsx
// Script to reset message count for a user by phone number

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

async function resetMessageCount() {
  console.log('🔄 Resetting message count...');
  console.log(`Phone Number: ${phoneNumber}`);
  console.log('');

  try {
    // Find user by phone number
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id, name, email, phone_number')
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
    console.log('');

    // Reset message count
    const { data: usage, error: updateError } = await supabase
      .from('usage_stats')
      .upsert({
        user_id: user.id,
        total_messages: 0,
        daily_messages_count: 0,
        total_call_seconds: 0,
        last_daily_reset: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error resetting message count:', updateError);
      process.exit(1);
    }

    console.log('✅ Message count reset:');
    console.log(`   Total Messages: ${usage?.total_messages || 0}`);
    console.log(`   Daily Messages: ${usage?.daily_messages_count || 0}`);
    console.log('');
    console.log('🎉 User can now send 20 free messages again!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetMessageCount();

