import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { handleWhatsAppMessage } from './bot/whatsappHandler.js';
import { checkReminders, sendDailyDigest, sendWeeklyDigest, cleanupOldData } from './routes/cron.js';
import { getDashboardData } from './routes/dashboard.js';
import authRoutes from './routes/auth.js';
import { requireAuth, requireCronSecret } from './middleware/auth.js';
import { setMeal, removeMeal, getUniqueMealTitles } from './services/meals.js';
import { createEvent, deleteEvent, updateEvent } from './services/calendar.js';
import { addItem, removeItem, removeItemById } from './services/lists.js';
import { createReminder, deleteReminder } from './services/reminders.js';
import { seedUKHolidays } from './services/holidays.js';
import { setTheme, listThemes } from './services/themes.js';
import { adjustPoints, getPointHistory } from './services/points.js';
import { addFoodItem, getFoodItems, removeFoodItemById } from './services/foodExpiry.js';
import { createCountdown, updateCountdown, deleteCountdown } from './services/countdowns.js';
import { getWatchlist, addToWatchlist, markWatched, removeFromWatchlist } from './services/watchlist.js';
import { getBirthdays, addBirthday, updateBirthday, removeBirthday } from './services/birthdays.js';
import { createGoal, listGoals, updateGoal, deleteGoal, addProgress, getProgress } from './services/goals.js';
import { getIdeas, addIdea, deleteIdea, processIdeaQueue, generateIdeas, theorizeIdea, getTheories, retheorizeIdea, suggestImprovements, generateHandoff, executeHandoff, getHandoffStatus, TOTAL_PASSES } from './services/ideas.js';
import { saveHouseDesign, listHouseDesigns, getHouseDesign, deleteHouseDesign } from './services/houseBuilder.js';
import { listDecklists, getDecklist, saveDecklist, updateDecklist, deleteDecklist } from './services/mtgCommander.js';
import { upsertDay, deleteDay, getDaysForMonth, getMonthStats } from './services/officeCheckin.js';
import { getBinSchedule, upsertBinSchedule } from './services/binSchedule.js';
import { logFood, getDailyLog, getDailySummary, deleteLogEntry, getNutritionGoal, setNutritionGoal, getWeeklyAverage } from './services/foodLog.js';
import { chatCompletion } from './llm/groq.js';
import { supabase } from './db/supabase.js';
import { registerInvalidator } from './utils/cache.js';
import { logError, getErrors, clearErrors } from './utils/errorLog.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pre-read static HTML files once at startup to avoid per-request disk I/O
const HTML = {
  dashboard: fs.readFileSync(path.join(__dirname, 'public', 'dashboard.html'), 'utf-8'),
  mtgCommander: fs.readFileSync(path.join(__dirname, 'public', 'mtg-commander.html'), 'utf-8'),
  houseBuilder: fs.readFileSync(path.join(__dirname, 'public', 'house-builder.html'), 'utf-8'),
  ideas: fs.readFileSync(path.join(__dirname, 'public', 'ideas.html'), 'utf-8'),
  officeCheckin: fs.readFileSync(path.join(__dirname, 'public', 'office-checkin.html'), 'utf-8'),
  foodLog: fs.readFileSync(path.join(__dirname, 'public', 'food-log.html'), 'utf-8'),
};

const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 3000;

// Auth routes (login page, login/logout/refresh API — no auth required)
app.use(authRoutes);

// Root redirect → dashboard (auth middleware will redirect to /login if needed)
app.get('/', requireAuth, (req, res) => res.redirect('/dashboard'));

// Health endpoint for cron-job.org keep-alive
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Cron endpoint for reminder delivery
app.get('/cron/check', requireCronSecret, async (req, res) => {
  try {
    const result = await checkReminders();
    res.json(result);
  } catch (err) {
    logError('cron-check', err);
    res.status(500).json({ error: 'check failed' });
  }
});

