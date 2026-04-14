import { supabase } from '../db/supabase.js';
import { getUKHolidays } from './holidays.js';

/**
 * Upsert a day entry. Rejects weekends.
 */
export async function upsertDay(familyId, dayDate, fields) {
  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayDate)) {
    throw new Error('Invalid date format — use YYYY-MM-DD');
  }

  // Reject weekends (0 = Sunday, 6 = Saturday)
  const dow = new Date(dayDate + 'T12:00:00Z').getUTCDay();
  if (dow === 0 || dow === 6) {
    throw new Error('Cannot log a weekend day');
  }

  const { day_type, confirmed, parking_booked, destination, flight_booked, hotel_booked,
          expense_submitted, expense_received, notes } = fields;

  const { data, error } = await supabase
    .from('office_checkin_days')
    .upsert(
      {
        family_id: familyId,
        day_date: dayDate,
        day_type,
        confirmed: confirmed ?? false,
        parking_booked: parking_booked ?? false,
        destination: destination ?? null,
        flight_booked: flight_booked ?? false,
        hotel_booked: hotel_booked ?? false,
        expense_submitted: expense_submitted ?? false,
        expense_received: expense_received ?? false,
        notes: notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'family_id,day_date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all logged days within an arbitrary date range (YYYY-MM-DD strings).
 * Used by the dashboard to merge office days into the calendar view.
 */
export async function getDaysInRange(familyId, startDate, endDate) {
  const { data, error } = await supabase
    .from('office_checkin_days')
    .select('*')
    .eq('family_id', familyId)
    .gte('day_date', startDate)
    .lte('day_date', endDate)
    .order('day_date');
  if (error) throw error;
  return data;
}

/**
 * Convert office_checkin_days rows into dashboard-compatible event objects.
 * These are virtual (no real row in the events table) — identified by is_office_checkin flag.
 */
export function formatAsEvents(days) {
  return days.map(day => {
    const emoji = day.day_type === 'office' ? '🏢'
                : day.day_type === 'travel'  ? '✈️'
                : '🏖️';
    const label = day.day_type === 'office' ? 'Office'
                : day.day_type === 'travel'  ? (day.destination || 'Travel')
                : 'Time Off';
    return {
      id: `office-checkin-${day.id}`,
      title: `${emoji} ${label}`,
      description: day.notes || null,
      starts_at: `${day.day_date}T09:00:00`,
      ends_at: null,
      all_day: true,
      is_office_checkin: true,
    };
  });
}

/**
 * Delete a day entry by date. Scoped by both date and family_id.
 */
export async function deleteDay(familyId, dayDate) {
  const { data, error } = await supabase
    .from('office_checkin_days')
    .delete()
    .eq('family_id', familyId)
    .eq('day_date', dayDate)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all logged days for a given month.
 */
export async function getDaysForMonth(familyId, year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  // Last day: day 0 of next month = last day of this month
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('office_checkin_days')
    .select('*')
    .eq('family_id', familyId)
    .gte('day_date', start)
    .lte('day_date', end)
    .order('day_date');

  if (error) throw error;
  return data;
}

/**
 * Compute attendance statistics for a month.
 *
 * officeDays     = days with day_type 'office'
 * travelDays     = days with day_type 'travel'
 * timeOffDays    = days with day_type 'time_off'
 * totalWorkingDays = Mon–Fri count in the month (exact, no approximation)
 * eligibleDays   = totalWorkingDays - timeOffDays (min 0)
 * attendancePct  = round(officeDays / eligibleDays * 100)  [0 if eligibleDays = 0]
 * targetMet      = (officeDays / eligibleDays) >= 0.40     [false if eligibleDays = 0]
 * bookingIssues  = office days missing parking + travel days missing flight or hotel
 * pendingExpenses= days where expense_submitted && !expense_received
 */
export async function getMonthStats(familyId, year, month) {
  const rows = await getDaysForMonth(familyId, year, month);

  // Count Mon–Fri in the month by iterating every day
  let totalWorkingDays = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay(); // 0=Sun, 6=Sat
    if (dow !== 0 && dow !== 6) totalWorkingDays++;
  }

  // Bank holidays that fall on a weekday in this month reduce eligible days
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
  const bankHolidayDates = new Set(
    getUKHolidays(year)
      .filter(h => h.description === 'Bank Holiday' && h.date.startsWith(monthPrefix))
      .filter(h => {
        const dow = new Date(h.date + 'T12:00:00Z').getUTCDay();
        return dow !== 0 && dow !== 6;
      })
      .map(h => h.date)
  );
  const bankHolidayDays = bankHolidayDates.size;

  const officeDays  = rows.filter(r => r.day_type === 'office').length;
  const travelDays  = rows.filter(r => r.day_type === 'travel').length;
  const timeOffDays = rows.filter(r => r.day_type === 'time_off').length;

  // Travel counts as an attending day; bank holidays + time-off reduce the denominator
  const plannedDays  = officeDays + travelDays;   // all logged office/travel
  const confirmedDays = rows.filter(r =>           // actually attended
    (r.day_type === 'office' || r.day_type === 'travel') && r.confirmed
  ).length;
  const eligibleDays = Math.max(totalWorkingDays - timeOffDays - bankHolidayDays, 0);

  const plannedPct  = eligibleDays > 0 ? Math.round(plannedDays   / eligibleDays * 100) : 0;
  const actualPct   = eligibleDays > 0 ? Math.round(confirmedDays / eligibleDays * 100) : 0;

  const plannedTargetMet  = eligibleDays > 0 ? (plannedDays   / eligibleDays) >= 0.40 : false;
  const actualTargetMet   = eligibleDays > 0 ? (confirmedDays / eligibleDays) >= 0.40 : false;

  // Keep these for backwards compat with anything else that reads them
  const attendingDays = plannedDays;
  const attendancePct = plannedPct;
  const targetMet     = plannedTargetMet;

  const bookingIssues = rows.filter(r => {
    if (r.day_type === 'office')  return !r.parking_booked;
    if (r.day_type === 'travel')  return !r.flight_booked || !r.hotel_booked;
    return false;
  });

  const pendingExpenses = rows.filter(r =>
    (r.day_type === 'office' || r.day_type === 'travel') &&
    r.expense_submitted && !r.expense_received
  );

  return {
    totalWorkingDays,
    bankHolidayDays,
    officeDays,
    travelDays,
    timeOffDays,
    plannedDays,
    confirmedDays,
    eligibleDays,
    plannedPct,
    actualPct,
    plannedTargetMet,
    actualTargetMet,
    // kept for backwards compat
    attendingDays,
    attendancePct,
    targetMet,
    bookingIssuesCount: bookingIssues.length,
    bookingIssueDates: bookingIssues.map(r => r.day_date),
    pendingExpensesCount: pendingExpenses.length,
    pendingExpenseDates: pendingExpenses.map(r => r.day_date),
  };
}
