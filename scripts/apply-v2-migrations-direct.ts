/**
 * Apply Version 2 Database Migrations Directly
 * 
 * This script applies all Version 2 migrations to Supabase using the Supabase client.
 * It reads the migration files and executes them via SQL.
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
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function executeSQL(sql: string): Promise<boolean> {
  try {
    // Supabase JS client doesn't support raw SQL execution directly
    // We need to use the REST API or RPC functions
    // For now, we'll use a workaround by calling a function if it exists
    
    // Try using the REST API directly
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql_query: sql }),
    });

    if (response.ok) {
      return true;
    }

    // If RPC doesn't work, we'll need to execute via psql or Supabase CLI
    // For now, return false and provide manual instructions
    return false;
  } catch (error: any) {
    console.error('Error executing SQL:', error.message);
    return false;
  }
}

async function applyMigration(filename: string): Promise<boolean> {
  try {
    console.log(`\n📄 Reading migration: ${filename}...`);
    
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', filename);
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log(`   Executing migration: ${filename}...`);
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    // Try to execute via Supabase REST API
    // Note: This may not work for all DDL statements
    // The user should run these in Supabase SQL Editor for reliability
    
    console.log(`   ⚠️  Supabase JS client cannot execute DDL directly`);
    console.log(`   📝 Please run this migration manually in Supabase SQL Editor`);
    console.log(`   📁 File: supabase/migrations/${filename}\n`);
    
    return false; // Indicate manual execution needed
  } catch (error: any) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Version 2 Migration Application\n');
  console.log('='.repeat(60));
  console.log('NOTE: Supabase JS client cannot execute DDL statements directly');
  console.log('Please run the combined migration file in Supabase SQL Editor');
  console.log('='.repeat(60) + '\n');
  
  const migrations = [
    '20250113_payment_razorpay_migration.sql',
    '20250113_whatsapp_reminders.sql',
    '20250113_add_sarvam_call_id.sql'
  ];
  
  // Read all migrations and combine them
  const combinedSQL: string[] = [];
  
  for (const migration of migrations) {
    try {
      const migrationPath = join(process.cwd(), 'supabase', 'migrations', migration);
      const sql = readFileSync(migrationPath, 'utf-8');
      combinedSQL.push(`-- =====================================================`);
      combinedSQL.push(`-- MIGRATION: ${migration}`);
      combinedSQL.push(`-- =====================================================`);
      combinedSQL.push(sql);
      combinedSQL.push('');
    } catch (error: any) {
      console.error(`❌ Error reading ${migration}:`, error.message);
    }
  }
  
  // Write combined migration file
  const combinedPath = join(process.cwd(), 'supabase', 'migrations', '20250113_v2_all_migrations_combined.sql');
  require('fs').writeFileSync(combinedPath, combinedSQL.join('\n'));
  
  console.log('✅ Created combined migration file:');
  console.log(`   ${combinedPath}\n`);
  console.log('📋 Next Steps:');
  console.log('   1. Open Supabase Dashboard → SQL Editor');
  console.log('   2. Copy and paste the contents of the combined migration file');
  console.log('   3. Click "Run" to execute\n');
  
  // Test Supabase connection
  console.log('🔍 Testing Supabase connection...');
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .limit(1);
  
  if (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.log('\n⚠️  Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  } else {
    console.log('✅ Supabase connection successful!');
    console.log('✅ Ready to apply migrations manually\n');
  }
}

main().catch(console.error);

