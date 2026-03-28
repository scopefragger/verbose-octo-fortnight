import { supabase } from '../db/supabase.js';

/**
 * Get all watchlist items for a family.
 */
export async function getWatchlist(familyId, includeWatched = false) {
  let query = supabase
    .from('watchlist')
    .select('id, title, type, platform, watched, watched_at, rating, notes, created_at')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (!includeWatched) {
    query = query.eq('watched', false);
  }

  const { data, error } = await query;
  if (error) {
    // Table might not exist yet — fail gracefully
    if (error.code === 'PGRST205') return [];
    throw error;
  }
  return data || [];
}

/**
 * Add an item to the watchlist.
 */
export async function addToWatchlist(familyId, { title, type, platform, notes }, userId) {
  const { data, error } = await supabase
    .from('watchlist')
    .insert({
      family_id: familyId,
      title,
      type: type || 'movie',
      platform: platform || null,
      notes: notes || null,
      added_by: userId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Mark an item as watched.
 */
export async function markWatched(itemId, familyId, rating) {
  const { data, error } = await supabase
    .from('watchlist')
    .update({
      watched: true,
      watched_at: new Date().toISOString(),
      rating: rating || null,
    })
    .eq('id', itemId)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Remove an item from the watchlist.
 */
export async function removeFromWatchlist(itemId, familyId) {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('id', itemId)
    .eq('family_id', familyId);
  if (error) throw error;
  return { deleted: true };
}
