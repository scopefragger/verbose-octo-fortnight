import { supabase } from '../db/supabase.js';
import { listEvents } from '../services/calendar.js';
import { listReminders } from '../services/reminders.js';
import { getAllListsWithItems } from '../services/lists.js';
import { listCountdowns } from '../services/countdowns.js';
import { getAllPoints } from '../services/points.js';
import { getMealsForDate, getMealsForWeek } from '../services/meals.js';
import { getTheme } from '../services/themes.js';
import { getFoodItems } from '../services/foodExpiry.js';
import { getWatchlist } from '../services/watchlist.js';
import { getBirthdays, getUpcomingBirthdayEvents } from '../services/birthdays.js';
import { listGoals } from '../services/goals.js';
import { formatForUser } from '../utils/time.js';

/**
 * Get all dashboard data for a family.
 * Returns events (today + upcoming week), reminders, and lists.
 */
export async function getDashboardData(familyId) {
  // Get all family members
  const { data: members } = await supabase
    .from('users')
    .select('id, display_name, telegram_username, timezone')
    .eq('family_id', familyId);

  const tz = members?.[0]?.timezone || 'Europe/London';
  const now = new Date();

  // Today's date boundaries
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: tz });
  const todayStart = `${todayStr}T00:00:00`;
  const todayEnd = `${todayStr}T23:59:59`;

  // Tomorrow through next 30 days (for upcoming section — excludes today)
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone: tz });
  const tomorrowStart = `${tomorrowStr}T00:00:00`;
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 30);
  const weekEndStr = weekEnd.toLocaleDateString('en-CA', { timeZone: tz });
  const weekEndBound = `${weekEndStr}T23:59:59`;

  // Fetch all data in a single parallel batch
  const reminderPromises = members.map((m) => listReminders(m.id));
  const [todayEvents, weekEvents, listsWithItems, activeCountdowns, kidPoints, todayMeals, weekMeals, dashboardTheme, foodItems, watchlistItems, allBirthdays, activeGoals, ...reminderResults] = await Promise.all([
    listEvents(familyId, todayStart, todayEnd),
    listEvents(familyId, tomorrowStart, weekEndBound),
    getAllListsWithItems(familyId),
    listCountdowns(familyId),
    getAllPoints(familyId),
    getMealsForDate(familyId, todayStr),
    getMealsForWeek(familyId, todayStr, weekEndStr),
    getTheme(familyId),
    getFoodItems(familyId),
    getWatchlist(familyId),
    getBirthdays(familyId),
    listGoals(familyId, 'active'),
    ...reminderPromises,
  ]);
  const allReminders = reminderResults.flat();

  // Generate virtual birthday events and merge into today/week events
  const birthdayEvents = getUpcomingBirthdayEvents(allBirthdays || []);

  // Format events for display
  const formatEvent = (e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    starts_at: e.starts_at,
    starts_at_raw: e.starts_at,
    ends_at_raw: e.ends_at || null,
    starts_at_display: e.all_day ? 'All day' : formatForUser(e.starts_at, tz),
    ends_at_display: e.ends_at ? formatForUser(e.ends_at, tz) : null,
    all_day: e.all_day,
    day_label: new Date(e.starts_at).toLocaleDateString('en-US', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
  });

  return {
    family_name: members.map((m) => m.display_name).join(' & '),
    members: members.map((m) => ({
      display_name: m.display_name,
      username: m.telegram_username,
    })),
    today: {
      date: new Date(now).toLocaleDateString('en-US', {
        timeZone: tz,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      events: [
        ...todayEvents.map(formatEvent),
        ...birthdayEvents.filter(b => b.starts_at.startsWith(todayStr)).map(formatEvent),
      ],
    },
    week: {
      events: [
        ...weekEvents.map(formatEvent),
        ...birthdayEvents.filter(b => !b.starts_at.startsWith(todayStr)).map(formatEvent),
      ].sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    },
    reminders: allReminders.map((r) => ({
      id: r.id,
      message: r.message,
      remind_at_display: formatForUser(r.remind_at, tz),
    })),
    lists: listsWithItems,
    countdowns: activeCountdowns.map((c) => {
      const daysUntil = Math.ceil(
        (new Date(c.target_date) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return {
        id: c.id,
        title: c.title,
        target_date: c.target_date,
        background: c.background,
        days_until: Math.max(0, daysUntil),
        created_at: c.created_at,
      };
    }),
    kid_points: kidPoints,
    meals: {
      today: todayMeals.map((m) => ({
        type: m.meal_type,
        title: m.title,
        notes: m.notes,
      })),
      week: weekMeals.map((m) => ({
        date: m.meal_date,
        type: m.meal_type,
        title: m.title,
        notes: m.notes,
        day_label: new Date(m.meal_date + 'T12:00:00').toLocaleDateString('en-US', {
          timeZone: tz,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      })),
    },
    food_items: (foodItems || []).map(f => ({
      id: f.id,
      name: f.name,
      quantity: f.quantity,
      expires_at: f.expires_at,
      days_left: Math.ceil((new Date(f.expires_at + 'T23:59:59') - new Date()) / (1000 * 60 * 60 * 24)),
    })),
    watchlist: watchlistItems || [],
    birthdays: (allBirthdays || []).map(b => {
      const [y, m, d] = b.birth_date.split('-').map(Number);
      const now = new Date();
      let nextBday = new Date(now.getFullYear(), m - 1, d);
      if (nextBday < now) nextBday = new Date(now.getFullYear() + 1, m - 1, d);
      const daysUntil = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));
      const age = nextBday.getFullYear() - y;
      return { ...b, age, days_until: daysUntil };
    }).sort((a, b) => a.days_until - b.days_until),
    goals: (activeGoals || []).map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      target_date: g.target_date,
      status: g.status,
      created_at: g.created_at,
    })),
    theme: dashboardTheme,
    updated_at: new Date().toISOString(),
  };
}
