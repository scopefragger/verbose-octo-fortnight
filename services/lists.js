import { supabase } from '../db/supabase.js';

/**
 * Get or create a list by name within a family.
 */
async function getOrCreateList(familyId, listName) {
  const normalized = listName.toLowerCase().trim();

  // Try to find existing list (case-insensitive)
  const { data: existing } = await supabase
    .from('lists')
    .select()
    .eq('family_id', familyId)
    .ilike('name', normalized)
    .single();

  if (existing) return existing;

  // Create new list
  const { data: created, error } = await supabase
    .from('lists')
    .insert({ family_id: familyId, name: normalized })
    .select()
    .single();
  if (error) throw error;
  return created;
}

/**
 * Get all items on a list.
 */
export async function getList(familyId, listName) {
  const list = await getOrCreateList(familyId, listName);
  const { data: items, error } = await supabase
    .from('list_items')
    .select('id, text, checked, added_by')
    .eq('list_id', list.id)
    .order('sort_order')
    .order('created_at');
  if (error) throw error;
  return { list, items };
}

/**
 * Add an item to a list (auto-creates list if needed).
 */
export async function addItem(familyId, listName, text, userId) {
  const list = await getOrCreateList(familyId, listName);
  const { data, error } = await supabase
    .from('list_items')
    .insert({ list_id: list.id, text, added_by: userId })
    .select()
    .single();
  if (error) throw error;
  return { list, item: data };
}

/**
 * Check off an item by fuzzy text match.
 */
export async function checkItem(familyId, listName, itemText) {
  const { list, items } = await getList(familyId, listName);
  const match = findClosestItem(items, itemText);
  if (!match) return null;

  await supabase
    .from('list_items')
    .update({ checked: true })
    .eq('id', match.id);
  return { list, item: { ...match, checked: true } };
}

/**
 * Remove an item by fuzzy text match.
 */
export async function removeItem(familyId, listName, itemText) {
  const { list, items } = await getList(familyId, listName);
  const match = findClosestItem(items, itemText);
  if (!match) return null;

  await supabase.from('list_items').delete().eq('id', match.id);
  return { list, item: match };
}

/**
 * Create a new empty list.
 */
export async function createList(familyId, listName) {
  const list = await getOrCreateList(familyId, listName);
  return list;
}

/**
 * Clear all items from a list.
 */
export async function clearList(familyId, listName) {
  const list = await getOrCreateList(familyId, listName);
  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', list.id);
  if (error) throw error;
  return list;
}

/**
 * Get all lists for a family.
 */
export async function getAllLists(familyId) {
  const { data, error } = await supabase
    .from('lists')
    .select('id, name')
    .eq('family_id', familyId)
    .order('created_at');
  if (error) throw error;
  return data;
}

/**
 * Find the closest matching item by text (case-insensitive substring).
 */
function findClosestItem(items, searchText) {
  const needle = searchText.toLowerCase().trim();
  // Exact match first
  const exact = items.find((i) => i.text.toLowerCase() === needle);
  if (exact) return exact;
  // Substring match
  return items.find((i) => i.text.toLowerCase().includes(needle)) || null;
}
