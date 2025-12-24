import cron from 'node-cron';
import { supabase, isSupabaseConfigured } from '../supabase';
import {
  sendDailyCheckinReminder,
  sendSubscriptionExpiryReminder,
  sendInactiveUserReminder,
  createReminderRecord,
  markReminderAsSent,
  markReminderAsFailed
} from '../services/reminder-service';
import {
  dailyCheckinTemplate,
  subscriptionExpiryTemplate,
  inactiveUserTemplate
} from '../templates/whatsapp-reminders';

/**
 * Schedule reminder jobs
 * Only runs if ENABLE_REMINDERS=true or in production
 */
export function initializeReminderScheduler() {
  const enableReminders = process.env.ENABLE_REMINDERS === 'true' || process.env.NODE_ENV === 'production';
  
  if (!enableReminders) {
    console.log('[Reminder Scheduler] Reminders disabled. Set ENABLE_REMINDERS=true to enable.');
    return;
  }

  if (!isSupabaseConfigured) {
    console.warn('[Reminder Scheduler] Database not configured. Reminders will not run.');
    return;
  }

  console.log('[Reminder Scheduler] Initializing reminder jobs...');

  // =====================================================
  // JOB 1: Daily Check-in Reminders
  // Runs daily at 9:00 AM
  // =====================================================
  cron.schedule('0 9 * * *', async () => {
    console.log('[Reminder Scheduler] Running daily check-in reminder job...');
    
    try {
      // Find users who haven't chatted today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, phone_number, whatsapp_opt_in, last_active_at')
        .eq('whatsapp_opt_in', true)
        .or(`last_active_at.is.null,last_active_at.lt.${today.toISOString()}`);

      if (error) {
        console.error('[Reminder Scheduler] Error fetching users for daily check-in:', error);
        return;
      }

      if (!users || users.length === 0) {
        console.log('[Reminder Scheduler] No users found for daily check-in reminders');
        return;
      }

      console.log(`[Reminder Scheduler] Found ${users.length} users for daily check-in reminders`);

      // Schedule reminders for each user
      for (const user of users) {
        try {
          const scheduledAt = new Date();
          scheduledAt.setHours(9, 30, 0, 0); // Schedule for 9:30 AM

          const message = dailyCheckinTemplate({ userName: user.name || undefined });
          
          await createReminderRecord(
            user.id,
            'daily_checkin',
            scheduledAt,
            message
          );
        } catch (error: any) {
          console.error(`[Reminder Scheduler] Error scheduling reminder for user ${user.id}:`, error);
        }
      }

      console.log('[Reminder Scheduler] ✅ Daily check-in reminders scheduled');
    } catch (error: any) {
      console.error('[Reminder Scheduler] Error in daily check-in job:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Indian timezone
  });

  // =====================================================
  // JOB 2: Subscription Expiry Reminders
  // Runs every hour
  // =====================================================
  cron.schedule('0 * * * *', async () => {
    console.log('[Reminder Scheduler] Running subscription expiry reminder job...');
    
    try {
      // Find users with subscriptions expiring in 24 hours
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, phone_number, whatsapp_opt_in, subscription_tier, subscription_end_time')
        .eq('whatsapp_opt_in', true)
        .neq('subscription_tier', 'free')
        .not('subscription_end_time', 'is', null)
        .gte('subscription_end_time', now.toISOString())
        .lte('subscription_end_time', tomorrow.toISOString());

      if (error) {
        console.error('[Reminder Scheduler] Error fetching users for expiry reminders:', error);
        return;
      }

      if (!users || users.length === 0) {
        console.log('[Reminder Scheduler] No users found for subscription expiry reminders');
        return;
      }

      console.log(`[Reminder Scheduler] Found ${users.length} users for subscription expiry reminders`);

      // Schedule reminders for each user
      for (const user of users) {
        try {
          if (!user.subscription_end_time) continue;

          const expiryDate = new Date(user.subscription_end_time);
          const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          const scheduledAt = new Date();
          scheduledAt.setHours(now.getHours() + 1, 0, 0, 0); // Schedule for next hour

          const message = subscriptionExpiryTemplate({
            userName: user.name || undefined,
            daysLeft: Math.max(0, daysLeft),
            planType: user.subscription_tier as 'daily' | 'weekly'
          });
          
          await createReminderRecord(
            user.id,
            'subscription_expiry',
            scheduledAt,
            message
          );
        } catch (error: any) {
          console.error(`[Reminder Scheduler] Error scheduling reminder for user ${user.id}:`, error);
        }
      }

      console.log('[Reminder Scheduler] ✅ Subscription expiry reminders scheduled');
    } catch (error: any) {
      console.error('[Reminder Scheduler] Error in subscription expiry job:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });

  // =====================================================
  // JOB 3: Inactive User Reminders
  // Runs daily at 10:00 AM
  // =====================================================
  cron.schedule('0 10 * * *', async () => {
    console.log('[Reminder Scheduler] Running inactive user reminder job...');
    
    try {
      // Find users inactive for 3+ days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, phone_number, whatsapp_opt_in, last_active_at')
        .eq('whatsapp_opt_in', true)
        .or(`last_active_at.is.null,last_active_at.lt.${threeDaysAgo.toISOString()}`);

      if (error) {
        console.error('[Reminder Scheduler] Error fetching inactive users:', error);
        return;
      }

      if (!users || users.length === 0) {
        console.log('[Reminder Scheduler] No inactive users found');
        return;
      }

      console.log(`[Reminder Scheduler] Found ${users.length} inactive users`);

      // Schedule reminders for each user
      for (const user of users) {
        try {
          let daysInactive = 3;
          if (user.last_active_at) {
            const lastActive = new Date(user.last_active_at);
            const now = new Date();
            daysInactive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
          }

          // Only send if inactive for 3+ days
          if (daysInactive < 3) continue;

          const scheduledAt = new Date();
          scheduledAt.setHours(10, 30, 0, 0); // Schedule for 10:30 AM

          const message = inactiveUserTemplate({
            userName: user.name || undefined,
            daysInactive
          });
          
          await createReminderRecord(
            user.id,
            'inactive_user',
            scheduledAt,
            message
          );
        } catch (error: any) {
          console.error(`[Reminder Scheduler] Error scheduling reminder for user ${user.id}:`, error);
        }
      }

      console.log('[Reminder Scheduler] ✅ Inactive user reminders scheduled');
    } catch (error: any) {
      console.error('[Reminder Scheduler] Error in inactive user job:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });

  // =====================================================
  // JOB 4: Send Pending Reminders
  // Runs every 5 minutes to send scheduled reminders
  // =====================================================
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Reminder Scheduler] Running send pending reminders job...');
    
    try {
      const now = new Date();
      
      // Find pending reminders that are due
      const { data: reminders, error } = await supabase
        .from('whatsapp_reminders')
        .select('id, user_id, reminder_type, message_content')
        .eq('status', 'pending')
        .lte('scheduled_at', now.toISOString())
        .limit(50); // Process 50 at a time

      if (error) {
        console.error('[Reminder Scheduler] Error fetching pending reminders:', error);
        return;
      }

      if (!reminders || reminders.length === 0) {
        return; // No reminders to send
      }

      console.log(`[Reminder Scheduler] Found ${reminders.length} pending reminders to send`);

      // Send each reminder
      for (const reminder of reminders) {
        try {
          let success = false;

          switch (reminder.reminder_type) {
            case 'daily_checkin':
              success = await sendDailyCheckinReminder(reminder.user_id);
              break;
            case 'subscription_expiry':
              success = await sendSubscriptionExpiryReminder(reminder.user_id);
              break;
            case 'inactive_user':
              success = await sendInactiveUserReminder(reminder.user_id);
              break;
          }

          if (success) {
            await markReminderAsSent(reminder.id);
            console.log(`[Reminder Scheduler] ✅ Sent reminder ${reminder.id}`);
          } else {
            await markReminderAsFailed(reminder.id);
            console.log(`[Reminder Scheduler] ❌ Failed to send reminder ${reminder.id}`);
          }
        } catch (error: any) {
          console.error(`[Reminder Scheduler] Error sending reminder ${reminder.id}:`, error);
          await markReminderAsFailed(reminder.id);
        }
      }

      console.log('[Reminder Scheduler] ✅ Finished processing pending reminders');
    } catch (error: any) {
      console.error('[Reminder Scheduler] Error in send pending reminders job:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });

  console.log('[Reminder Scheduler] ✅ All reminder jobs initialized');
}

