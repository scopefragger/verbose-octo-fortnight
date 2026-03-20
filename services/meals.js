import { supabase } from '../db/supabase.js';

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

/**
 * Set a meal for a specific date and meal type.
 * Upserts — replaces any existing meal in that slot.
 */
export async function setMeal(familyId, { meal_date, meal_type, title, notes }, userId) {
  const type = (meal_type || '').toLowerCase();
  if (!VALID_MEAL_TYPES.includes(type)) {
    throw new Error(`Invalid meal type "${meal_type}". Must be one of: ${VALID_MEAL_TYPES.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('meal_plans')
    .upsert(
      {
        family_id: familyId,
        meal_date,
        meal_type: type,
        title,
        notes: notes || null,
        created_by: userId,
      },
      { onConflict: 'family_id,meal_date,meal_type' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get meals for a specific date.
 */
export async function getMealsForDate(familyId, date) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('family_id', familyId)
    .eq('meal_date', date)
    .order('meal_type');

  if (error) throw error;
  return data || [];
}

/**
 * Get meals for a date range (e.g. a full week).
 */
export async function getMealsForWeek(familyId, startDate, endDate) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('family_id', familyId)
    .gte('meal_date', startDate)
    .lte('meal_date', endDate)
    .order('meal_date')
    .order('meal_type');

  if (error) throw error;
  return data || [];
}

/**
 * Remove a meal from a specific slot.
 */
export async function removeMeal(familyId, mealDate, mealType) {
  const type = (mealType || '').toLowerCase();

  const { data, error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('family_id', familyId)
    .eq('meal_date', mealDate)
    .eq('meal_type', type)
    .select()
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Clear all meals for a specific date.
 */
export async function clearMealsForDate(familyId, date) {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('family_id', familyId)
    .eq('meal_date', date);

  if (error) throw error;
  return { cleared: true, date };
}
