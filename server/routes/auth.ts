import { Router, Request, Response } from 'express';
import { supabase, isSupabaseConfigured } from '../supabase';

const router = Router();

// Signup
router.post('/api/auth/signup', async (req: Request, res: Response) => {
    try {
        const { name, email, phoneNumber, gender } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        if (!isSupabaseConfigured) {
            // Return mock success for dev
            return res.json({
                id: 'dev-user-id',
                name,
                email,
                gender: gender || 'prefer_not_to_say',
                premium_user: false,
                created_at: new Date().toISOString()
            });
        }

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                name,
                email,
                phone_number: phoneNumber,
                gender: gender || 'prefer_not_to_say',
                persona: 'sweet_supportive',
                premium_user: false,
                locale: 'hi-IN',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('[POST /api/auth/signup] Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json(newUser);
    } catch (error: any) {
        console.error('[POST /api/auth/signup] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Email Login
router.post('/api/auth/email-login', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        if (!isSupabaseConfigured) {
            // Return mock success for dev
            return res.json({
                user: {
                    id: 'dev-user-id',
                    name: 'Dev User',
                    email,
                    gender: 'male',
                    premium_user: false,
                    persona: 'sweet_supportive'
                }
            });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error: any) {
        console.error('[POST /api/auth/email-login] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Handle /api/auth/login as an alias or error handler
router.all('/api/auth/login', async (req: Request, res: Response) => {
    if (req.method === 'POST') {
        // If it's a POST, try to handle it as email login if email is present
        if (req.body.email) {
            // Reuse email login logic
            try {
                const { email } = req.body;
                if (!isSupabaseConfigured) {
                    return res.json({
                        user: {
                            id: 'dev-user-id',
                            name: 'Dev User',
                            email,
                            gender: 'male',
                            premium_user: false,
                            persona: 'sweet_supportive'
                        }
                    });
                }
                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (error || !user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                return res.json({ user });
            } catch (error: any) {
                return res.status(500).json({ error: error.message });
            }
        }
        return res.status(400).json({ error: "Invalid login request" });
    }
    // If GET, return 404 but with a message
    res.status(404).json({ error: "Endpoint not found. Did you mean POST /api/auth/email-login?" });
});

export default router;
