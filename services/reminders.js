import { supabase } from '../db/supabase.js';

/**
 * Create a reminder for a user.
 */
export async function createReminder(userId, { message, remind_at, event_id }) {
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      message,
      remind_at,
      event_id: event_id || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * List pending (unsent) reminders for a user.
 */
export async function listReminders(userId) {
  const { data, error } = await supabase
    .from('reminders')
    .select('id, message, remind_at')
    .eq('user_id', userId)
    .eq('sent', false)
    .order('remind_at');
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
    .select('id, message, remind_at, user_id, users(telegram_id, display_name)')
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
