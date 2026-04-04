import { supabase } from '../db/supabase.js';

export async function saveHouseDesign(familyId, builderName, choices) {
  const { data, error } = await supabase
    .from('house_designs')
    .insert({
      family_id: familyId,
      builder_name: builderName,
      choices,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listHouseDesigns(familyId) {
  const { data, error } = await supabase
    .from('house_designs')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function getHouseDesign(id) {
  const { data, error } = await supabase
    .from('house_designs')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteHouseDesign(id, familyId) {
  const { data, error } = await supabase
    .from('house_designs')
    .delete()
    .eq('id', id)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
