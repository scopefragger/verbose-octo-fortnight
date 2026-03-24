import { createEvent } from './calendar.js';

/**
 * UK holidays and notable dates for a given year.
 * Easter dates must be calculated per year.
 */
function getEasterSunday(year) {
  // Anonymous Gregorian algorithm
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getFirstMonday(year, month) {
  const d = new Date(year, month, 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return d;
}

function getLastMonday(year, month) {
  const d = new Date(year, month + 1, 0); // last day of month
  while (d.getDay() !== 1) d.setDate(d.getDate() - 1);
  return d;
}

function getThirdSunday(year, month) {
  const d = new Date(year, month, 1);
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + 14); // 3rd Sunday
  return d;
}

function getObservedDate(year, month, day) {
  const d = new Date(year, month, day);
  const dow = d.getDay();
  if (dow === 6) d.setDate(d.getDate() + 2); // Sat → Mon
  if (dow === 0) d.setDate(d.getDate() + 1); // Sun → Mon
  return d;
}

export function getUKHolidays(year) {
  const easter = getEasterSunday(year);
  const goodFriday = addDays(easter, -2);
  const easterMonday = addDays(easter, 1);
  const motheringSunday = addDays(easter, -21);

  return [
    { date: formatDate(getObservedDate(year, 0, 1)), title: "New Year's Day", description: 'Bank Holiday' },
    { date: formatDate(new Date(year, 1, 14)), title: "Valentine's Day", description: '' },
    { date: formatDate(motheringSunday), title: "Mother's Day", description: 'Mothering Sunday' },
    { date: formatDate(goodFriday), title: 'Good Friday', description: 'Bank Holiday' },
    { date: formatDate(easter), title: 'Easter Sunday', description: '' },
    { date: formatDate(easterMonday), title: 'Easter Monday', description: 'Bank Holiday' },
    { date: formatDate(getFirstMonday(year, 4)), title: 'Early May Bank Holiday', description: 'Bank Holiday' },
    { date: formatDate(getLastMonday(year, 4)), title: 'Spring Bank Holiday', description: 'Bank Holiday' },
    { date: formatDate(getThirdSunday(year, 5)), title: "Father's Day", description: '' },
    { date: formatDate(getLastMonday(year, 7)), title: 'Summer Bank Holiday', description: 'Bank Holiday' },
    { date: formatDate(new Date(year, 9, 31)), title: 'Halloween', description: 'Trick or Treat!' },
    { date: formatDate(new Date(year, 10, 5)), title: 'Bonfire Night', description: 'Remember, remember the 5th of November' },
    { date: formatDate(getObservedDate(year, 11, 25)), title: 'Christmas Day', description: 'Bank Holiday' },
    { date: formatDate(getObservedDate(year, 11, 26)), title: 'Boxing Day', description: 'Bank Holiday' },
    { date: formatDate(new Date(year, 11, 31)), title: "New Year's Eve", description: '' },
  ];
}

/**
 * Seed UK holidays for a given year into the calendar.
 * Skips any holidays that already exist (by title + date match).
 */
export async function seedUKHolidays(familyId, userId, year) {
  const holidays = getUKHolidays(year);
  const results = [];

  for (const h of holidays) {
    try {
      const event = await createEvent(familyId, userId, {
        title: h.title,
        description: h.description || null,
        starts_at: `${h.date}T00:00:00`,
        all_day: true,
      });
      results.push({ title: h.title, date: h.date, status: 'created' });
    } catch (err) {
      results.push({ title: h.title, date: h.date, status: 'error', error: err.message });
    }
  }

  return results;
}
