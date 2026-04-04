import { supabase } from '../db/supabase.js';

export async function createGoal(familyId, { title, description, target_date }, userId) {
  const { data, error } = await supabase
    .from('family_goals')
    .insert({
      family_id: familyId,
      title,
      description: description || null,
      target_date: target_date || null,
      created_by: userId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listGoals(familyId, status = 'active') {
  let query = supabase
    .from('family_goals')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getGoal(goalId, familyId) {
  const { data, error } = await supabase
    .from('family_goals')
    .select('*')
    .eq('id', goalId)
    .eq('family_id', familyId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateGoal(goalId, familyId, updates) {
  const allowed = {};
  if (updates.title) allowed.title = updates.title;
  if (updates.description !== undefined) allowed.description = updates.description;
  if (updates.target_date !== undefined) allowed.target_date = updates.target_date;
  if (updates.status) {
    allowed.status = updates.status;
    if (updates.status === 'completed') {
      allowed.completed_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('family_goals')
    .update(allowed)
    .eq('id', goalId)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGoal(goalId, familyId) {
  const { data, error } = await supabase
    .from('family_goals')
    .delete()
    .eq('id', goalId)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addProgress(goalId, note, userId) {
  const { data, error } = await supabase
    .from('goal_progress')
    .insert({
      goal_id: goalId,
      note,
      added_by: userId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProgress(goalId) {
  const { data, error } = await supabase
    .from('goal_progress')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
