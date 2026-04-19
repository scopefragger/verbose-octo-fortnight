import { getDueReminders, markSent, listReminders, createReminder, getNextOccurrence } from '../services/reminders.js';
import { listEvents } from '../services/calendar.js';
import { getMealsForDate, getMealsForWeek } from '../services/meals.js';
import { getAllPoints } from '../services/points.js';
import { getMonthStats, getTodayRow } from '../services/officeCheckin.js';
import { getFoodItems } from '../services/foodExpiry.js';
import { getBirthdays } from '../services/birthdays.js';
import { listCountdowns } from '../services/countdowns.js';
import { getNextCollection } from '../services/binSchedule.js';
import { getDailyLog, getDailySummary, getWeeklyAverage, getNutritionGoal } from '../services/foodLog.js';
import { supabase } from '../db/supabase.js';
import { formatForUser } from '../utils/time.js';
import { sendMessage } from '../bot/whatsapp.js';

/**
 * Check for due reminders and send them via Telegram.
 * Called by cron-job.org hitting GET /cron/check.
 */
export async function checkReminders() {
  const due = await getDueReminders();
  let sent = 0;

  for (const reminder of due) {
    const waNumber = reminder.users?.whatsapp_number;
    if (!waNumber) continue;

    try {
      const recurLabel = reminder.recurrence ? ` (${reminder.recurrence})` : '';
      await sendMessage(
        waNumber,
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
export async function sendDailyDigest() {
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

    // Get food expiry alerts (items expiring within 2 days)
    const urgentFood = user.family_id
      ? await getFoodItems(user.family_id)
          .then(items => {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() + 2);
            cutoff.setHours(23, 59, 59);
            return items.filter(i => new Date(i.expires_at + 'T23:59:59') <= cutoff);
          })
          .catch(() => [])
      : [];

    // Get birthdays for today and tomorrow
    const allBirthdays = user.family_id
      ? await getBirthdays(user.family_id).catch(() => [])
      : [];
    const tomorrowDateStr = addDays(now, 1).toLocaleDateString('en-CA', { timeZone: tz });
    const todayMMDD = todayStr.slice(5);
    const tomorrowMMDD = tomorrowDateStr.slice(5);
    const thisYear = parseInt(todayStr.slice(0, 4));
    const todayBirthdays = allBirthdays.filter(b => b.birth_date.slice(5) === todayMMDD);
    const tomorrowBirthdays = allBirthdays.filter(b => b.birth_date.slice(5) === tomorrowMMDD);

    // Get office check-in status for today (weekdays only)
    const isWeekday = !['Saturday', 'Sunday'].includes(dayName);
    const todayOfficeRow = (isWeekday && user.family_id)
      ? await getTodayRow(user.family_id, todayStr).catch(() => null)
      : null;

    // Get nearest countdown (if within 30 days)
    const nearestCountdown = user.family_id
      ? await listCountdowns(user.family_id)
          .then(cdowns => {
            if (!cdowns.length) return null;
            cdowns.sort((a, b) => a.target_date.localeCompare(b.target_date));
            const c = cdowns[0];
            const daysUntil = Math.ceil((new Date(c.target_date + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntil <= 30 ? { ...c, daysUntil } : null;
          })
          .catch(() => null)
      : null;

    // Get next bin collection (non-critical)
    const binInfo = user.family_id
      ? await getNextCollection(user.family_id, now).catch(() => null)
      : null;

    // Get yesterday's calorie log (only if food was logged)
    const yesterdayStr = addDays(now, -1).toLocaleDateString('en-CA', { timeZone: tz });
    const [yesterdayEntries, nutritionGoal, weeklyAvg] = await Promise.all([
      user.family_id ? getDailyLog(user.family_id, user.id, yesterdayStr).catch(() => []) : Promise.resolve([]),
      user.family_id ? getNutritionGoal(user.family_id, user.id).catch(() => null) : Promise.resolve(null),
      user.family_id ? getWeeklyAverage(user.family_id, user.id, yesterdayStr).catch(() => null) : Promise.resolve(null),
    ]);

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

    if (urgentFood.length > 0) {
      message += `\n🥗 Use Up Today/Soon:\n`;
      for (const item of urgentFood) {
        const daysLeft = Math.ceil((new Date(item.expires_at + 'T23:59:59') - new Date()) / (1000 * 60 * 60 * 24));
        const urgency = daysLeft <= 0 ? 'EXPIRED ❌' : daysLeft === 1 ? '1 day left ⚠️' : `${daysLeft} days left`;
        const qty = item.quantity ? ` (${item.quantity})` : '';
        message += `  • ${item.name}${qty} — ${urgency}\n`;
      }
    }

    for (const b of todayBirthdays) {
      const age = thisYear - parseInt(b.birth_date.slice(0, 4));
      message += `\n🎂 Birthday Today: ${b.name} turns ${age}! 🥳\n`;
    }
    for (const b of tomorrowBirthdays) {
      const age = thisYear - parseInt(b.birth_date.slice(0, 4));
      message += `\n🎂 Birthday Tomorrow: ${b.name} turns ${age}\n`;
    }

    if (isWeekday) {
      if (todayOfficeRow) {
        const typeLabel = todayOfficeRow.day_type === 'office' ? 'In office'
          : todayOfficeRow.day_type === 'travel' ? `Travel${todayOfficeRow.destination ? ` to ${todayOfficeRow.destination}` : ''}`
          : 'Time off';
        const bookingNote = todayOfficeRow.day_type === 'office'
          ? (todayOfficeRow.parking_booked ? ' — parking ✅' : ' — parking ⚠️')
          : '';
        message += `\n🏢 Office: ${typeLabel}${bookingNote}\n`;
      } else {
        message += `\n🏢 Office: No day logged yet for today\n`;
      }
    }

    if (nearestCountdown) {
      const bgEmoji = { fireworks: '🎆', castle: '🏰', stars: '⭐', rainbow: '🌈', beach: '🏖️', party: '🎉' }[nearestCountdown.background] || '⏳';
      message += `\n⏳ ${nearestCountdown.title} in ${nearestCountdown.daysUntil} day${nearestCountdown.daysUntil !== 1 ? 's' : ''}! ${bgEmoji}\n`;
    }

    if (binInfo?.isToday) {
      message += `\n🗑️ Bin day today: put out the ${binInfo.bin.emoji} ${binInfo.bin.name} bin!\n`;
    } else if (binInfo?.isTomorrow) {
      message += `\n🗑️ Bins out tomorrow: ${binInfo.bin.emoji} ${binInfo.bin.name} bin — don't forget!\n`;
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

    // Yesterday's calorie summary (only if food was logged)
    if (yesterdayEntries.length > 0) {
      const total = yesterdayEntries.reduce((s, e) => s + (e.calories || 0), 0);
      const goalCal = nutritionGoal?.daily_calories || null;
      message += `\n🥗 Yesterday's Calories:\n`;
      if (goalCal) {
        const diff = total - goalCal;
        const emoji = diff <= 0 ? '✅' : diff <= 200 ? '🟡' : '🔴';
        message += `  ${total.toLocaleString()} / ${goalCal.toLocaleString()} kcal ${emoji}`;
        message += diff <= 0 ? ` — ${Math.abs(diff)} under goal\n` : ` — ${diff} over goal\n`;
      } else {
        message += `  ${total.toLocaleString()} kcal\n`;
      }
      if (weeklyAvg && weeklyAvg.days_with_data > 0) {
        const avgVsGoal = goalCal ? weeklyAvg.average_calories - goalCal : null;
        const avgNote = avgVsGoal === null ? '' : avgVsGoal <= 0
          ? ` (${Math.abs(avgVsGoal)} under goal ✅)` : ` (${avgVsGoal} over)`;
        message += `  7-day avg: ${weeklyAvg.average_calories.toLocaleString()} kcal/day${avgNote}\n`;
      }
    }

    message += `\nHave a great day! 🎉`;

    // Send DM and store message_id so the user can reply to check in
    if (!user.whatsapp_number) continue;
    try {
      const wamid = await sendMessage(user.whatsapp_number, message);
      sent++;
      if (wamid) {
        supabase.from('users')
          .update({ last_digest_message_id: wamid })
          .eq('id', user.id)
          .then(({ error }) => { if (error) console.error('Failed to store digest message_id:', error.message); });
      }
    } catch (err) {
      console.error(`Failed to send daily digest to ${user.whatsapp_number}:`, err.message);
    }

    // Store family digest for group chat (use first user's digest per family)
    if (user.family_id && !familyDigests.has(user.family_id)) {
      familyDigests.set(user.family_id, message);
    }
  }

  // Send digest to family WhatsApp group chats
  for (const [familyId, digest] of familyDigests) {
    try {
      const { data: family } = await supabase
        .from('families')
        .select('whatsapp_group_id')
        .eq('id', familyId)
        .single();

      if (family?.whatsapp_group_id) {
        await sendMessage(family.whatsapp_group_id, digest);
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
export async function sendWeeklyDigest() {
  const users = await getAllUsers();
  let sent = 0;

  for (const user of users) {
    if (!user.family_id) continue;

    const tz = user.timezone || 'Europe/London';
    const now = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;
    const weekStart = startOfDayInTz(now, tz);
    const weekEnd = endOfDayInTz(addDays(now, 6), tz);
    const weekStartStr = now.toLocaleDateString('en-CA', { timeZone: tz });
    const weekEndStr = addDays(now, 6).toLocaleDateString('en-CA', { timeZone: tz });
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      addDays(now, i).toLocaleDateString('en-CA', { timeZone: tz })
    );

    const [events, officeStats, weekBdaySource, weekFoodItems, weekMeals] = await Promise.all([
      listEvents(user.family_id, weekStart, weekEnd),
      getMonthStats(user.family_id, year, month).catch(() => null),
      getBirthdays(user.family_id).catch(() => []),
      getFoodItems(user.family_id).catch(() => []),
      getMealsForWeek(user.family_id, weekStartStr, weekEndStr).catch(() => []),
    ]);

    // Find birthdays falling within the 7-day window
    const weekBirthdays = [];
    for (const b of weekBdaySource) {
      for (const d of weekDates) {
        if (b.birth_date.slice(5) === d.slice(5)) {
          weekBirthdays.push({ ...b, onDate: d, age: parseInt(d.slice(0, 4)) - parseInt(b.birth_date.slice(0, 4)) });
          break;
        }
      }
    }
    weekBirthdays.sort((a, b) => a.onDate.localeCompare(b.onDate));

    // Find food expiring within the 7-day window
    const weekExpiringFood = weekFoodItems.filter(i => i.expires_at <= weekEndStr);

    if (events.length === 0 && !officeStats && weekBirthdays.length === 0 && weekExpiringFood.length === 0 && weekMeals.length === 0) continue;

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

    if (weekBirthdays.length > 0) {
      message += `🎂 Birthdays This Week:\n`;
      for (const b of weekBirthdays) {
        const dayLabel = new Date(b.onDate + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' });
        message += `  • ${b.name} — ${dayLabel} (turns ${b.age})\n`;
      }
      message += '\n';
    }

    if (weekExpiringFood.length > 0) {
      message += `🥗 Food To Use This Week:\n`;
      for (const item of weekExpiringFood) {
        const daysLeft = Math.ceil((new Date(item.expires_at + 'T23:59:59') - new Date()) / (1000 * 60 * 60 * 24));
        const dayLabel = new Date(item.expires_at + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        const qty = item.quantity ? ` (${item.quantity})` : '';
        message += `  • ${item.name}${qty} — ${dayLabel} (${daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'today'})\n`;
      }
      message += '\n';
    }

    if (weekMeals.length > 0) {
      const mealsByDay = {};
      for (const meal of weekMeals) {
        if (!mealsByDay[meal.meal_date]) mealsByDay[meal.meal_date] = [];
        mealsByDay[meal.meal_date].push(meal);
      }
      if (Object.keys(mealsByDay).length >= 2) {
        message += `🍽️ Meals This Week:\n`;
        for (const d of weekDates) {
          const dayMeals = mealsByDay[d];
          if (!dayMeals) continue;
          const shortDay = new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
          const dinner = dayMeals.find(m => m.meal_type === 'dinner');
          const primary = dinner || dayMeals[0];
          message += `  ${shortDay}: ${primary.title}\n`;
        }
        message += '\n';
      }
    }

    if (!user.whatsapp_number) continue;
    try {
      await sendMessage(user.whatsapp_number, message);
      sent++;
    } catch (err) {
      console.error(`Failed to send weekly digest to ${user.whatsapp_number}:`, err.message);
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
    .select('id, whatsapp_number, display_name, family_id, timezone');
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

/**
 * Send an evening calorie recap to each user who logged food today.
 * Skips silently if the user logged nothing — no nag messages.
 * Called by cron-job.org hitting GET /cron/calorie-recap (e.g. 8pm daily).
 */
export async function sendCalorieRecap() {
  const users = await getAllUsers();
  let sent = 0;

  for (const user of users) {
    if (!user.whatsapp_number || !user.family_id) continue;

    const tz = user.timezone || 'Europe/London';
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: tz });

    try {
      const [entries, goal, weekly] = await Promise.all([
        getDailyLog(user.family_id, user.id, todayStr),
        getNutritionGoal(user.family_id, user.id),
        getWeeklyAverage(user.family_id, user.id, todayStr),
      ]);

      // Only send if the user actually logged something today
      if (!entries.length) continue;

      const total = entries.reduce((s, e) => s + (e.calories || 0), 0);
      const goalCal = goal?.daily_calories || null;

      let message = `🥗 Calorie recap for today, ${user.display_name}!\n\n`;

      // Today's total vs goal
      if (goalCal) {
        const diff = total - goalCal;
        const statusEmoji = diff <= 0 ? '✅' : diff <= 200 ? '🟡' : '🔴';
        message += `Today: ${total.toLocaleString()} / ${goalCal.toLocaleString()} kcal ${statusEmoji}\n`;
        message += diff <= 0
          ? `  ${Math.abs(diff).toLocaleString()} kcal under goal 👏\n`
          : `  ${diff.toLocaleString()} kcal over goal\n`;
      } else {
        message += `Today: ${total.toLocaleString()} kcal\n`;
      }

      // Per-meal breakdown
      const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
      const MEAL_EMOJI = { breakfast: '☀️', lunch: '🌤️', dinner: '🌙', snack: '🍎' };
      const byMeal = {};
      for (const e of entries) {
        if (!byMeal[e.meal_type]) byMeal[e.meal_type] = [];
        byMeal[e.meal_type].push(e);
      }
      message += '\n';
      for (const meal of MEAL_ORDER) {
        if (!byMeal[meal]) continue;
        const mealTotal = byMeal[meal].reduce((s, e) => s + (e.calories || 0), 0);
        const items = byMeal[meal].map(e => e.food_name).join(', ');
        message += `${MEAL_EMOJI[meal]} ${meal.charAt(0).toUpperCase() + meal.slice(1)}: ${mealTotal} kcal — ${items}\n`;
      }

      // 7-day average
      if (weekly.days_with_data > 0) {
        const avgVsGoal = goalCal ? weekly.average_calories - goalCal : null;
        const avgNote = avgVsGoal === null ? '' : avgVsGoal <= 0
          ? ` (${Math.abs(avgVsGoal)} under goal ✅)`
          : ` (${avgVsGoal} over goal)`;
        message += `\n📊 7-day average: ${weekly.average_calories.toLocaleString()} kcal/day${avgNote}\n`;
      }

      await sendMessage(user.whatsapp_number, message);
      sent++;
    } catch (err) {
      console.error(`Failed to send calorie recap to ${user.whatsapp_number}:`, err.message);
    }
  }

  return { users: users.length, sent };
}
