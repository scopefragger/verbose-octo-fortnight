import { supabase } from '../db/supabase.js';

const BACKGROUNDS = ['fireworks', 'castle', 'stars', 'rainbow', 'beach', 'party'];

export async function createCountdown(familyId, { title, target_date, background }) {
  const bg = BACKGROUNDS.includes(background) ? background : 'fireworks';
  const { data, error } = await supabase
    .from('countdowns')
    .insert({ family_id: familyId, title, target_date, background: bg })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listCountdowns(familyId) {
  const { data, error } = await supabase
    .from('countdowns')
    .select('*')
    .eq('family_id', familyId)
    .gte('target_date', new Date().toISOString().split('T')[0])
    .order('target_date', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateCountdown(countdownId, familyId, { title, target_date, background }) {
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (target_date !== undefined) updates.target_date = target_date;
  if (background !== undefined) updates.background = BACKGROUNDS.includes(background) ? background : undefined;
  // Remove undefined values
  Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

  const { data, error } = await supabase
    .from('countdowns')
    .update(updates)
    .eq('id', countdownId)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCountdown(countdownId, familyId) {
  const { data, error } = await supabase
    .from('countdowns')
    .delete()
    .eq('id', countdownId)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
