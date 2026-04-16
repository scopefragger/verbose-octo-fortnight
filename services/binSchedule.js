import { supabase } from '../db/supabase.js';

/**
 * Upsert the bin collection schedule for a family.
 * reference_date is a YYYY-MM-DD date when bins[0] is/was collected — anchors the rotation.
 */
export async function upsertBinSchedule(familyId, { collection_day, bins, reference_date }) {
  const { data, error } = await supabase
    .from('bin_schedule')
    .upsert(
      { family_id: familyId, collection_day, bins, reference_date },
      { onConflict: 'family_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get the bin schedule for a family, or null if not configured.
 */
export async function getBinSchedule(familyId) {
  const { data, error } = await supabase
    .from('bin_schedule')
    .select('*')
    .eq('family_id', familyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Calculate the next bin collection on or after fromDate.
 *
 * Returns { bin, collectionDate, daysUntil, isToday, isTomorrow } or null if not configured.
 *
 * Algorithm:
 *   1. Find the next occurrence of collection_day on or after fromDate.
 *   2. Count whole weeks from reference_date to that date.
 *   3. binIndex = weeksDiff % bins.length  (safe modulo handles negatives).
 */
export async function getNextCollection(familyId, fromDate = new Date()) {
  const schedule = await getBinSchedule(familyId);
  if (!schedule || !schedule.bins?.length) return null;

  const { collection_day, bins, reference_date } = schedule;

  // Work at noon UTC to avoid DST edge cases
  const fd = new Date(fromDate);
  fd.setUTCHours(12, 0, 0, 0);

  const fdDay = fd.getUTCDay(); // 0=Sun … 6=Sat
  const daysAhead = (collection_day - fdDay + 7) % 7;
  const collDate = new Date(fd);
  collDate.setUTCDate(collDate.getUTCDate() + daysAhead);

  // Weeks since reference_date (both are the same weekday, so always a whole number)
  const refDate = new Date(reference_date + 'T12:00:00Z');
  const daysDiff = Math.round((collDate - refDate) / (1000 * 60 * 60 * 24));
  const weeksDiff = Math.round(daysDiff / 7);
  const binIndex = ((weeksDiff % bins.length) + bins.length) % bins.length;
  const bin = bins[binIndex];

  const collectionDateStr = collDate.toISOString().split('T')[0];

  // daysUntil relative to today (not fromDate)
  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);
  const daysUntil = Math.round((collDate - today) / (1000 * 60 * 60 * 24));

  return {
    bin,
    collectionDate: collectionDateStr,
    daysUntil,
    isToday: daysUntil === 0,
    isTomorrow: daysUntil === 1,
  };
}
