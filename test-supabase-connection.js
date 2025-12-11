#!/usr/bin/env node
// Quick script to test Supabase connection

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file!');
  console.error('\nRequired variables:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nGet them from: https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/settings/api\n');
  process.exit(1);
}

console.log('✅ SUPABASE_URL:', supabaseUrl);
console.log('✅ SUPABASE_SERVICE_ROLE_KEY:', supabaseKey.substring(0, 20) + '...');

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test connection by querying users table
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .limit(1);
  
  if (error) {
    console.error('\n❌ Connection failed:', error.message);
    if (error.message.includes('Invalid API key')) {
      console.error('\n💡 Your SUPABASE_SERVICE_ROLE_KEY is incorrect.');
      console.error('   Make sure you copied the "Service Role Secret" (not the anon key)');
    }
    process.exit(1);
  }
  
  console.log('\n✅ Supabase connection successful!');
  console.log('✅ Database is accessible');
  console.log('✅ Ready for payments and user upgrades testing\n');
  
} catch (err) {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
}

