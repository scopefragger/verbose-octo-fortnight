import { supabase } from '../db/supabase.js';

/**
 * Create a calendar event.
 */
export async function createEvent(familyId, userId, { title, description, starts_at, ends_at, all_day }) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      family_id: familyId,
      created_by: userId,
      title,
      description: description || null,
      starts_at,
      ends_at: ends_at || null,
      all_day: all_day || false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * List events in a date range for a family.
 */
export async function listEvents(familyId, startDate, endDate) {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, description, starts_at, ends_at, all_day, created_by')
    .eq('family_id', familyId)
    .gte('starts_at', startDate)
    .lte('starts_at', endDate)
    .order('starts_at');
  if (error) throw error;
  return data;
}

/**
 * Delete an event by ID.
 */
export async function deleteEvent(eventId, familyId) {
  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Find and delete an event by title and/or date (fuzzy match).
 * Returns the deleted event, or null if no match found.
 */
export async function findAndDeleteEvent(familyId, { title, date }) {
  let query = supabase
    .from('events')
    .select('id, title, starts_at')
    .eq('family_id', familyId)
    .order('starts_at');

  if (date) {
    // Match events starting on that date (any time)
    query = query.gte('starts_at', `${date}T00:00:00`).lte('starts_at', `${date}T23:59:59`);
  }

  const { data: events, error } = await query;
  if (error) throw error;
  if (!events || events.length === 0) return null;

  let match;
  if (title) {
    const needle = title.toLowerCase().trim();
    // Exact title match first
    match = events.find((e) => e.title.toLowerCase() === needle);
    // Then substring match
    if (!match) match = events.find((e) => e.title.toLowerCase().includes(needle));
    // Then reverse substring (search term contains event title)
    if (!match) match = events.find((e) => needle.includes(e.title.toLowerCase()));
  }

  // If no title given or no title match, use the first event on that date
  if (!match) {
    if (!date) return null; // Need at least a title or date match
    match = events[0];
  }

  return deleteEvent(match.id, familyId);
}

/**
 * Get a single event by ID.
 */
export async function getEvent(eventId) {
  const { data, error } = await supabase
    .from('events')
    .select()
    .eq('id', eventId)
    .single();
  if (error) throw error;
  return data;
}
