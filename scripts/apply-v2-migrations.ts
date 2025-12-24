/**
 * Apply Version 2 Database Migrations
 * 
 * This script applies all Version 2 migrations to Supabase:
 * 1. Razorpay payment migration
 * 2. WhatsApp reminders migration
 * 3. Sarvam call ID migration
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applyMigration(filename: string): Promise<boolean> {
  try {
    console.log(`\n📄 Applying migration: ${filename}...`);
    
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', filename);
    const sql = readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    for (const statement of statements) {
      if (statement.trim().length === 0) continue;
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        // Try direct query if RPC doesn't work
        const { error: directError } = await supabase
          .from('_migrations')
          .select('*')
          .limit(1); // Just test connection
        
        if (directError) {
          console.error(`❌ Error executing migration: ${error.message}`);
          return false;
        }
        
        // If connection works, try executing via raw SQL
        console.log(`⚠️  RPC not available, trying alternative method...`);
        // Note: Supabase doesn't expose raw SQL execution via JS client
        // User will need to run these in Supabase SQL Editor
        console.log(`   Please run this migration manually in Supabase SQL Editor`);
        return false;
      }
    }
    
    console.log(`✅ Migration applied: ${filename}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error applying ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Version 2 Migration Application...\n');
  console.log('Note: If automatic execution fails, run these migrations manually in Supabase SQL Editor\n');
  
  const migrations = [
    '20250113_payment_razorpay_migration.sql',
    '20250113_whatsapp_reminders.sql',
    '20250113_add_sarvam_call_id.sql'
  ];
  
  let successCount = 0;
  
  for (const migration of migrations) {
    const success = await applyMigration(migration);
    if (success) {
      successCount++;
    } else {
      console.log(`\n⚠️  Migration ${migration} needs to be run manually in Supabase SQL Editor`);
      console.log(`   File location: supabase/migrations/${migration}\n`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  if (successCount === migrations.length) {
    console.log('✅ All migrations applied successfully!');
  } else {
    console.log(`⚠️  ${successCount}/${migrations.length} migrations applied automatically`);
    console.log('   Please run the remaining migrations manually in Supabase SQL Editor');
  }
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);

