/**
 * Apply Version 2 Migrations via Supabase REST API
 * 
 * This script attempts to apply migrations using Supabase's REST API.
 * If that fails, it provides instructions for manual application.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applyMigrationsViaAPI() {
  console.log('🚀 Applying Version 2 Migrations via Supabase API...\n');

  // Test connection first
  console.log('🔍 Testing Supabase connection...');
  const { data: testData, error: testError } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (testError) {
    console.error('❌ Supabase connection failed:', testError.message);
    console.log('\n⚠️  Please check your credentials and try again.\n');
    return false;
  }

  console.log('✅ Supabase connection successful!\n');

  // Read combined migration file
  const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20250113_v2_all_migrations_combined.sql');
  let sql: string;
  
  try {
    sql = readFileSync(migrationPath, 'utf-8');
    console.log('✅ Migration file loaded\n');
  } catch (error: any) {
    console.error('❌ Error reading migration file:', error.message);
    return false;
  }

  // Supabase JS client doesn't support raw SQL execution
  // We need to use the Management API or run via SQL Editor
  // For now, we'll provide clear instructions
  
  console.log('='.repeat(70));
  console.log('📋 MIGRATION INSTRUCTIONS');
  console.log('='.repeat(70));
  console.log('\nSupabase JS client cannot execute DDL statements directly.');
  console.log('Please apply migrations manually:\n');
  console.log('1. Open Supabase Dashboard:');
  console.log(`   https://supabase.com/dashboard/project/${SUPABASE_URL.split('//')[1].split('.')[0]}/sql/new\n`);
  console.log('2. Copy the contents of this file:');
  console.log(`   ${migrationPath}\n`);
  console.log('3. Paste into SQL Editor and click "Run"\n');
  console.log('='.repeat(70) + '\n');

  // Try to execute via pg_net or direct SQL if available
  // This is a fallback attempt
  try {
    // Some Supabase instances have exec_sql function
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sql 
    });

    if (!error) {
      console.log('✅ Migrations applied successfully via RPC!');
      return true;
    }
  } catch (rpcError) {
    // RPC not available, that's expected
  }

  return false;
}

async function main() {
  const success = await applyMigrationsViaAPI();
  
  if (!success) {
    console.log('📝 Manual migration required - see instructions above\n');
    console.log('💡 Quick access to combined migration file:');
    console.log('   supabase/migrations/20250113_v2_all_migrations_combined.sql\n');
  }
}

main().catch(console.error);

