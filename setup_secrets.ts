
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing locally.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSecrets() {
    console.log('1. Creating app_secrets table...');

    // We can't run DDL (CREATE TABLE) directly via JS client easily without SQL editor or rpc.
    // So we will assume the user can run this SQL, or we try to use a workaround if possible.
    // Actually, for this specific task, it's better if I give you the SQL to run in Supabase Dashboard.

    console.log('\n--- ACTION REQUIRED ---');
    console.log('Please go to Supabase Dashboard > SQL Editor and run this command:');
    console.log(`
    CREATE TABLE IF NOT EXISTS app_secrets (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;
    -- Only service role can read/write
    CREATE POLICY "Service role only" ON app_secrets TO service_role USING (true) WITH CHECK (true);
  `);
    console.log('-----------------------\n');

    console.log('2. Uploading secrets from .env to app_secrets table...');

    const secretsToUpload = [
        'GROQ_API_KEY',
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_PHONE_NUMBER',
        'VAPI_PUBLIC_KEY',
        'VAPI_PRIVATE_KEY',
        'VITE_VAPI_PUBLIC_KEY',
        'CASHFREE_APP_ID',
        'CASHFREE_SECRET_KEY',
        'CASHFREE_MODE',
        'CASHFREE_ENV',
        'ASSEMBLYAI_API_KEY',
        'VITE_AMPLITUDE_API_KEY',
        'AMPLITUDE_SECRET_KEY',
        'DEEPGRAM_API_KEY',
        'GEMINI_API_KEY'
    ];

    const upserts = [];
    for (const key of secretsToUpload) {
        const value = process.env[key];
        if (value) {
            upserts.push({ key, value });
        } else {
            console.warn(`Skipping ${key} (not found in local .env)`);
        }
    }

    if (upserts.length > 0) {
        const { error } = await supabase
            .from('app_secrets')
            .upsert(upserts);

        if (error) {
            console.error('Failed to upload secrets:', error);
        } else {
            console.log(`Successfully uploaded ${upserts.length} secrets to Supabase!`);
        }
    } else {
        console.log('No secrets found to upload.');
    }
}

setupSecrets();
