import { getDueReminders, markSent, listReminders, createReminder, getNextOccurrence } from '../services/reminders.js';
import { listEvents } from '../services/calendar.js';
import { getMealsForDate } from '../services/meals.js';
import { getAllPoints } from '../services/points.js';
import { getMonthStats } from '../services/officeCheckin.js';
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

    // Fetch weather (non-critical)
    try {
      const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=53.39&longitude=-3.02'
        + '&current=temperature_2m,weathercode,wind_speed_10m'
        + '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum'
        + '&forecast_days=3&timezone=Europe%2FLondon';
      const weatherRes = await fetch(weatherUrl);
      if (weatherRes.ok) {
        const wd = await weatherRes.json();
        const wEmoji = (code) => {
          if (code === 0) return '☀️'; if (code <= 3) return '⛅'; if (code <= 48) return '🌫️';
          if (code <= 57) return '🌦️'; if (code <= 65) return '🌧️'; if (code <= 77) return '🌨️';
          if (code <= 82) return '🌧️'; if (code <= 86) return '❄️'; if (code <= 99) return '⛈️';
          return '🌤️';
        };
        const wDesc = (code) => {
          if (code === 0) return 'Clear'; if (code <= 3) return 'Partly cloudy'; if (code <= 48) return 'Foggy';
          if (code <= 57) return 'Drizzle'; if (code <= 65) return 'Rainy'; if (code <= 77) return 'Snowy';
          if (code <= 82) return 'Showers'; if (code <= 86) return 'Snow showers'; return 'Stormy';
        };
        const cur = wd.current;
        message += `\n🌤️ Weather: ${wEmoji(cur.weathercode)} ${Math.round(cur.temperature_2m)}°C — ${wDesc(cur.weathercode)}, wind ${Math.round(cur.wind_speed_10m)}km/h\n`;
        if (wd.daily && wd.daily.time.length > 1) {
          message += `  Tomorrow: ${wEmoji(wd.daily.weathercode[1])} ${Math.round(wd.daily.temperature_2m_max[1])}°/${Math.round(wd.daily.temperature_2m_min[1])}°`;
          const rain = wd.daily.precipitation_sum[1];
          if (rain > 0) message += ` 💧${rain.toFixed(1)}mm`;
          message += `\n`;
        }
      }
    } catch (weatherErr) {
      // Weather is non-critical, skip silently
    }

    message += `\nHave a great day! 🎉`;

    // Send DM and store message_id so the user can reply to check in
    try {
      const sentMsg = await bot.api.sendMessage(user.telegram_id, message);
      sent++;
      // Fire-and-forget — non-critical
      supabase.from('users')
        .update({ last_digest_message_id: sentMsg.message_id })
        .eq('id', user.id)
        .then(({ error }) => { if (error) console.error('Failed to store digest message_id:', error.message); });
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

    const tz = user.timezone || 'Europe/London';
    const now = new Date();
    const weekStart = startOfDayInTz(now, tz);
    const weekEnd = endOfDayInTz(addDays(now, 6), tz);

    const now = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    const [events, officeStats] = await Promise.all([
      listEvents(user.family_id, weekStart, weekEnd),
      getMonthStats(user.family_id, year, month).catch(() => null),
    ]);

    if (events.length === 0 && !officeStats) continue;

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

    // Office attendance section
    if (officeStats && officeStats.eligibleDays > 0) {
      const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' });
      const targetIcon = officeStats.actualTargetMet ? '✅' : (officeStats.plannedTargetMet ? '🟡' : '❌');
      message += `🏢 Office attendance — ${monthName}\n`;
      message += `  Actual:  ${officeStats.confirmedDays}/${officeStats.eligibleDays} days (${officeStats.actualPct}%) ${targetIcon}\n`;
      message += `  Planned: ${officeStats.plannedDays}/${officeStats.eligibleDays} days (${officeStats.plannedPct}%)\n`;

      const daysNeeded = Math.ceil(officeStats.eligibleDays * 0.4) - officeStats.confirmedDays;
      if (daysNeeded > 0 && !officeStats.actualTargetMet) {
        message += `  Need ${daysNeeded} more confirmed day${daysNeeded !== 1 ? 's' : ''} to hit 40%\n`;
      }
      if (officeStats.bookingIssuesCount > 0) {
        message += `  ⚠️ ${officeStats.bookingIssuesCount} day${officeStats.bookingIssuesCount !== 1 ? 's' : ''} with missing bookings\n`;
      }
      if (officeStats.pendingExpensesCount > 0) {
        message += `  💸 ${officeStats.pendingExpensesCount} expense${officeStats.pendingExpensesCount !== 1 ? 's' : ''} submitted but not received\n`;
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
