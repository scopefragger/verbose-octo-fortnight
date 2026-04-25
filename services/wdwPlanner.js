import { supabase } from '../db/supabase.js';

export async function createHoliday(familyId, { name, start_date, end_date }) {
  const { data, error } = await supabase
    .from('wdw_holidays')
    .insert({ family_id: familyId, name, start_date, end_date })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listHolidays(familyId) {
  const { data, error } = await supabase
    .from('wdw_holidays')
    .select('*')
    .eq('family_id', familyId)
    .is('archived_at', null)
    .order('start_date');
  if (error) throw error;
  return data || [];
}

export async function addMealOption(familyId, holidayId, { meal_id, meal_name, url }) {
  const { data: existing } = await supabase
    .from('wdw_meal_options')
    .select('id')
    .eq('family_id', familyId)
    .eq('holiday_id', holidayId)
    .eq('meal_id', meal_id)
    .maybeSingle();
  if (existing) throw new Error(`"${meal_name}" is already on the list for this holiday.`);

  const { data, error } = await supabase
    .from('wdw_meal_options')
    .insert({ family_id: familyId, holiday_id: holidayId, meal_id, meal_name, url: url || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listMealOptions(familyId, holidayId) {
  const { data: options, error } = await supabase
    .from('wdw_meal_options')
    .select('id, meal_id, meal_name, url')
    .eq('family_id', familyId)
    .eq('holiday_id', holidayId)
    .order('meal_name');
  if (error) throw error;
  if (!options?.length) return [];

  const mealIds = options.map((o) => o.meal_id);
  const { data: votes, error: vErr } = await supabase
    .from('wdw_meal_votes')
    .select('meal_id, vote_type, user_id')
    .eq('family_id', familyId)
    .eq('holiday_id', holidayId)
    .in('meal_id', mealIds);
  if (vErr) throw vErr;

  return options.map((opt) => {
    const optVotes = (votes || []).filter((v) => v.meal_id === opt.meal_id);
    return {
      ...opt,
      votes: {
        yes: optVotes.filter((v) => v.vote_type === 'yes').length,
        no: optVotes.filter((v) => v.vote_type === 'no').length,
        veto: optVotes.filter((v) => v.vote_type === 'veto').length,
      },
      vetoed: optVotes.some((v) => v.vote_type === 'veto'),
    };
  });
}

export async function voteMeal(familyId, userId, { holiday_id, meal_id, vote_type }) {
  const valid = ['yes', 'no', 'veto'];
  if (!valid.includes(vote_type)) {
    throw new Error(`vote_type must be one of: ${valid.join(', ')}`);
  }

  // Confirm the meal option belongs to this family's holiday
  const { data: option } = await supabase
    .from('wdw_meal_options')
    .select('meal_name')
    .eq('family_id', familyId)
    .eq('holiday_id', holiday_id)
    .eq('meal_id', meal_id)
    .maybeSingle();
  if (!option) throw new Error('Meal option not found for this holiday.');

  const { data, error } = await supabase
    .from('wdw_meal_votes')
    .upsert(
      {
        family_id: familyId,
        user_id: userId,
        holiday_id,
        meal_id,
        vote_type,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'holiday_id,meal_id,user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return { ...data, meal_name: option.meal_name };
}

export async function archiveHoliday(familyId, holidayId) {
  const { data, error } = await supabase
    .from('wdw_holidays')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', holidayId)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
