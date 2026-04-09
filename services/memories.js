import { supabase } from '../db/supabase.js';

/**
 * Add a new memory for the family.
 */
export async function addMemory(familyId, { caption, photo_file_id, category, memory_date }, userId) {
  const { data, error } = await supabase
    .from('memories')
    .insert({
      family_id: familyId,
      caption: caption || null,
      photo_file_id: photo_file_id || null,
      category: category || null,
      memory_date: memory_date || new Date().toISOString().split('T')[0],
      added_by: userId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * List memories for a family, optionally filtered by category and/or date range.
 */
export async function listMemories(familyId, { category, from_date, to_date } = {}) {
  let query = supabase
    .from('memories')
    .select('*')
    .eq('family_id', familyId)
    .order('memory_date', { ascending: false });

  if (category) query = query.eq('category', category);
  if (from_date) query = query.gte('memory_date', from_date);
  if (to_date) query = query.lte('memory_date', to_date);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Get memories from the same day (month + day) in prior years.
 */
export async function getOnThisDay(familyId) {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const currentYear = today.getFullYear();

  // Use Supabase to filter by month and day using PostgreSQL date functions
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('family_id', familyId)
    .lt('memory_date', `${currentYear}-01-01`)
    .order('memory_date', { ascending: false });

  if (error) throw error;

  // Filter to same month+day
  return (data || []).filter(m => {
    const d = new Date(m.memory_date + 'T12:00:00');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return mm === month && dd === day;
  });
}

/**
 * Delete a memory by id, scoped to the family.
 */
export async function deleteMemory(familyId, memoryId) {
  const { data, error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
