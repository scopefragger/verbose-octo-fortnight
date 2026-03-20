import { supabase } from '../db/supabase.js';
import crypto from 'crypto';

/**
 * Look up a user by their Telegram ID. Returns null if not found.
 */
export async function getUserByTelegramId(telegramId) {
  const { data, error } = await supabase
    .from('users')
    .select('*, families(*)')
    .eq('telegram_id', telegramId)
    .single();

  if (error && error.code === 'PGRST116') return null; // not found
  if (error) throw error;
  return data;
}

/**
 * Register a new user. Creates a family for them automatically.
 */
export async function registerUser(telegramId, displayName, username) {
  // Create a family first
  const { data: family, error: famErr } = await supabase
    .from('families')
    .insert({ name: `${displayName}'s Family` })
    .select()
    .single();
  if (famErr) throw famErr;

  // Create the user in that family
  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({
      telegram_id: telegramId,
      display_name: displayName,
      telegram_username: username || null,
      family_id: family.id,
    })
    .select('*, families(*)')
    .single();
  if (userErr) throw userErr;

  return user;
}

/**
 * Generate a 6-character link code. Stored temporarily in the family name
 * field as "LINK:XXXXXX" until a partner joins.
 */
export async function generateLinkCode(user) {
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  await supabase
    .from('families')
    .update({ name: `LINK:${code}` })
    .eq('id', user.family_id);
  return code;
}

/**
 * Join a family using a link code. Moves the joining user to the
 * family that owns the code.
 */
export async function joinFamily(joiningUser, code) {
  // Find the family with this link code
  const { data: family, error: famErr } = await supabase
    .from('families')
    .select()
    .eq('name', `LINK:${code}`)
    .single();

  if (famErr || !family) return null;

  // Move the joining user to this family
  await supabase
    .from('users')
    .update({ family_id: family.id })
    .eq('id', joiningUser.id);

  // Clear the link code and set a proper family name
  const { data: members } = await supabase
    .from('users')
    .select('display_name')
    .eq('family_id', family.id);

  const names = members.map((m) => m.display_name).join(' & ');
  await supabase
    .from('families')
    .update({ name: `${names} Family` })
    .eq('id', family.id);

  // Delete the old empty family
  if (joiningUser.family_id !== family.id) {
    await supabase
      .from('families')
      .delete()
      .eq('id', joiningUser.family_id);
  }

  return family;
}

/**
 * Get the family members for a user's family.
 */
export async function getFamilyMembers(familyId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, telegram_id')
    .eq('family_id', familyId);
  if (error) throw error;
  return data;
}
