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
 * Register a new user. Joins existing family if one exists (single-family app),
 * otherwise creates a new family.
 */
export async function registerUser(telegramId, displayName, username) {
  // Single-family app: reuse existing family if one exists
  let family;
  const { data: existing } = await supabase
    .from('families')
    .select('id, name')
    .limit(1)
    .single();

  if (existing) {
    family = existing;
  } else {
    const { data: newFamily, error: famErr } = await supabase
      .from('families')
      .insert({ name: `${displayName}'s Family` })
      .select()
      .single();
    if (famErr) throw famErr;
    family = newFamily;
  }

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
 * Look up a user by their WhatsApp number. Returns null if not found.
 */
export async function getUserByWhatsAppNumber(number) {
  const { data, error } = await supabase
    .from('users')
    .select('*, families(*)')
    .eq('whatsapp_number', number)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

/**
 * Register a new WhatsApp user. Joins existing family or creates one.
 */
export async function registerWhatsAppUser(number, displayName) {
  let family;
  const { data: existing } = await supabase
    .from('families')
    .select('id, name')
    .limit(1)
    .single();

  if (existing) {
    family = existing;
  } else {
    const { data: newFamily, error: famErr } = await supabase
      .from('families')
      .insert({ name: `${displayName}'s Family` })
      .select()
      .single();
    if (famErr) throw famErr;
    family = newFamily;
  }

  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({
      whatsapp_number: number,
      display_name: displayName,
      family_id: family.id,
    })
    .select('*, families(*)')
    .single();
  if (userErr) throw userErr;

  return user;
}

/**
 * Generate a 6-character link code. Stored in the dedicated link_code column.
 * Expires after 24 hours.
 */
export async function generateLinkCode(user) {
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('families')
    .update({ link_code: code, link_code_expires_at: expires })
    .eq('id', user.family_id);
  return code;
}

/**
 * Join a family using a link code. Moves the joining user to the
 * family that owns the code.
 */
export async function joinFamily(joiningUser, code) {
  // Find the family with this link code (must not be expired)
  const { data: family, error: famErr } = await supabase
    .from('families')
    .select()
    .eq('link_code', code)
    .gt('link_code_expires_at', new Date().toISOString())
    .single();

  if (famErr || !family) return null;

  // Move the joining user to this family
  await supabase
    .from('users')
    .update({ family_id: family.id })
    .eq('id', joiningUser.id);

  // Clear the link code and update the family name
  const { data: members } = await supabase
    .from('users')
    .select('display_name')
    .eq('family_id', family.id);

  const names = members.map((m) => m.display_name).join(' & ');
  await supabase
    .from('families')
    .update({ name: `${names} Family`, link_code: null, link_code_expires_at: null })
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
