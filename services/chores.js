import { supabase } from '../db/supabase.js';
import { adjustPoints } from './points.js';

/**
 * Add a new chore for the family.
 */
export async function addChore(familyId, { title, assigned_to, recurrence, next_due, points_reward }) {
  const { data, error } = await supabase
    .from('chores')
    .insert({
      family_id: familyId,
      title,
      assigned_to: assigned_to || null,
      recurrence: recurrence || 'once',
      next_due: next_due || new Date().toISOString().split('T')[0],
      points_reward: points_reward || 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * List chores not yet completed today, optionally filtered by person and due_by date.
 */
export async function listChores(familyId, { assigned_to, due_by } = {}) {
  const today = new Date().toISOString().split('T')[0];
  const dueCutoff = due_by || today;

  // Get chores due on or before the cutoff date
  let query = supabase
    .from('chores')
    .select('id, title, assigned_to, recurrence, next_due, points_reward, created_at')
    .eq('family_id', familyId)
    .lte('next_due', dueCutoff)
    .order('next_due', { ascending: true });

  if (assigned_to) {
    query = query.ilike('assigned_to', assigned_to);
  }

  const { data: chores, error } = await query;
  if (error) {
    if (error.code === 'PGRST205') return [];
    throw error;
  }
  if (!chores || chores.length === 0) return [];

  // Filter out chores already completed today
  const choreIds = chores.map(c => c.id);
  const { data: completions } = await supabase
    .from('chore_completions')
    .select('chore_id')
    .in('chore_id', choreIds)
    .gte('completed_at', `${today}T00:00:00`);

  const completedToday = new Set((completions || []).map(c => c.chore_id));
  return chores.filter(c => !completedToday.has(c.id));
}

/**
 * Mark a chore as completed. Optionally award points and advance next_due for recurring chores.
 */
export async function completeChore(familyId, choreId, { completed_by, award_points } = {}) {
  // Verify chore belongs to family
  const { data: chore, error: fetchError } = await supabase
    .from('chores')
    .select('*')
    .eq('id', choreId)
    .eq('family_id', familyId)
    .single();
  if (fetchError) throw fetchError;
  if (!chore) throw new Error('Chore not found');

  // Insert completion record
  const pointsAwarded = (award_points && chore.points_reward > 0) ? chore.points_reward : 0;
  const { data: completion, error: compError } = await supabase
    .from('chore_completions')
    .insert({
      chore_id: choreId,
      completed_by: completed_by || null,
      points_awarded: pointsAwarded,
    })
    .select()
    .single();
  if (compError) throw compError;

  // Advance next_due for recurring chores
  if (chore.recurrence !== 'once') {
    const currentDue = new Date(chore.next_due + 'T12:00:00');
    let daysToAdd = 0;
    if (chore.recurrence === 'daily') daysToAdd = 1;
    else if (chore.recurrence === 'weekly') daysToAdd = 7;
    else if (chore.recurrence === 'fortnightly') daysToAdd = 14;

    currentDue.setDate(currentDue.getDate() + daysToAdd);
    const newDue = currentDue.toISOString().split('T')[0];

    await supabase
      .from('chores')
      .update({ next_due: newDue })
      .eq('id', choreId);
  }

  // Award kid points if requested
  if (award_points && chore.points_reward > 0 && completed_by) {
    await adjustPoints(
      familyId,
      completed_by,
      chore.points_reward,
      `Completed chore: ${chore.title}`,
      null
    );
  }

  return { ...completion, chore_title: chore.title, points_awarded: pointsAwarded };
}

/**
 * Delete a chore by ID (must belong to family).
 */
export async function deleteChore(familyId, choreId) {
  const { error } = await supabase
    .from('chores')
    .delete()
    .eq('id', choreId)
    .eq('family_id', familyId);
  if (error) throw error;
  return { deleted: true };
}

/**
 * Get chores that are overdue (next_due < today and not completed today).
 */
export async function getOverdueChores(familyId) {
  const today = new Date().toISOString().split('T')[0];

  const { data: chores, error } = await supabase
    .from('chores')
    .select('id, title, assigned_to, recurrence, next_due, points_reward')
    .eq('family_id', familyId)
    .lt('next_due', today)
    .order('next_due', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205') return [];
    throw error;
  }
  if (!chores || chores.length === 0) return [];

  // Filter out any completed today
  const choreIds = chores.map(c => c.id);
  const { data: completions } = await supabase
    .from('chore_completions')
    .select('chore_id')
    .in('chore_id', choreIds)
    .gte('completed_at', `${today}T00:00:00`);

  const completedToday = new Set((completions || []).map(c => c.chore_id));
  return chores.filter(c => !completedToday.has(c.id));
}

/**
 * Get chores due today or earlier (for dashboard widget).
 */
export async function getTodaysChores(familyId) {
  const today = new Date().toISOString().split('T')[0];

  const { data: chores, error } = await supabase
    .from('chores')
    .select('id, title, assigned_to, recurrence, next_due, points_reward')
    .eq('family_id', familyId)
    .lte('next_due', today)
    .order('next_due', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205') return [];
    throw error;
  }
  if (!chores || chores.length === 0) return [];

  // Filter out completed today
  const choreIds = chores.map(c => c.id);
  const { data: completions } = await supabase
    .from('chore_completions')
    .select('chore_id')
    .in('chore_id', choreIds)
    .gte('completed_at', `${today}T00:00:00`);

  const completedToday = new Set((completions || []).map(c => c.chore_id));
  return chores.filter(c => !completedToday.has(c.id));
}
