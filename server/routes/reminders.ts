import { Router, Request, Response } from 'express';
import { supabase, isSupabaseConfigured } from '../supabase';
import {
  sendDailyCheckinReminder,
  sendSubscriptionExpiryReminder,
  sendInactiveUserReminder,
  createReminderRecord
} from '../services/reminder-service';
import {
  dailyCheckinTemplate,
  subscriptionExpiryTemplate,
  inactiveUserTemplate
} from '../templates/whatsapp-reminders';

const router = Router();

// =====================================================
// POST /api/reminders/schedule
// Manually schedule a reminder (admin/testing)
// =====================================================
router.post('/api/reminders/schedule', async (req: Request, res: Response) => {
  try {
    const { userId, reminderType, scheduledAt } = req.body;

    if (!userId || !reminderType || !scheduledAt) {
      return res.status(400).json({ error: 'Missing required fields: userId, reminderType, scheduledAt' });
    }

    if (!['daily_checkin', 'subscription_expiry', 'inactive_user'].includes(reminderType)) {
      return res.status(400).json({ error: 'Invalid reminder type' });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, subscription_tier, subscription_end_time, last_active_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate message based on type
    let message = '';
    switch (reminderType) {
      case 'daily_checkin':
        message = dailyCheckinTemplate({ userName: user.name || undefined });
        break;
      case 'subscription_expiry':
        if (user.subscription_end_time) {
          const expiryDate = new Date(user.subscription_end_time);
          const now = new Date();
          const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          message = subscriptionExpiryTemplate({
            userName: user.name || undefined,
            daysLeft: Math.max(0, daysLeft),
            planType: user.subscription_tier as 'daily' | 'weekly'
          });
        }
        break;
      case 'inactive_user':
        let daysInactive = 3;
        if (user.last_active_at) {
          const lastActive = new Date(user.last_active_at);
          const now = new Date();
          daysInactive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        }
        message = inactiveUserTemplate({
          userName: user.name || undefined,
          daysInactive
        });
        break;
    }

    if (!message) {
      return res.status(400).json({ error: 'Could not generate message for this reminder type' });
    }

    // Create reminder record
    const reminderId = await createReminderRecord(
      userId,
      reminderType,
      new Date(scheduledAt),
      message
    );

    if (!reminderId) {
      return res.status(500).json({ error: 'Failed to create reminder record' });
    }

    return res.json({
      success: true,
      reminder_id: reminderId,
      message: 'Reminder scheduled successfully'
    });

  } catch (error: any) {
    console.error('[Reminders API] Error scheduling reminder:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// =====================================================
// GET /api/reminders/user/:userId
// Get user's reminder history
// =====================================================
router.get('/api/reminders/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data: reminders, error } = await supabase
      .from('whatsapp_reminders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Reminders API] Error fetching reminders:', error);
      return res.status(500).json({ error: 'Failed to fetch reminders' });
    }

    return res.json({
      success: true,
      reminders: reminders || []
    });

  } catch (error: any) {
    console.error('[Reminders API] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// =====================================================
// POST /api/reminders/send-now
// Send reminder immediately (admin/testing)
// =====================================================
router.post('/api/reminders/send-now', async (req: Request, res: Response) => {
  try {
    const { userId, reminderType } = req.body;

    if (!userId || !reminderType) {
      return res.status(400).json({ error: 'Missing required fields: userId, reminderType' });
    }

    if (!['daily_checkin', 'subscription_expiry', 'inactive_user'].includes(reminderType)) {
      return res.status(400).json({ error: 'Invalid reminder type' });
    }

    let success = false;

    switch (reminderType) {
      case 'daily_checkin':
        success = await sendDailyCheckinReminder(userId);
        break;
      case 'subscription_expiry':
        success = await sendSubscriptionExpiryReminder(userId);
        break;
      case 'inactive_user':
        success = await sendInactiveUserReminder(userId);
        break;
    }

    if (success) {
      return res.json({
        success: true,
        message: 'Reminder sent successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to send reminder'
      });
    }

  } catch (error: any) {
    console.error('[Reminders API] Error sending reminder:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

