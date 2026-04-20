import { supabase } from '../db/supabase.js';
import { chatCompletion } from '../llm/groq.js';

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export async function logFood(familyId, userId, entry) {
  const type = (entry.meal_type || '').toLowerCase();
  if (!VALID_MEAL_TYPES.includes(type)) {
    throw new Error(`Invalid meal_type "${entry.meal_type}". Must be one of: ${VALID_MEAL_TYPES.join(', ')}`);
  }
  if (!entry.food_name?.trim()) throw new Error('food_name is required');

  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      family_id: familyId,
      user_id:   userId,
      food_name: entry.food_name.trim(),
      calories:  entry.calories  ?? null,
      meal_type: type,
      notes:     entry.notes     ?? null,
      logged_at: entry.logged_at ?? new Date().toLocaleDateString('en-CA'),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDailyLog(familyId, userId, date) {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .eq('logged_at', date)
    .order('meal_type')
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function getDailySummary(familyId, userId, date) {
  const entries = await getDailyLog(familyId, userId, date);
  return {
    total_calories: entries.reduce((s, e) => s + (e.calories || 0), 0),
    entry_count:    entries.length,
  };
}

export async function deleteLogEntry(entryId, familyId, userId) {
  const { data, error } = await supabase
    .from('food_logs')
    .delete()
    .eq('id', entryId)
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getNutritionGoal(familyId, userId) {
  const { data, error } = await supabase
    .from('nutrition_goals')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function getWeeklyAverage(familyId, userId, todayDate) {
  // Fetch last 7 days including today
  const start = new Date(todayDate + 'T12:00:00');
  start.setDate(start.getDate() - 6);
  const startDate = start.toLocaleDateString('en-CA');

  const { data, error } = await supabase
    .from('food_logs')
    .select('logged_at, calories')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .gte('logged_at', startDate)
    .lte('logged_at', todayDate);

  if (error) throw error;

  // Sum calories per day, then average over 7 days
  const byDay = {};
  for (const row of data || []) {
    byDay[row.logged_at] = (byDay[row.logged_at] || 0) + (row.calories || 0);
  }
  const total = Object.values(byDay).reduce((s, v) => s + v, 0);
  return {
    average_calories: Math.round(total / 7),
    days_with_data:   Object.keys(byDay).length,
    start_date:       startDate,
  };
}

export async function setNutritionGoal(familyId, userId, { daily_calories }) {
  const { data, error } = await supabase
    .from('nutrition_goals')
    .upsert(
      {
        family_id:      familyId,
        user_id:        userId,
        daily_calories: daily_calories ?? null,
        updated_at:     new Date().toISOString(),
      },
      { onConflict: 'family_id,user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function lookupFoodCalories(query) {
  const messages = [
    {
      role: 'system',
      content: 'You are a nutrition expert. Estimate the calories for the described food or meal. Respond with valid JSON only, no markdown or explanation: {"food_name": "...", "calories": 000, "serving": "description of portion size assumed", "confidence": "high|medium|low"}',
    },
    { role: 'user', content: query.trim().slice(0, 300) },
  ];

  const result = await chatCompletion(messages);
  const text = result.choices[0].message.content.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const data = JSON.parse(text);

  if (!data.calories || isNaN(Number(data.calories))) {
    throw new Error('Could not estimate calories');
  }

  return {
    food_name:  data.food_name || query.trim(),
    calories:   Math.round(Number(data.calories)),
    serving:    data.serving || null,
    confidence: data.confidence || 'medium',
  };
}

export async function deleteLastFoodEntry(familyId, userId) {
  const { data: latest, error: fetchErr } = await supabase
    .from('food_logs')
    .select('id, food_name')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchErr && fetchErr.code === 'PGRST116') return null;
  if (fetchErr) throw fetchErr;

  return deleteLogEntry(latest.id, familyId, userId);
}

export async function deleteFoodEntryByName(familyId, userId, foodName) {
  const { data: matches, error: fetchErr } = await supabase
    .from('food_logs')
    .select('id, food_name, logged_at')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .ilike('food_name', `%${foodName.trim()}%`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchErr) throw fetchErr;
  if (!matches || matches.length === 0) return null;

  return deleteLogEntry(matches[0].id, familyId, userId);
}
