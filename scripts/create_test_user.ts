import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config(); // Load env vars

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
    const testUserId = '00000000-0000-0000-0000-000000000001';

    // Check if exists
    const { data: existing } = await supabase.from('users').select('id').eq('id', testUserId).single();
    if (existing) {
        console.log("Test User already exists:", existing.id);
        return existing.id;
    }

    const { data: newUser, error } = await supabase.from('users').insert({
        id: testUserId,
        name: 'Dev User',
        email: 'dev@example.com',
        phone_number: '+910000000000',
        persona: 'sweet_supportive',
        premium_user: false,
        onboarding_complete: true
    }).select().single();

    if (error) {
        console.error("Error creating user:", error);
    } else {
        console.log("Created Test User:", newUser.id);
    }
}

createTestUser();
