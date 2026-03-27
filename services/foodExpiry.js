import { supabase } from '../db/supabase.js';

/**
 * Add a food item with an expiry date.
 */
export async function addFoodItem(familyId, name, expiresAt, quantity = null, userId = null) {
  const { data, error } = await supabase
    .from('food_items')
    .insert({
      family_id: familyId,
      name,
      expires_at: expiresAt,
      quantity,
      added_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get all food items for a family, ordered by expiry date (soonest first).
 */
export async function getFoodItems(familyId) {
  const { data, error } = await supabase
    .from('food_items')
    .select('id, name, quantity, expires_at, created_at')
    .eq('family_id', familyId)
    .order('expires_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Remove a food item by ID.
 */
export async function removeFoodItemById(itemId) {
  const { error } = await supabase
    .from('food_items')
    .delete()
    .eq('id', itemId);
  if (error) throw error;
  return { deleted: true };
}

/**
 * Remove a food item by fuzzy name match.
 */
export async function removeFoodItem(familyId, itemName) {
  const items = await getFoodItems(familyId);
  const needle = itemName.toLowerCase().trim();

  // Exact match first
  let match = items.find(i => i.name.toLowerCase() === needle);
  // Substring match
  if (!match) match = items.find(i => i.name.toLowerCase().includes(needle));
  // Reverse substring
  if (!match) match = items.find(i => needle.includes(i.name.toLowerCase()));

  if (!match) return null;

  await supabase.from('food_items').delete().eq('id', match.id);
  return match;
}

/**
 * Remove expired items (past their expiry date).
 */
export async function removeExpiredItems(familyId) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('food_items')
    .delete()
    .eq('family_id', familyId)
    .lt('expires_at', today)
    .select();
  if (error) throw error;
  return data || [];
}
