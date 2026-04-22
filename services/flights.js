import { supabase } from '../db/supabase.js';

const IATA_RE = /^[A-Z0-9]{2}\d{1,4}[A-Z]?$/;

function normaliseCode(raw) {
  const code = raw.trim().toUpperCase();
  if (!IATA_RE.test(code)) {
    throw new Error(`"${raw}" doesn't look like a valid flight code. Try something like BA492 or AA1234.`);
  }
  return code;
}

export async function trackFlight(familyId, userId, { flight_code, airline_name, from_airport, to_airport, departure_scheduled, arrival_scheduled }) {
  const code = normaliseCode(flight_code);
  const { data, error } = await supabase
    .from('flights')
    .insert({
      family_id: familyId,
      user_id: userId,
      flight_code: code,
      airline_name: airline_name || null,
      from_airport: from_airport?.toUpperCase() || null,
      to_airport: to_airport?.toUpperCase() || null,
      departure_scheduled,
      arrival_scheduled: arrival_scheduled || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listFlights(familyId, userId) {
  const { data, error } = await supabase
    .from('flights')
    .select('id, flight_code, airline_name, from_airport, to_airport, departure_scheduled, arrival_scheduled, status, notified_12h, created_at')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('departure_scheduled');
  if (error) throw error;
  return data;
}

export async function removeFlight(flightId, familyId, userId) {
  const { data, error } = await supabase
    .from('flights')
    .delete()
    .eq('id', flightId)
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getFlightsDueForNotification() {
  const now = new Date();
  const in13h = new Date(now.getTime() + 13 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from('flights')
    .select('*, users(whatsapp_number, display_name, timezone)')
    .eq('status', 'active')
    .eq('notified_12h', false)
    .lte('departure_scheduled', in13h.toISOString())
    .gt('departure_scheduled', now.toISOString());
  if (error) throw error;
  return data;
}

export async function markFlightNotified(flightId) {
  const { error } = await supabase
    .from('flights')
    .update({ notified_12h: true })
    .eq('id', flightId);
  if (error) throw error;
}

export async function archiveOldFlights() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('flights')
    .update({ status: 'archived', archived_at: new Date().toISOString() })
    .eq('status', 'active')
    .lt('departure_scheduled', cutoff);
  if (error) throw error;
}