// Daily digest — called by cron-job.org at 8am
app.get('/cron/daily', requireCronSecret, async (req, res) => {
  try {
    const result = await sendDailyDigest();
    res.json(result);
  } catch (err) {
    logError('daily-digest', err);
    res.status(500).json({ error: 'digest failed' });
  }
});

// Weekly digest — called by cron-job.org every Sunday
app.get('/cron/weekly', requireCronSecret, async (req, res) => {
  try {
    const result = await sendWeeklyDigest();
    res.json(result);
  } catch (err) {
    logError('weekly-digest', err);
    res.status(500).json({ error: 'digest failed' });
  }
});

// Nightly cleanup — delete old conversations, food logs, and audit records
app.get('/cron/cleanup', requireCronSecret, async (req, res) => {
  try {
    const result = await cleanupOldData();
    res.json(result);
  } catch (err) {
    logError('cron-cleanup', err);
    res.status(500).json({ error: 'cleanup failed' });
  }
});

// Dashboard HTML page
app.get('/dashboard', requireAuth, (req, res) => res.type('html').send(HTML.dashboard));

// MTG Commander page
app.get('/mtg-commander', requireAuth, (req, res) => res.type('html').send(HTML.mtgCommander));

// MTG Commander API
app.get('/api/mtg/decks', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const decks = await listDecklists(familyId);
    res.json({ decks });
  } catch (err) {
    logError('MTG list decks', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mtg/decks/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const deck = await getDecklist(req.params.id, familyId);
    res.json(deck);
  } catch (err) {
    logError('MTG get deck', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mtg/decks', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { name, commander, partner, cards, tokens } = req.body;
    if (!name || !cards?.length) return res.status(400).json({ error: 'name and cards required' });
    const deck = await saveDecklist(familyId, { name, commander, partner, cards, tokens });
    res.json(deck);
  } catch (err) {
    logError('MTG save deck', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/mtg/decks/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const deck = await updateDecklist(req.params.id, familyId, req.body);
    res.json(deck);
  } catch (err) {
    logError('MTG update deck', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/mtg/decks/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await deleteDecklist(req.params.id, familyId);
    res.json({ deleted: true });
  } catch (err) {
    logError('MTG delete deck', err);
    res.status(500).json({ error: err.message });
  }
});

// MTG hand critique
app.post('/api/mtg/critique-hand', requireAuth, async (req, res) => {
  try {
    const { hand, deckName, commander, partner, deckStats } = req.body;
    if (!hand?.length) return res.status(400).json({ error: 'No hand provided' });

    const commanderLine = [commander, partner].filter(Boolean).join(' + ');
    const handList = hand.map(c => `- ${c.name}${c.mana_cost ? ` (${c.mana_cost.replace(/\{|\}/g, '')})` : ''}${c.type_line ? ` [${c.type_line}]` : ''}`).join('\n');

    const messages = [
      {
        role: 'system',
        content: `You are an expert Magic: The Gathering Commander player and deck analyst. Give concise, practical advice. Be direct and specific. Use plain text, no markdown.`
      },
      {
        role: 'user',
        content: `Critique this opening hand for a Commander deck.

Deck: ${deckName || 'Unknown'}${commanderLine ? `\nCommander: ${commanderLine}` : ''}
${deckStats ? `Deck stats: ${deckStats.totalCards} cards, avg CMC ${deckStats.avgCMC}, ${deckStats.lands} lands` : ''}

Opening hand (${hand.length} cards):
${handList}

Is this hand keepable? What's the game plan with these cards? What are the risks? Be concise — 3 to 5 sentences.`
      }
    ];

    const result = await chatCompletion(messages);
    const critique = result.choices[0]?.message?.content || 'No response from AI.';
    res.json({ critique });
  } catch (err) {
    logError('MTG critique hand', err);
    res.status(500).json({ error: err.message });
  }
});

// House Builder page
app.get('/house-builder', requireAuth, (req, res) => res.type('html').send(HTML.houseBuilder));

// Ideas Lab page
app.get('/ideas', requireAuth, (req, res) => res.type('html').send(HTML.ideas));

// Office Check-In page
app.get('/office-checkin', requireAuth, (req, res) => res.type('html').send(HTML.officeCheckin));

// Dashboard API — returns JSON data for the dashboard (cached to reduce Supabase load)
let dashboardCache = { data: null, timestamp: 0 };
const CACHE_TTL = 300_000; // 5 minutes

function invalidateCache() { dashboardCache.timestamp = 0; }
registerInvalidator(invalidateCache);

app.get('/api/dashboard', requireAuth, async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  // Return cached data if fresh enough
  if (dashboardCache.data && Date.now() - dashboardCache.timestamp < CACHE_TTL) {
    return res.json(dashboardCache.data);
  }

  try {
    // Get the first family (for a personal bot, there's typically one)
    const { data: families } = await supabase
      .from('families')
      .select('id')
      .limit(1);

    if (!families || families.length === 0) {
      return res.json({ error: 'No family found. Send /start to the bot first.' });
    }

    const data = await getDashboardData(families[0].id);
    dashboardCache = { data, timestamp: Date.now() };
    res.json(data);
  } catch (err) {
    logError('dashboard-api', err);
    // Return stale cache if available rather than an error
    if (dashboardCache.data) {
      return res.json(dashboardCache.data);
    }
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Helper to get the first family ID
async function getFamilyId() {
  const { data: families } = await supabase
    .from('families')
    .select('id')
    .limit(1);
  return families?.[0]?.id;
}

// Resolve internal users.id from session auth (via auth_user_id) or fall back to first family member
async function getUserId(familyId, req) {
  if (req.authMode === 'session' && req.authUser?.id) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('family_id', familyId)
      .eq('auth_user_id', req.authUser.id)
      .single();
    if (data) return data.id;
  }
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('family_id', familyId)
    .limit(1)
    .single();
  return data?.id ?? null;
}

// Meal API — create or update a meal
app.post('/api/meals', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { meal_date, meal_type } = req.body;
    if (!meal_date || !meal_type) return res.status(400).json({ error: 'meal_date and meal_type required' });
    const meal = await setMeal(familyId, req.body, null);
    invalidateCache();
    res.json(meal);
  } catch (err) {
    logError('Meal create/update', err);
    res.status(500).json({ error: err.message });
  }
});

// Meal API — delete a meal
app.delete('/api/meals', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { meal_date, meal_type } = req.body;
    await removeMeal(familyId, meal_date, meal_type);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('Meal delete', err);
    res.status(500).json({ error: err.message });
  }
});

