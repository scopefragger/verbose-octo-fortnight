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

  const { day_type, parking_booked, destination, flight_booked, hotel_booked,
          expense_submitted, expense_received, notes } = fields;

  const { data, error } = await supabase
    .from('office_checkin_days')
    .upsert(
      {
        family_id: familyId,
        day_date: dayDate,
        day_type,
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

  const officeDays   = rows.filter(r => r.day_type === 'office').length;
  const travelDays   = rows.filter(r => r.day_type === 'travel').length;
  const timeOffDays  = rows.filter(r => r.day_type === 'time_off').length;

  // Travel counts as an attending day; bank holidays + time-off reduce the denominator
  const attendingDays = officeDays + travelDays;
  const eligibleDays  = Math.max(totalWorkingDays - timeOffDays - bankHolidayDays, 0);

  const attendancePct = eligibleDays > 0
    ? Math.round(attendingDays / eligibleDays * 100)
    : 0;

  const targetMet = eligibleDays > 0
    ? (attendingDays / eligibleDays) >= 0.40
    : false;

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
    attendingDays,
    eligibleDays,
    attendancePct,
    targetMet,
    bookingIssuesCount: bookingIssues.length,
    bookingIssueDates: bookingIssues.map(r => r.day_date),
    pendingExpensesCount: pendingExpenses.length,
    pendingExpenseDates: pendingExpenses.map(r => r.day_date),
  };
}
