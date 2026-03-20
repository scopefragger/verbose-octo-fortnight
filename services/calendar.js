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
