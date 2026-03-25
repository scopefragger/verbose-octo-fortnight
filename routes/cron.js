import { getDueReminders, markSent, listReminders, createReminder, getNextOccurrence } from '../services/reminders.js';
import { listEvents } from '../services/calendar.js';
import { getMealsForDate } from '../services/meals.js';
import { getAllPoints } from '../services/points.js';
import { supabase } from '../db/supabase.js';
import { formatForUser } from '../utils/time.js';

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
      const recurLabel = reminder.recurrence ? ` (${reminder.recurrence})` : '';
      await bot.api.sendMessage(
        telegramId,
        `⏰ Reminder${recurLabel}: ${reminder.message}`
      );
      await markSent(reminder.id);
      sent++;

      // Schedule next occurrence for recurring reminders
      if (reminder.recurrence) {
        const nextAt = getNextOccurrence(reminder.remind_at, reminder.recurrence);
        if (nextAt) {
          await createReminder(reminder.user_id, {
            message: reminder.message,
            remind_at: nextAt,
            recurrence: reminder.recurrence,
          });
        }
      }
    } catch (err) {
      console.error(`Failed to send reminder ${reminder.id}:`, err.message);
    }
  }

  return { checked: due.length, sent };
}

/**
 * Send a daily morning digest at 8am.
 * Shows today's events and pending reminders for each family member.
 */
export async function sendDailyDigest(bot) {
  const users = await getAllUsers();
  let sent = 0;
  const familyDigests = new Map(); // familyId -> digest message (for group chat)

  for (const user of users) {
    const tz = user.timezone || 'Europe/London';
    const now = new Date();
    const todayStart = startOfDayInTz(now, tz);
    const todayEnd = endOfDayInTz(now, tz);
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: tz });
    const dayName = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long' });

    // Get today's events
    const events = user.family_id
      ? await listEvents(user.family_id, todayStart, todayEnd)
      : [];

    // Get pending reminders for today
    const pendingReminders = await listReminders(user.id);
    const todayReminders = pendingReminders.filter((r) => {
      const remindDate = new Date(r.remind_at);
      return remindDate >= new Date(todayStart) && remindDate <= new Date(todayEnd);
    });

    // Get today's meals
    const meals = user.family_id
      ? await getMealsForDate(user.family_id, todayStr)
      : [];

    // Get kid points
    const kidPoints = user.family_id
      ? await getAllPoints(user.family_id)
      : [];

    // Build the enriched digest
    let message = `☀️ Good morning, ${user.display_name}! Here's your ${dayName}:\n`;

    if (events.length > 0) {
      message += `\n📅 Today's Schedule:\n`;
      for (const event of events) {
        const time = event.all_day ? 'All day' : formatForUser(event.starts_at, tz);
        message += `  • ${event.title} — ${time}\n`;
      }
    }

    if (meals.length > 0) {
      message += `\n🍽️ Today's Meals:\n`;
      const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
      for (const meal of meals) {
        const label = mealLabels[meal.meal_type] || meal.meal_type;
        message += `  • ${label}: ${meal.title}\n`;
      }
    }

    if (todayReminders.length > 0) {
      message += `\n⏰ Reminders:\n`;
      for (const r of todayReminders) {
        message += `  • ${r.message} — ${formatForUser(r.remind_at, tz)}\n`;
      }
    }

    if (kidPoints.length > 0) {
      message += `\n⭐ Points Update:\n`;
      for (const kid of kidPoints) {
        const mickeyStr = kid.mickey_heads > 0
          ? `${kid.mickey_heads} Mickey Head${kid.mickey_heads > 1 ? 's' : ''} + ${kid.remaining_points} pts`
          : `${kid.total_points} pts`;
        message += `  • ${kid.kid_name}: ${mickeyStr}\n`;
      }
    }

    message += `\nHave a great day! 🎉`;

    // Send DM to user
    try {
      await bot.api.sendMessage(user.telegram_id, message);
      sent++;
    } catch (err) {
      console.error(`Failed to send daily digest to ${user.telegram_id}:`, err.message);
    }

    // Store family digest for group chat (use first user's digest per family)
    if (user.family_id && !familyDigests.has(user.family_id)) {
      familyDigests.set(user.family_id, message);
    }
  }

  // Send digest to family group chats
  for (const [familyId, digest] of familyDigests) {
    try {
      const { data: family } = await supabase
        .from('families')
        .select('group_chat_id')
        .eq('id', familyId)
        .single();

      if (family?.group_chat_id) {
        await bot.api.sendMessage(family.group_chat_id, digest);
      }
    } catch (err) {
      console.error(`Failed to send group digest for family ${familyId}:`, err.message);
    }
  }

  return { users: users.length, sent };
}

/**
 * Send a weekly digest every Sunday.
 * Shows key events for the upcoming week.
 */
export async function sendWeeklyDigest(bot) {
  const users = await getAllUsers();
  let sent = 0;

  for (const user of users) {
    if (!user.family_id) continue;

    const tz = user.timezone || 'America/New_York';
    const now = new Date();
    const weekStart = startOfDayInTz(now, tz);
    const weekEnd = endOfDayInTz(addDays(now, 6), tz);

    const events = await listEvents(user.family_id, weekStart, weekEnd);

    if (events.length === 0) continue;

    let message = `📋 Weekly overview for ${user.display_name}:\n\n`;

    // Group events by day
    const byDay = {};
    for (const event of events) {
      const dayLabel = new Date(event.starts_at).toLocaleDateString('en-US', {
        timeZone: tz,
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
      if (!byDay[dayLabel]) byDay[dayLabel] = [];
      byDay[dayLabel].push(event);
    }

    for (const [day, dayEvents] of Object.entries(byDay)) {
      message += `📅 ${day}\n`;
      for (const event of dayEvents) {
        const time = event.all_day ? 'All day' : formatForUser(event.starts_at, tz);
        message += `  • ${event.title} — ${time}\n`;
      }
      message += '\n';
    }

    try {
      await bot.api.sendMessage(user.telegram_id, message);
      sent++;
    } catch (err) {
      console.error(`Failed to send weekly digest to ${user.telegram_id}:`, err.message);
    }
  }

  return { users: users.length, sent };
}

/**
 * Get all registered users with their family info.
 */
async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, telegram_id, display_name, family_id, timezone');
  if (error) throw error;
  return data;
}

/**
 * Get ISO string for start of day in a timezone.
 */
function startOfDayInTz(date, tz) {
  const dayStr = date.toLocaleDateString('en-CA', { timeZone: tz });
  return `${dayStr}T00:00:00`;
}

/**
 * Get ISO string for end of day in a timezone.
 */
function endOfDayInTz(date, tz) {
  const dayStr = date.toLocaleDateString('en-CA', { timeZone: tz });
  return `${dayStr}T23:59:59`;
}

/**
 * Add days to a date.
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
