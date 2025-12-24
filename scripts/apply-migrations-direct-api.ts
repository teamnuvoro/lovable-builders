/**
 * Apply Version 2 Migrations via Supabase REST API Direct Call
 * 
 * Attempts to execute SQL directly via Supabase's REST API endpoint
 */

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

async function executeSQLDirect(sql: string): Promise<boolean> {
  try {
    // Supabase doesn't expose a direct SQL execution endpoint via REST API
    // We need to use the Management API or Supabase CLI
    // For now, we'll use a workaround: create a function that executes SQL
    
    console.log('⚠️  Direct SQL execution via REST API is not available.');
    console.log('   Supabase requires SQL to be executed via:');
    console.log('   1. Supabase Dashboard SQL Editor (recommended)');
    console.log('   2. Supabase CLI: supabase db push');
    console.log('   3. psql connection string\n');
    
    return false;
  } catch (error: any) {
    console.error('Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Applying Version 2 Migrations...\n');

  const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20250113_v2_all_migrations_combined.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  console.log('✅ Migration file loaded\n');
  console.log('📋 Since Supabase REST API cannot execute DDL directly,');
  console.log('   please run the migration in Supabase SQL Editor:\n');
  console.log('   1. Go to: https://supabase.com/dashboard');
  console.log('   2. Select your project');
  console.log('   3. Go to SQL Editor');
  console.log('   4. Copy/paste the contents of:');
  console.log(`      ${migrationPath}`);
  console.log('   5. Click "Run"\n');

  // Verify .env was updated
  console.log('🔍 Verifying environment variables...\n');
  
  const requiredVars = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'SARVAM_API_KEY',
  ];

  let allPresent = true;
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is missing`);
      allPresent = false;
    }
  }

  if (allPresent) {
    console.log('\n✅ All required environment variables are set!\n');
  } else {
    console.log('\n⚠️  Some environment variables are missing. Please check your .env file.\n');
  }
}

main().catch(console.error);

