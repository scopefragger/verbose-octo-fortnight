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
 * Remove an item directly by its ID (used by dashboard UI).
 */
export async function removeItemById(itemId) {
  const { error } = await supabase.from('list_items').delete().eq('id', itemId);
  if (error) throw error;
  return { deleted: true };
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
 * Get all lists with their items in a single efficient query (for dashboard).
 */
export async function getAllListsWithItems(familyId) {
  // Get all lists
  const { data: lists, error } = await supabase
    .from('lists')
    .select('id, name')
    .eq('family_id', familyId)
    .order('created_at');
  if (error) throw error;
  if (!lists || lists.length === 0) return [];

  // Deduplicate lists by name (keep the oldest one per name)
  const uniqueLists = [];
  const seenNames = new Set();
  const allListIds = [];
  for (const list of lists) {
    const key = list.name.toLowerCase();
    allListIds.push(list.id);
    if (!seenNames.has(key)) {
      seenNames.add(key);
      uniqueLists.push(list);
    }
  }

  // Fetch items in batches of 50 list IDs to avoid request size limits
  const allItems = [];
  for (let i = 0; i < allListIds.length; i += 50) {
    const batch = allListIds.slice(i, i + 50);
    const { data: items, error: itemsErr } = await supabase
      .from('list_items')
      .select('id, list_id, text, checked')
      .in('list_id', batch)
      .order('created_at');
    if (itemsErr) throw itemsErr;
    allItems.push(...(items || []));
  }

  // Group items by list name (merge duplicates)
  const itemsByName = {};
  const listIdToName = {};
  for (const list of lists) {
    listIdToName[list.id] = list.name.toLowerCase();
  }
  for (const item of allItems) {
    const name = listIdToName[item.list_id];
    if (!itemsByName[name]) itemsByName[name] = [];
    itemsByName[name].push(item);
  }

  return uniqueLists.map((list) => ({
    name: list.name,
    items: itemsByName[list.name.toLowerCase()] || [],
  }));
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