// Get unique meal titles for the meal picker wheel
app.get('/api/meal-titles', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const titles = await getUniqueMealTitles(familyId);
    res.json({ titles });
  } catch (err) {
    logError('Meal titles', err);
    res.status(500).json({ error: err.message });
  }
});

// Food expiry API
app.get('/api/food-items', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const items = await getFoodItems(familyId);
    res.json({ items });
  } catch (err) {
    logError('Food items', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/food-items', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { name, expires_at, quantity } = req.body;
    if (!name || !expires_at) return res.status(400).json({ error: 'name and expires_at required' });
    const item = await addFoodItem(familyId, name, expires_at, quantity);
    invalidateCache();
    res.json({ item });
  } catch (err) {
    logError('Add food item', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/food-items', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    const { item_id } = req.body;
    if (!item_id) return res.status(400).json({ error: 'item_id required' });
    await removeFoodItemById(item_id, familyId);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('Remove food item', err);
    res.status(500).json({ error: err.message });
  }
});

// Countdown API
app.post('/api/countdowns', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { title, target_date, background } = req.body;
    if (!title || !target_date) return res.status(400).json({ error: 'title and target_date required' });
    const countdown = await createCountdown(familyId, { title, target_date, background });
    invalidateCache();
    res.json(countdown);
  } catch (err) {
    logError('Create countdown', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/countdowns/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const countdown = await updateCountdown(req.params.id, familyId, req.body);
    invalidateCache();
    res.json(countdown);
  } catch (err) {
    logError('Update countdown', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/countdowns/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const deleted = await deleteCountdown(req.params.id, familyId);
    invalidateCache();
    res.json({ deleted: true, title: deleted?.title });
  } catch (err) {
    logError('Delete countdown', err);
    res.status(500).json({ error: err.message });
  }
});

