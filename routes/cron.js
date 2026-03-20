import { getDueReminders, markSent } from '../services/reminders.js';

/**
 * Check for due reminders and send them via Telegram.
 * Called by cron-job.org hitting GET /cron/check.
 */
export async function checkReminders(bot) {
  const due = await getDueReminders();
  let sent = 0;

  for (const reminder of due) {
    const telegramId = reminder.users?.telegram_id;
    if (!telegramId) continue;

    try {
      await bot.api.sendMessage(
        telegramId,
        `⏰ Reminder: ${reminder.message}`
      );
      await markSent(reminder.id);
      sent++;
    } catch (err) {
      console.error(`Failed to send reminder ${reminder.id}:`, err.message);
    }
  }

  return { checked: due.length, sent };
}
