import { supabase } from '../db/supabase.js';

const DAILY_FAMILY_LIMIT = 200;

/**
 * Throws if the family has exceeded today's Groq API call limit.
 * Fails open on DB errors — never blocks the bot due to audit table issues.
 */
export async function checkRateLimit(familyId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('groq_api_calls')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .gte('called_at', startOfDay.toISOString());

  if (error) {
    console.error('Rate limit check failed:', error.message);
    return;
  }

  if (count >= DAILY_FAMILY_LIMIT) {
    throw new Error(
      `Daily message limit reached (${DAILY_FAMILY_LIMIT} messages/day). ` +
      `Please try again tomorrow.`
    );
  }
}

/**
 * Record a Groq API call for auditing and rate limiting.
 */
export async function logApiCall(familyId, userId, model, tokensUsed = null) {
  const { error } = await supabase
    .from('groq_api_calls')
    .insert({ family_id: familyId, user_id: userId, model, tokens_used: tokensUsed });

  if (error) {
    console.error('Failed to log API call:', error.message);
  }
}
