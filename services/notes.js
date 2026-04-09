import { supabase } from '../db/supabase.js';

/**
 * Save (insert or update) a named note for a family.
 * On conflict of (family_id, name), updates content, is_sensitive and updated_at.
 */
export async function saveNote(familyId, { name, content, is_sensitive }, userId) {
  const { data, error } = await supabase
    .from('notes')
    .upsert(
      {
        family_id: familyId,
        name,
        content,
        is_sensitive: is_sensitive ?? false,
        created_by: userId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'family_id,name' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Find a note by exact name (case-insensitive).
 */
export async function getNote(familyId, name) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('family_id', familyId)
    .ilike('name', name)
    .maybeSingle();
  if (error) {
    if (error.code === 'PGRST205') return null;
    throw error;
  }
  return data;
}

/**
 * Search notes where name or content matches query (case-insensitive substring).
 */
export async function searchNotes(familyId, query) {
  const pattern = `%${query}%`;
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('family_id', familyId)
    .or(`name.ilike.${pattern},content.ilike.${pattern}`)
    .order('name', { ascending: true });
  if (error) {
    if (error.code === 'PGRST205') return [];
    throw error;
  }
  return data || [];
}

/**
 * List all notes for a family (id, name, is_sensitive, created_at only — no content).
 */
export async function listNotes(familyId) {
  const { data, error } = await supabase
    .from('notes')
    .select('id, name, is_sensitive, created_at')
    .eq('family_id', familyId)
    .order('name', { ascending: true });
  if (error) {
    if (error.code === 'PGRST205') return [];
    throw error;
  }
  return data || [];
}

/**
 * Delete a note by id.
 */
export async function deleteNote(familyId, noteId) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('family_id', familyId);
  if (error) throw error;
  return { deleted: true };
}

/**
 * Update a note's fields by id.
 */
export async function updateNote(familyId, noteId, { name, content, is_sensitive }) {
  const updates = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name;
  if (content !== undefined) updates.content = content;
  if (is_sensitive !== undefined) updates.is_sensitive = is_sensitive;

  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
