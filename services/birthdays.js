import { supabase } from '../db/supabase.js';

/**
 * Get all birthdays for a family.
 */
export async function getBirthdays(familyId) {
  const { data, error } = await supabase
    .from('birthdays')
    .select('id, name, birth_date, notes, created_at')
    .eq('family_id', familyId)
    .order('birth_date');
  if (error) {
    if (error.code === 'PGRST205') return [];
    throw error;
  }
  return data || [];
}

/**
 * Get upcoming birthdays (next 60 days) as virtual events for the calendar.
 */
export function getUpcomingBirthdayEvents(birthdays) {
  const now = new Date();
  const results = [];

  for (const b of birthdays) {
    const [birthYear, birthMonth, birthDay] = b.birth_date.split('-').map(Number);

    // Check this year and next year
    for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
      const nextBday = new Date(year, birthMonth - 1, birthDay);
      const diffMs = nextBday - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 60) {
        const age = year - birthYear;
        results.push({
          id: `bday-${b.id}-${year}`,
          title: `🎂 ${b.name}'s Birthday${age > 0 ? ` (${age})` : ''}`,
          description: b.notes || null,
          starts_at: `${year}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}T00:00:00`,
          ends_at: null,
          all_day: true,
          is_birthday: true,
          birthday_id: b.id,
        });
      }
    }
  }

  // Sort by date
  results.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  return results;
}

/**
 * Add a birthday.
 */
export async function addBirthday(familyId, { name, birth_date, notes }) {
  const { data, error } = await supabase
    .from('birthdays')
    .insert({
      family_id: familyId,
      name,
      birth_date,
      notes: notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update a birthday.
 */
export async function updateBirthday(birthdayId, familyId, { name, birth_date, notes }) {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (birth_date !== undefined) updates.birth_date = birth_date;
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await supabase
    .from('birthdays')
    .update(updates)
    .eq('id', birthdayId)
    .eq('family_id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Remove a birthday.
 */
export async function removeBirthday(birthdayId, familyId) {
  const { error } = await supabase
    .from('birthdays')
    .delete()
    .eq('id', birthdayId)
    .eq('family_id', familyId);
  if (error) throw error;
  return { deleted: true };
}
