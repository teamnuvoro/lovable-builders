// Script to clear test users from Supabase
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function clearTestUsers() {
  if (!process.env.DATABASE_URL && !process.env.SUPABASE_URL) {
    console.log('❌ No database configured. Skipping...');
    return;
  }

  // Use Supabase connection if available
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://postgres:${process.env.SUPABASE_PASSWORD}@db.${process.env.SUPABASE_URL?.split('//')[1]?.split('.')[0]}.supabase.co:5432/postgres`;

  const pool = new Pool({ connectionString });

  try {
    console.log('🗑️  Clearing test users...');
    
    // Delete all users (use with caution!)
    const result = await pool.query('DELETE FROM users WHERE email LIKE $1 OR email LIKE $2', ['%@example.com', '%test%']);
    
    console.log(`✅ Deleted ${result.rowCount} test users`);
    console.log('✅ Database cleared! You can now signup again.');
    
  } catch (error) {
    console.error('❌ Error clearing users:', error.message);
    console.log('\n💡 Alternative: Delete users manually from Supabase dashboard');
    console.log('   Go to: https://supabase.com/dashboard');
    console.log('   Table Editor > users > Delete rows');
  } finally {
    await pool.end();
  }
}

clearTestUsers();

