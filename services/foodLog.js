import { supabase } from '../db/supabase.js';

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export async function logFood(familyId, userId, entry) {
  const type = (entry.meal_type || '').toLowerCase();
  if (!VALID_MEAL_TYPES.includes(type)) {
    throw new Error(`Invalid meal_type "${entry.meal_type}". Must be one of: ${VALID_MEAL_TYPES.join(', ')}`);
  }
  if (!entry.food_name?.trim()) throw new Error('food_name is required');

  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      family_id: familyId,
      user_id:   userId,
      food_name: entry.food_name.trim(),
      calories:  entry.calories  ?? null,
      meal_type: type,
      notes:     entry.notes     ?? null,
      logged_at: entry.logged_at ?? new Date().toLocaleDateString('en-CA'),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDailyLog(familyId, userId, date) {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .eq('logged_at', date)
    .order('meal_type')
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function getDailySummary(familyId, userId, date) {
  const entries = await getDailyLog(familyId, userId, date);
  return {
    total_calories: entries.reduce((s, e) => s + (e.calories || 0), 0),
    entry_count:    entries.length,
  };
}

export async function deleteLogEntry(entryId, familyId, userId) {
  const { data, error } = await supabase
    .from('food_logs')
    .delete()
    .eq('id', entryId)
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getNutritionGoal(familyId, userId) {
  const { data, error } = await supabase
    .from('nutrition_goals')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function setNutritionGoal(familyId, userId, { daily_calories }) {
  const { data, error } = await supabase
    .from('nutrition_goals')
    .upsert(
      {
        family_id:      familyId,
        user_id:        userId,
        daily_calories: daily_calories ?? null,
        updated_at:     new Date().toISOString(),
      },
      { onConflict: 'family_id,user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
