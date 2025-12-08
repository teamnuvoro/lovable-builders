import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkSchema() {
    console.log("--- usage_stats ---");
    const { data: usage, error: uErr } = await supabase.from('usage_stats').select('*').limit(1);
    if (uErr) {
        // Table might not exist, checking error code
        console.error("Usage Error:", uErr.code, uErr.message);
    } else {
        console.log(usage && usage[0] ? Object.keys(usage[0]) : "Empty Table (usage_stats)");
    }

    console.log("--- payments ---");
    const { data: pay, error: pErr } = await supabase.from('payments').select('*').limit(1);
    if (pErr) console.error("Payments Error:", pErr);
    else console.log(pay && pay[0] ? Object.keys(pay[0]) : "Empty Table (payments)");
}
checkSchema();
