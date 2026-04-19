import { supabase } from '../db/supabase.js';

/**
 * Create a reminder for a user.
 */
export async function createReminder(userId, { message, remind_at, event_id, recurrence }) {
  const row = {
    user_id: userId,
    message,
    remind_at,
    event_id: event_id || null,
  };
  if (recurrence) row.recurrence = recurrence;
  const { data, error } = await supabase
    .from('reminders')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Calculate the next occurrence of a recurring reminder.
 * Supported: daily, weekdays, weekly, biweekly, monthly
 */
export function getNextOccurrence(currentDate, recurrence) {
  const d = new Date(currentDate);
  switch (recurrence) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekdays':
      do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'biweekly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    default:
      return null;
  }
  return d.toISOString();
}

/**
 * List pending (unsent) reminders for a user.
 */
export async function listReminders(userId) {
  const { data, error } = await supabase
    .from('reminders')
    .select('id, message, remind_at, recurrence')
    .eq('user_id', userId)
    .eq('sent', false)
    .order('remind_at');
  if (error) throw error;
  return data;
}

/**
 * Snooze a reminder by updating its remind_at to a new time.
 * Resets sent=false so the cron will fire it again at the new time.
 */
export async function snoozeReminder(reminderId, userId, newRemindAt) {
  const { data, error } = await supabase
    .from('reminders')
    .update({ remind_at: newRemindAt, sent: false })
    .eq('id', reminderId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Delete a reminder by ID.
 */
export async function deleteReminder(reminderId, userId) {
  const { data, error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminderId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get all reminders that are due (remind_at <= now, not yet sent).
 * Returns reminders with their associated user's telegram_id.
 */
export async function getDueReminders() {
  const { data, error } = await supabase
    .from('reminders')
    .select('id, message, remind_at, user_id, recurrence, users(whatsapp_number, display_name)')
    .eq('sent', false)
    .lte('remind_at', new Date().toISOString())
    .order('remind_at');
  if (error) throw error;
  return data;
}

/**
 * Mark a reminder as sent.
 */
export async function markSent(reminderId) {
  const { error } = await supabase
    .from('reminders')
    .update({ sent: true })
    .eq('id', reminderId);
  if (error) throw error;
}
