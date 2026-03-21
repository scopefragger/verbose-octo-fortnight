import { supabase } from '../db/supabase.js';

const POINTS_PER_MICKEY = 20;

/**
 * Get or create a kid's point record.
 */
async function getOrCreateKid(familyId, kidName) {
  const normalized = kidName.trim();

  // Try to find existing (case-insensitive)
  const { data: existing } = await supabase
    .from('kid_points')
    .select('*')
    .eq('family_id', familyId)
    .ilike('kid_name', normalized);

  if (existing && existing.length > 0) return existing[0];

  // Create new
  const { data, error } = await supabase
    .from('kid_points')
    .insert({ family_id: familyId, kid_name: normalized, points: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Add or remove points for a kid. change can be negative.
 */
export async function adjustPoints(familyId, kidName, change, reason, userId) {
  const kid = await getOrCreateKid(familyId, kidName);
  const newTotal = Math.max(0, kid.points + change);

  const { data, error } = await supabase
    .from('kid_points')
    .update({ points: newTotal })
    .eq('id', kid.id)
    .select()
    .single();
  if (error) throw error;

  // Log history
  await supabase.from('point_history').insert({
    kid_points_id: kid.id,
    change,
    reason,
    added_by: userId,
  });

  return {
    kid_name: data.kid_name,
    total_points: data.points,
    mickey_heads: Math.floor(data.points / POINTS_PER_MICKEY),
    remaining_points: data.points % POINTS_PER_MICKEY,
    points_to_next_mickey: POINTS_PER_MICKEY - (data.points % POINTS_PER_MICKEY),
  };
}

/**
 * Get points for all kids in the family.
 */
export async function getAllPoints(familyId) {
  const { data, error } = await supabase
    .from('kid_points')
    .select('*')
    .eq('family_id', familyId)
    .order('kid_name');
  if (error) throw error;

  return (data || []).map((kid) => ({
    kid_name: kid.kid_name,
    total_points: kid.points,
    mickey_heads: Math.floor(kid.points / POINTS_PER_MICKEY),
    remaining_points: kid.points % POINTS_PER_MICKEY,
    points_to_next_mickey: POINTS_PER_MICKEY - (kid.points % POINTS_PER_MICKEY),
  }));
}

/**
 * Get recent point history for a kid.
 */
export async function getPointHistory(familyId, kidName) {
  const kid = await getOrCreateKid(familyId, kidName);

  const { data, error } = await supabase
    .from('point_history')
    .select('change, reason, created_at')
    .eq('kid_points_id', kid.id)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;

  return { kid_name: kid.kid_name, points: kid.points, history: data || [] };
}