// Event API — create an event
app.post('/api/events', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { data: users } = await supabase.from('users').select('id').eq('family_id', familyId).limit(1);
    const event = await createEvent(familyId, users?.[0]?.id || null, req.body);
    invalidateCache();
    res.json(event);
  } catch (err) {
    logError('Event create', err);
    res.status(500).json({ error: err.message });
  }
});

// Event API — delete an event
app.delete('/api/events', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await deleteEvent(req.body.event_id, familyId);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('Event delete', err);
    res.status(500).json({ error: err.message });
  }
});

// Event API — update an event
app.put('/api/events/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const event = await updateEvent(req.params.id, familyId, req.body);
    invalidateCache();
    res.json(event);
  } catch (err) {
    logError('Event update', err);
    res.status(500).json({ error: err.message });
  }
});

// List item API — add an item
app.post('/api/list-items', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { list_name, text } = req.body;
    const result = await addItem(familyId, list_name, text, null);
    invalidateCache();
    res.json(result);
  } catch (err) {
    logError('List item add', err);
    res.status(500).json({ error: err.message });
  }
});

// List item API — remove an item
app.delete('/api/list-items', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { list_name, text } = req.body;
    await removeItem(familyId, list_name, text);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('List item remove', err);
    res.status(500).json({ error: err.message });
  }
});

// List item delete by ID (used by dashboard checkboxes)
app.delete('/api/list-items/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    await removeItemById(req.params.id, familyId);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('List item delete', err);
    res.status(500).json({ error: err.message });
  }
});

// Reminder API — create a reminder
app.post('/api/reminders', requireAuth, async (req, res) => {
  try {
    // Get the first user to associate the reminder with
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users?.length) return res.status(404).json({ error: 'No user found' });
    const reminder = await createReminder(users[0].id, req.body);
    invalidateCache();
    res.json(reminder);
  } catch (err) {
    logError('Reminder create', err);
    res.status(500).json({ error: err.message });
  }
});

// Reminder API — delete a reminder
app.delete('/api/reminders', requireAuth, async (req, res) => {
  try {
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users?.length) return res.status(404).json({ error: 'No user found' });
    await deleteReminder(req.body.reminder_id, users[0].id);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('Reminder delete', err);
    res.status(500).json({ error: err.message });
  }
});

// Adjust kid points
app.post('/api/points', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { kid_name, change, reason } = req.body;
    if (!kid_name || change === undefined) {
      return res.status(400).json({ error: 'kid_name and change are required' });
    }
    const result = await adjustPoints(familyId, kid_name, change, reason || 'Dashboard', null);
    invalidateCache();
    res.json(result);
  } catch (err) {
    logError('Points adjust', err);
    res.status(500).json({ error: err.message });
  }
});

// Get point history for a kid
app.get('/api/point-history', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { kid_name } = req.query;
    if (!kid_name) return res.status(400).json({ error: 'kid_name is required' });
    const result = await getPointHistory(familyId, kid_name);
    res.json(result);
  } catch (err) {
    logError('Point history', err);
    res.status(500).json({ error: err.message });
  }
});

// Get available themes
app.get('/api/themes', requireAuth, async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  res.json(listThemes());
});

// Set dashboard theme
app.post('/api/theme', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const result = await setTheme(familyId, req.body.theme);
    invalidateCache();
    res.json(result);
  } catch (err) {
    logError('Theme set', err);
    res.status(500).json({ error: err.message });
  }
});

