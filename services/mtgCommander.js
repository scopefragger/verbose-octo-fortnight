import { supabase } from '../db/supabase.js';

export async function listDecklists(familyId) {
  const { data, error } = await supabase
    .from('mtg_decklists')
    .select('id, name, commander, partner, created_at, updated_at')
    .eq('family_id', familyId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getDecklist(id, familyId) {
  const { data, error } = await supabase
    .from('mtg_decklists')
    .select('*')
    .eq('id', id)
    .eq('family_id', familyId)
    .single();
  if (error) throw error;
  return data;
}

export async function saveDecklist(familyId, { name, commander, partner, cards, tokens }) {
  const { data, error } = await supabase
    .from('mtg_decklists')
    .insert({
      family_id: familyId,
      name,
      commander: commander || null,
      partner: partner || null,
      cards: cards || [],
      tokens: tokens || [],
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDecklist(id, familyId, updates) {
  const allowed = {};
  if (updates.name !== undefined) allowed.name = updates.name;
  if (updates.commander !== undefined) allowed.commander = updates.commander;
  if (updates.partner !== undefined) allowed.partner = updates.partner;
  if (updates.cards !== undefined) allowed.cards = updates.cards;
  if (updates.tokens !== undefined) allowed.tokens = updates.tokens;
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('mtg_decklists')
    .update(allowed)
    .eq('id', id)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDecklist(id, familyId) {
  const { data, error } = await supabase
    .from('mtg_decklists')
    .delete()
    .eq('id', id)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
