import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAllUsersToFree() {
  console.log('🔄 Setting all users to free plan...\n');

  try {
    // Set all users to free plan
    const { data, error } = await supabase
      .from('users')
      .update({
        premium_user: false,
        subscription_plan: null,
        subscription_expiry: null,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all users

    if (error) {
      console.error('❌ Error setting users to free:', error);
      return;
    }

    console.log('✅ All users set to free plan!');
    console.log(`   Updated ${data?.length || 'all'} users\n`);

    // Count users with successful payments
    const { data: paidUsers, error: paymentError } = await supabase
      .from('payments')
      .select('user_id')
      .eq('status', 'success')
      .not('user_id', 'is', null);

    if (paymentError) {
      console.error('⚠️  Error checking payments:', paymentError);
    } else {
      const uniquePaidUsers = new Set(paidUsers?.map(p => p.user_id) || []);
      console.log(`📊 Users with successful payments: ${uniquePaidUsers.size}`);
      console.log(`   These users will have access to chats based on payment records\n`);
    }

    console.log('✅ Done! Premium access is now based on payments table.');
    console.log('   Users with status="success" in payments table can use chats.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setAllUsersToFree();