// Seed UK holidays for a year
app.post('/api/seed-holidays', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { data: users } = await supabase.from('users').select('id').eq('family_id', familyId).limit(1);
    const year = req.body.year || new Date().getFullYear();
    const results = await seedUKHolidays(familyId, users?.[0]?.id || null, year);
    invalidateCache();
    res.json({ year, holidays: results });
  } catch (err) {
    logError('Seed holidays', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Watchlist ──
app.get('/api/watchlist', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const includeWatched = req.query.watched === 'true';
    const items = await getWatchlist(familyId, includeWatched);
    res.json({ items });
  } catch (err) {
    logError('Watchlist fetch', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/watchlist', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const item = await addToWatchlist(familyId, req.body, null);
    invalidateCache();
    res.json(item);
  } catch (err) {
    logError('Watchlist add', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/watchlist/:id/watched', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const item = await markWatched(req.params.id, familyId, req.body.rating);
    invalidateCache();
    res.json(item);
  } catch (err) {
    logError('Watchlist mark watched', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/watchlist/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await removeFromWatchlist(req.params.id, familyId);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('Watchlist remove', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Error Log ──
app.get('/api/errors', requireAuth, async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const limit = parseInt(req.query.limit) || 100;
  res.json({ errors: getErrors(limit) });
});

app.delete('/api/errors', requireAuth, async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  clearErrors();
  res.json({ cleared: true });
});

// ── Chat History ──
app.get('/api/chat-history', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { data: members } = await supabase.from('users').select('id, display_name').eq('family_id', familyId);
    const userIds = (members || []).map(m => m.id);
    const userMap = {};
    (members || []).forEach(m => { userMap[m.id] = m.display_name; });

    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const { data, error } = await supabase
      .from('conversations')
      .select('id, user_id, role, content, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;

    const messages = (data || []).map(m => ({
      id: m.id,
      user: userMap[m.user_id] || 'Unknown',
      role: m.role,
      content: m.content,
      created_at: m.created_at,
    }));

    res.json({ messages });
  } catch (err) {
    logError('Chat history', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Birthdays ──
app.get('/api/birthdays', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const items = await getBirthdays(familyId);
    res.json({ birthdays: items });
  } catch (err) {
    logError('Birthdays fetch', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/birthdays', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const item = await addBirthday(familyId, req.body);
    invalidateCache();
    res.json(item);
  } catch (err) {
    logError('Birthday add', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/birthdays/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const item = await updateBirthday(req.params.id, familyId, req.body);
    invalidateCache();
    res.json(item);
  } catch (err) {
    logError('Birthday update', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/birthdays/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await removeBirthday(req.params.id, familyId);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('Birthday remove', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Bin Schedule ──
app.get('/api/bin-schedule', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const schedule = await getBinSchedule(familyId);
    res.json(schedule || {});
  } catch (err) {
    logError('Bin schedule get', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bin-schedule', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { collection_day, bins, reference_date } = req.body;
    if (collection_day === undefined || !bins || !reference_date) {
      return res.status(400).json({ error: 'collection_day, bins, and reference_date are required' });
    }
    const schedule = await upsertBinSchedule(familyId, { collection_day, bins, reference_date });
    invalidateCache();
    res.json(schedule);
  } catch (err) {
    logError('Bin schedule upsert', err);
    res.status(500).json({ error: err.message });
  }
});

// ── House Builder ──
app.get('/api/houses', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const houses = await listHouseDesigns(familyId);
    res.json({ houses });
  } catch (err) {
    logError('Houses list', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/houses', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { builder_name, choices } = req.body;
    if (!builder_name || !choices) return res.status(400).json({ error: 'builder_name and choices required' });
    const house = await saveHouseDesign(familyId, builder_name, choices);
    res.json(house);
  } catch (err) {
    logError('House save', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/houses/:id', requireAuth, async (req, res) => {
  try {
    const house = await getHouseDesign(req.params.id);
    res.json(house);
  } catch (err) {
    logError('House get', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/houses/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await deleteHouseDesign(req.params.id, familyId);
    res.json({ deleted: true });
  } catch (err) {
    logError('House delete', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Family Goals ──
app.get('/api/goals', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const status = req.query.status || 'active';
    const items = await listGoals(familyId, status);
    res.json({ goals: items });
  } catch (err) {
    logError('Goals list', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/goals', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { title, description, target_date } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const goal = await createGoal(familyId, { title, description, target_date }, null);
    invalidateCache();
    res.json(goal);
  } catch (err) {
    logError('Goal create', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/goals/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const goal = await updateGoal(req.params.id, familyId, req.body);
    invalidateCache();
    res.json(goal);
  } catch (err) {
    logError('Goal update', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/goals/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await deleteGoal(req.params.id, familyId);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('Goal delete', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/goals/:id/progress', requireAuth, async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ error: 'note is required' });
    const progress = await addProgress(req.params.id, note, null);
    invalidateCache();
    res.json(progress);
  } catch (err) {
    logError('Goal progress add', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/goals/:id/progress', requireAuth, async (req, res) => {
  try {
    const history = await getProgress(req.params.id);
    res.json({ progress: history });
  } catch (err) {
    logError('Goal progress list', err);
    res.status(500).json({ error: err.message });
  }
});

// Ideas endpoints
app.get('/api/ideas', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const ideas = await getIdeas(familyId);
    res.json({ ideas });
  } catch (err) {
    logError('Ideas list', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ideas', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    if (!req.body.title?.trim()) return res.status(400).json({ error: 'title required' });
    const idea = await addIdea(familyId, req.body, null);
    invalidateCache();
    res.json(idea);
  } catch (err) {
    logError('Ideas add', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/ideas/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await deleteIdea(req.params.id, familyId);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('Ideas delete', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ideas/process', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const result = await processIdeaQueue(familyId);
    invalidateCache();
    res.json(result);
  } catch (err) {
    logError('Ideas process', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ideas/generate', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const count = parseInt(req.body?.count) || 5;
    const result = await generateIdeas(familyId, count);
    invalidateCache();
    res.json(result);
  } catch (err) {
    logError('Ideas generate', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/cron/ideas', requireCronSecret, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const result = await processIdeaQueue(familyId);
    invalidateCache();
    res.json(result);
  } catch (err) {
    logError('Cron ideas', err);
    res.status(500).json({ error: err.message });
  }
});

// Nightly cron: generate new ideas from codebase analysis, then process any pending
app.get('/cron/ideas/generate', requireCronSecret, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const count = parseInt(req.query.count) || 3;
    const generated = await generateIdeas(familyId, count);
    const processed = await processIdeaQueue(familyId);
    invalidateCache();
    res.json({ generated: generated.generated || 0, processed: processed.processed || 0 });
  } catch (err) {
    logError('Cron ideas generate', err);
    res.status(500).json({ error: err.message });
  }
});

// Theorize an idea — runs multi-pass deep analysis
app.post('/api/ideas/:id/theorize', requireAuth, async (req, res) => {
  try {
    // Start theorize in background, return immediately
    const ideaId = req.params.id;
    res.json({ started: true, total_passes: TOTAL_PASSES });
    // Run pipeline async (don't await)
    theorizeIdea(ideaId).catch(err => {
      logError('Theorize', err);
      supabase.from('ideas').update({ theorize_status: 'failed' }).eq('id', ideaId);
    });
  } catch (err) {
    logError('Theorize start', err);
    res.status(500).json({ error: err.message });
  }
});

// Get theorize progress and results for an idea
app.get('/api/ideas/:id/theories', requireAuth, async (req, res) => {
  try {
    const { data: idea } = await supabase.from('ideas').select('theorize_status, theorize_progress').eq('id', req.params.id).single();
    const theories = await getTheories(req.params.id);
    res.json({
      status: idea?.theorize_status || null,
      progress: idea?.theorize_progress || 0,
      total_passes: TOTAL_PASSES,
      theories,
    });
  } catch (err) {
    logError('Theories get', err);
    res.status(500).json({ error: err.message });
  }
});

// Retheorize an idea with user adjustments
app.post('/api/ideas/:id/retheorize', requireAuth, async (req, res) => {
  try {
    const ideaId = req.params.id;
    const adjustments = req.body?.adjustments;
    if (!adjustments) return res.status(400).json({ error: 'adjustments field required' });
    res.json({ started: true, total_passes: TOTAL_PASSES });
    retheorizeIdea(ideaId, adjustments).catch(err => {
      logError('Retheorize', err);
      supabase.from('ideas').update({ theorize_status: 'failed' }).eq('id', ideaId);
    });
  } catch (err) {
    logError('Retheorize start', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate handoff prompt preview (without executing)
app.get('/api/ideas/:id/handoff', requireAuth, async (req, res) => {
  try {
    const { handoffPrompt } = await generateHandoff(req.params.id);
    res.json({ prompt: handoffPrompt });
  } catch (err) {
    logError('Handoff preview', err);
    res.status(500).json({ error: err.message });
  }
});

// Execute full handoff: generate prompt, call Claude, commit code, create PR
app.post('/api/ideas/:id/handoff', requireAuth, async (req, res) => {
  try {
    const ideaId = req.params.id;
    res.json({ started: true });
    executeHandoff(ideaId).catch(err => {
      logError('Handoff execute', err);
    });
  } catch (err) {
    logError('Handoff start', err);
    res.status(500).json({ error: err.message });
  }
});

// Get handoff status
app.get('/api/ideas/:id/handoff/status', requireAuth, async (req, res) => {
  try {
    const status = await getHandoffStatus(req.params.id);
    res.json(status);
  } catch (err) {
    logError('Handoff status', err);
    res.status(500).json({ error: err.message });
  }
});

// Get AI-suggested improvements for a theorized idea
app.get('/api/ideas/:id/suggestions', requireAuth, async (req, res) => {
  try {
    const suggestions = await suggestImprovements(req.params.id);
    res.json({ suggestions });
  } catch (err) {
    logError('Suggestions', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Office Check-In ──

// GET /api/office-checkin/stats?year=&month=  — stats only (must come before :date route)
app.get('/api/office-checkin/stats', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const year  = parseInt(req.query.year,  10);
    const month = parseInt(req.query.month, 10);
    if (!year || !month) return res.status(400).json({ error: 'year and month are required' });
    const stats = await getMonthStats(familyId, year, month);
    res.json(stats);
  } catch (err) {
    logError('Office checkin stats', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/office-checkin?year=&month=  — days array + stats
app.get('/api/office-checkin', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const year  = parseInt(req.query.year,  10);
    const month = parseInt(req.query.month, 10);
    if (!year || !month) return res.status(400).json({ error: 'year and month are required' });
    const [days, stats] = await Promise.all([
      getDaysForMonth(familyId, year, month),
      getMonthStats(familyId, year, month),
    ]);
    res.json({ days, stats });
  } catch (err) {
    logError('Office checkin list', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/office-checkin/:date  — upsert a day
app.put('/api/office-checkin/:date', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const dayDate = req.params.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dayDate)) {
      return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
    }
    const { day_type } = req.body;
    if (!['office', 'travel', 'time_off'].includes(day_type)) {
      return res.status(400).json({ error: 'day_type must be office, travel, or time_off' });
    }
    const row = await upsertDay(familyId, dayDate, req.body);
    res.json(row);
  } catch (err) {
    logError('Office checkin upsert', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/office-checkin/:date  — remove a day
app.delete('/api/office-checkin/:date', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const dayDate = req.params.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dayDate)) {
      return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
    }
    await deleteDay(familyId, dayDate);
    res.json({ deleted: true });
  } catch (err) {
    logError('Office checkin delete', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Food Log ──

app.get('/food-log', requireAuth, (req, res) => res.type('html').send(HTML.foodLog));

app.get('/api/food-log', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const userId = await getUserId(familyId, req);
    if (!userId) return res.status(404).json({ error: 'No user found' });

    const date = req.query.date || new Date().toLocaleDateString('en-CA');
    const [entries, goal, weekly] = await Promise.all([
      getDailyLog(familyId, userId, date),
      getNutritionGoal(familyId, userId),
      getWeeklyAverage(familyId, userId, date),
    ]);
    const summary = {
      total_calories: entries.reduce((s, e) => s + (e.calories || 0), 0),
      entry_count:    entries.length,
    };
    res.json({ date, entries, summary, goal, weekly });
  } catch (err) {
    logError('Food log fetch', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/food-log', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const userId = await getUserId(familyId, req);
    if (!userId) return res.status(404).json({ error: 'No user found' });

    const { food_name, meal_type } = req.body;
    if (!food_name?.trim()) return res.status(400).json({ error: 'food_name required' });
    if (!meal_type) return res.status(400).json({ error: 'meal_type required' });

    const entry = await logFood(familyId, userId, req.body);
    res.json({ entry });
  } catch (err) {
    logError('Food log add', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/food-log/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const userId = await getUserId(familyId, req);
    if (!userId) return res.status(404).json({ error: 'No user found' });

    const deleted = await deleteLogEntry(req.params.id, familyId, userId);
    if (!deleted) return res.status(404).json({ error: 'Entry not found or not yours' });
    res.json({ deleted: true });
  } catch (err) {
    logError('Food log delete', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/nutrition-goals', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const userId = await getUserId(familyId, req);
    if (!userId) return res.status(404).json({ error: 'No user found' });

    const goal = await getNutritionGoal(familyId, userId);
    res.json({ goal });
  } catch (err) {
    logError('Nutrition goal fetch', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/nutrition-goals', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const userId = await getUserId(familyId, req);
    if (!userId) return res.status(404).json({ error: 'No user found' });

    const { daily_calories } = req.body;
    if (!daily_calories || isNaN(parseInt(daily_calories))) {
      return res.status(400).json({ error: 'daily_calories required' });
    }
    const goal = await setNutritionGoal(familyId, userId, { daily_calories: parseInt(daily_calories) });
    res.json({ goal });
  } catch (err) {
    logError('Nutrition goal set', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/food-log/lookup', requireAuth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: 'query required' });

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
      return res.status(422).json({ error: 'Could not estimate calories' });
    }

    res.json({
      food_name: data.food_name || query.trim(),
      calories: Math.round(Number(data.calories)),
      serving: data.serving || null,
      confidence: data.confidence || 'medium',
    });
  } catch (err) {
    logError('Food lookup', err);
    res.status(500).json({ error: err.message });
  }
});

// ── WhatsApp Webhook ──

// Meta verification challenge (one-time setup via Meta Developer Console)
app.get('/bot/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Incoming WhatsApp messages
app.post('/bot/webhook', async (req, res) => {
  // express.json() runs globally first, so req.body is already a parsed object.
  // Signature verification requires the raw body — skip if we can't get it.
  const payload = req.body;
  if (!payload || typeof payload !== 'object') return res.sendStatus(400);

  // Acknowledge immediately — Meta requires 200 within 5s
  res.sendStatus(200);

  try {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    if (!change?.messages?.length) return;

    const message = change.messages[0];
    if (message.type !== 'text') return; // Only handle text messages for now

    const from = message.from;
    const text = message.text?.body || '';
    const messageId = message.id;
    const replyToId = message.context?.id || null; // ID of the message being replied to
    const displayName = change.contacts?.[0]?.profile?.name || 'Friend';

    // Group detection: WhatsApp group IDs end with @g.us
    const isGroup = from.endsWith('@g.us');
    const groupId = isGroup ? from : null;
    const actualFrom = isGroup
      ? (change.contacts?.[0]?.wa_id || from)
      : from;

    await handleWhatsAppMessage({ from: actualFrom, text, messageId, replyToId, displayName, isGroup, groupId });
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
  }
});

async function start() {
  await new Promise((resolve) => app.listen(PORT, resolve));
  console.log(`Server listening on port ${PORT}`);
  console.log('WhatsApp webhook ready at /bot/webhook');
}

start().catch(console.error);
