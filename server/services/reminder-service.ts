import { supabase, isSupabaseConfigured } from '../supabase';
import { twilioService } from './twilio';
import {
  dailyCheckinTemplate,
  subscriptionExpiryTemplate,
  inactiveUserTemplate,
  getReminderTemplate
} from '../templates/whatsapp-reminders';

export interface ReminderData {
  userName?: string;
  daysLeft?: number;
  planType?: 'daily' | 'weekly';
  daysInactive?: number;
}

/**
 * Send daily check-in reminder to a user
 */
export async function sendDailyCheckinReminder(userId: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured) {
      console.warn('[Reminder Service] Database not configured');
      return false;
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, phone_number, whatsapp_opt_in, last_active_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[Reminder Service] User not found:', userId);
      return false;
    }

    // Check opt-in
    if (user.whatsapp_opt_in === false) {
      console.log('[Reminder Service] User opted out of WhatsApp reminders:', userId);
      return false;
    }

    // Check if user has phone number
    if (!user.phone_number) {
      console.warn('[Reminder Service] User has no phone number:', userId);
      return false;
    }

    // Check if user was active today
    if (user.last_active_at) {
      const lastActive = new Date(user.last_active_at);
      const today = new Date();
      const isToday = lastActive.toDateString() === today.toDateString();
      
      if (isToday) {
        console.log('[Reminder Service] User was active today, skipping reminder:', userId);
        return false;
      }
    }

    // Generate message
    const message = dailyCheckinTemplate({
      userName: user.name || undefined
    });

    // Send WhatsApp message
    const phoneNumber = `+91${user.phone_number.replace(/^\+?91/, '').replace(/\D/g, '')}`;
    await twilioService.sendWhatsApp(phoneNumber, message);

    console.log('[Reminder Service] ✅ Daily check-in reminder sent to:', userId);
    return true;

  } catch (error: any) {
    console.error('[Reminder Service] Error sending daily check-in reminder:', error);
    return false;
  }
}

/**
 * Send subscription expiry reminder to a user
 */
export async function sendSubscriptionExpiryReminder(userId: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured) {
      console.warn('[Reminder Service] Database not configured');
      return false;
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, phone_number, whatsapp_opt_in, subscription_tier, subscription_end_time')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[Reminder Service] User not found:', userId);
      return false;
    }

    // Check opt-in
    if (user.whatsapp_opt_in === false) {
      console.log('[Reminder Service] User opted out of WhatsApp reminders:', userId);
      return false;
    }

    // Check if user has active subscription
    if (!user.subscription_end_time || user.subscription_tier === 'free') {
      console.log('[Reminder Service] User has no active subscription:', userId);
      return false;
    }

    // Calculate days until expiry
    const expiryDate = new Date(user.subscription_end_time);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Only send if expires within 24 hours (1 day or less)
    if (daysLeft > 1) {
      console.log('[Reminder Service] Subscription expires in more than 1 day:', daysLeft);
      return false;
    }

    // Check if phone number exists
    if (!user.phone_number) {
      console.warn('[Reminder Service] User has no phone number:', userId);
      return false;
    }

    // Generate message
    const message = subscriptionExpiryTemplate({
      userName: user.name || undefined,
      daysLeft: Math.max(0, daysLeft),
      planType: user.subscription_tier as 'daily' | 'weekly'
    });

    // Send WhatsApp message
    const phoneNumber = `+91${user.phone_number.replace(/^\+?91/, '').replace(/\D/g, '')}`;
    await twilioService.sendWhatsApp(phoneNumber, message);

    console.log('[Reminder Service] ✅ Subscription expiry reminder sent to:', userId, `(${daysLeft} days left)`);
    return true;

  } catch (error: any) {
    console.error('[Reminder Service] Error sending subscription expiry reminder:', error);
    return false;
  }
}

/**
 * Send inactive user reminder to a user
 */
export async function sendInactiveUserReminder(userId: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured) {
      console.warn('[Reminder Service] Database not configured');
      return false;
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, phone_number, whatsapp_opt_in, last_active_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[Reminder Service] User not found:', userId);
      return false;
    }

    // Check opt-in
    if (user.whatsapp_opt_in === false) {
      console.log('[Reminder Service] User opted out of WhatsApp reminders:', userId);
      return false;
    }

    // Check if user has phone number
    if (!user.phone_number) {
      console.warn('[Reminder Service] User has no phone number:', userId);
      return false;
    }

    // Calculate days inactive
    let daysInactive = 3; // Default
    if (user.last_active_at) {
      const lastActive = new Date(user.last_active_at);
      const now = new Date();
      daysInactive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Only send if inactive for 3+ days
    if (daysInactive < 3) {
      console.log('[Reminder Service] User is not inactive enough:', daysInactive, 'days');
      return false;
    }

    // Generate message
    const message = inactiveUserTemplate({
      userName: user.name || undefined,
      daysInactive
    });

    // Send WhatsApp message
    const phoneNumber = `+91${user.phone_number.replace(/^\+?91/, '').replace(/\D/g, '')}`;
    await twilioService.sendWhatsApp(phoneNumber, message);

    console.log('[Reminder Service] ✅ Inactive user reminder sent to:', userId, `(${daysInactive} days inactive)`);
    return true;

  } catch (error: any) {
    console.error('[Reminder Service] Error sending inactive user reminder:', error);
    return false;
  }
}

/**
 * Create a reminder record in the database
 */
export async function createReminderRecord(
  userId: string,
  reminderType: 'daily_checkin' | 'subscription_expiry' | 'inactive_user',
  scheduledAt: Date,
  messageContent: string
): Promise<string | null> {
  try {
    if (!isSupabaseConfigured) {
      return null;
    }

    const { data, error } = await supabase
      .from('whatsapp_reminders')
      .insert({
        user_id: userId,
        reminder_type: reminderType,
        scheduled_at: scheduledAt.toISOString(),
        message_content: messageContent,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Reminder Service] Error creating reminder record:', error);
      return null;
    }

    return data.id;
  } catch (error: any) {
    console.error('[Reminder Service] Error creating reminder record:', error);
    return null;
  }
}

/**
 * Mark reminder as sent
 */
export async function markReminderAsSent(reminderId: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured) {
      return false;
    }

    const { error } = await supabase
      .from('whatsapp_reminders')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', reminderId);

    if (error) {
      console.error('[Reminder Service] Error marking reminder as sent:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('[Reminder Service] Error marking reminder as sent:', error);
    return false;
  }
}

/**
 * Mark reminder as failed
 */
export async function markReminderAsFailed(reminderId: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured) {
      return false;
    }

    const { error } = await supabase
      .from('whatsapp_reminders')
      .update({
        status: 'failed'
      })
      .eq('id', reminderId);

    if (error) {
      console.error('[Reminder Service] Error marking reminder as failed:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('[Reminder Service] Error marking reminder as failed:', error);
    return false;
  }
}

