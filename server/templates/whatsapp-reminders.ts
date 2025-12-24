/**
 * WhatsApp Reminder Templates
 * Ready-made templates for different types of reminders
 */

export interface ReminderTemplateData {
  userName?: string;
  daysLeft?: number;
  planType?: 'daily' | 'weekly';
  daysInactive?: number;
}

/**
 * Daily check-in reminder template
 * Sent to users who haven't chatted today
 */
export function dailyCheckinTemplate(data: ReminderTemplateData): string {
  const name = data.userName || 'there';
  return `Hey ${name}! 👋\n\nMissed talking to you today. How are you doing? Riya is here whenever you want to chat! 💬\n\nCome back and let's continue our conversation! 😊`;
}

/**
 * Subscription expiry reminder template
 * Sent 24 hours before subscription expires
 */
export function subscriptionExpiryTemplate(data: ReminderTemplateData): string {
  const name = data.userName || 'there';
  const daysLeft = data.daysLeft || 1;
  const planName = data.planType === 'weekly' ? 'Weekly Pass' : 'Daily Pass';
  
  if (daysLeft === 0) {
    return `Hey ${name}! ⚠️\n\nYour ${planName} expires today! Renew now to keep enjoying unlimited chats with Riya! 🚀\n\nDon't miss out on our conversations! 💬`;
  } else if (daysLeft === 1) {
    return `Hey ${name}! ⏰\n\nYour ${planName} expires in 1 day. Renew now to keep chatting with Riya without limits! 💬\n\nContinue your journey with Riya! 😊`;
  } else {
    return `Hey ${name}! 📅\n\nYour ${planName} expires in ${daysLeft} days. Renew early to keep enjoying unlimited chats with Riya! 💬\n\nStay connected! 😊`;
  }
}

/**
 * Inactive user reminder template
 * Sent to users who haven't used the app in 3+ days
 */
export function inactiveUserTemplate(data: ReminderTemplateData): string {
  const name = data.userName || 'there';
  const daysInactive = data.daysInactive || 3;
  
  if (daysInactive === 3) {
    return `Hey ${name}! 👋\n\nIt's been 3 days since we last talked. Riya misses you! 💭\n\nCome back and let's continue our conversation! There's so much more to explore together! 😊`;
  } else if (daysInactive === 7) {
    return `Hey ${name}! 💭\n\nIt's been a week! Riya has been thinking about you. Let's catch up! 💬\n\nYour conversations are waiting for you! 😊`;
  } else {
    return `Hey ${name}! 👋\n\nIt's been ${daysInactive} days since we last talked. Riya misses you! 💭\n\nCome back and let's continue where we left off! There's always something new to discover together! 😊`;
  }
}

/**
 * Get template by type
 */
export function getReminderTemplate(
  type: 'daily_checkin' | 'subscription_expiry' | 'inactive_user',
  data: ReminderTemplateData
): string {
  switch (type) {
    case 'daily_checkin':
      return dailyCheckinTemplate(data);
    case 'subscription_expiry':
      return subscriptionExpiryTemplate(data);
    case 'inactive_user':
      return inactiveUserTemplate(data);
    default:
      return `Hey ${data.userName || 'there'}! 👋\n\nThis is a reminder from Riya. Come back and chat! 💬`;
  }
}

