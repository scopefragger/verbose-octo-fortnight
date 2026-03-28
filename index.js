import 'dotenv/config';
import express from 'express';
import { webhookCallback } from 'grammy';
import { bot } from './bot/bot.js';
import { checkReminders, sendDailyDigest, sendWeeklyDigest } from './routes/cron.js';
import { getDashboardData } from './routes/dashboard.js';
import { setMeal, removeMeal, getUniqueMealTitles } from './services/meals.js';
import { createEvent, deleteEvent } from './services/calendar.js';
import { addItem, removeItem, removeItemById } from './services/lists.js';
import { createReminder, deleteReminder } from './services/reminders.js';
import { seedUKHolidays } from './services/holidays.js';
import { setTheme, listThemes } from './services/themes.js';
import { adjustPoints, getPointHistory } from './services/points.js';
import { addFoodItem, getFoodItems, removeFoodItemById } from './services/foodExpiry.js';
import { createCountdown, updateCountdown, deleteCountdown } from './services/countdowns.js';
import { getWatchlist, addToWatchlist, markWatched, removeFromWatchlist } from './services/watchlist.js';
import { getBirthdays, addBirthday, updateBirthday, removeBirthday } from './services/birthdays.js';
import { supabase } from './db/supabase.js';
import { registerInvalidator } from './utils/cache.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const isWebhookMode = Boolean(process.env.WEBHOOK_URL);

// Health endpoint for cron-job.org keep-alive
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Cron endpoint for reminder delivery
app.get('/cron/check', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const result = await checkReminders(bot);
    res.json(result);
  } catch (err) {
    console.error('Cron check failed:', err);
    res.status(500).json({ error: 'check failed' });
  }
});

// Daily digest — called by cron-job.org at 8am
app.get('/cron/daily', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const result = await sendDailyDigest(bot);
    res.json(result);
  } catch (err) {
    console.error('Daily digest failed:', err);
    res.status(500).json({ error: 'digest failed' });
  }
});

// Weekly digest — called by cron-job.org every Sunday
app.get('/cron/weekly', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const result = await sendWeeklyDigest(bot);
    res.json(result);
  } catch (err) {
    console.error('Weekly digest failed:', err);
    res.status(500).json({ error: 'digest failed' });
  }
});

// Dashboard HTML page
app.get('/dashboard', (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).send('Unauthorized — add ?secret=YOUR_SECRET to the URL');
  }
  const filePath = path.join(__dirname, 'public', 'dashboard.html');
  const html = fs.readFileSync(filePath, 'utf-8');
  res.type('html').send(html);
});

// Dashboard API — returns JSON data for the dashboard (cached to reduce Supabase load)
let dashboardCache = { data: null, timestamp: 0 };
const CACHE_TTL = 300_000; // 5 minutes

function invalidateCache() { dashboardCache.timestamp = 0; }
registerInvalidator(invalidateCache);

app.get('/api/dashboard', async (req, res) => {
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
    console.error('Dashboard API error:', err);
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

// Meal API — create or update a meal
app.post('/api/meals', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const meal = await setMeal(familyId, req.body, null);
    invalidateCache();
    res.json(meal);
  } catch (err) {
    console.error('Meal create/update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Meal API — delete a meal
app.delete('/api/meals', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { meal_date, meal_type } = req.body;
    await removeMeal(familyId, meal_date, meal_type);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    console.error('Meal delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get unique meal titles for the meal picker wheel
app.get('/api/meal-titles', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const titles = await getUniqueMealTitles(familyId);
    res.json({ titles });
  } catch (err) {
    console.error('Meal titles error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Food expiry API
app.get('/api/food-items', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const items = await getFoodItems(familyId);
    res.json({ items });
  } catch (err) {
    console.error('Food items error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/food-items', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { name, expires_at, quantity } = req.body;
    const item = await addFoodItem(familyId, name, expires_at, quantity);
    invalidateCache();
    res.json({ item });
  } catch (err) {
    console.error('Add food item error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/food-items', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const { item_id } = req.body;
    await removeFoodItemById(item_id);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    console.error('Remove food item error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Countdown API
app.post('/api/countdowns', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { title, target_date, background } = req.body;
    if (!title || !target_date) return res.status(400).json({ error: 'title and target_date required' });
    const countdown = await createCountdown(familyId, { title, target_date, background });
    invalidateCache();
    res.json(countdown);
  } catch (err) {
    console.error('Create countdown error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/countdowns/:id', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const countdown = await updateCountdown(req.params.id, familyId, req.body);
    invalidateCache();
    res.json(countdown);
  } catch (err) {
    console.error('Update countdown error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/countdowns/:id', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const deleted = await deleteCountdown(req.params.id, familyId);
    invalidateCache();
    res.json({ deleted: true, title: deleted?.title });
  } catch (err) {
    console.error('Delete countdown error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Event API — create an event
app.post('/api/events', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { data: users } = await supabase.from('users').select('id').eq('family_id', familyId).limit(1);
    const event = await createEvent(familyId, users?.[0]?.id || null, req.body);
    invalidateCache();
    res.json(event);
  } catch (err) {
    console.error('Event create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Event API — delete an event
app.delete('/api/events', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await deleteEvent(req.body.event_id, familyId);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    console.error('Event delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List item API — add an item
app.post('/api/list-items', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { list_name, text } = req.body;
    const result = await addItem(familyId, list_name, text, null);
    invalidateCache();
    res.json(result);
  } catch (err) {
    console.error('List item add error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List item API — remove an item
app.delete('/api/list-items', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { list_name, text } = req.body;
    await removeItem(familyId, list_name, text);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    console.error('List item remove error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List item delete by ID (used by dashboard checkboxes)
app.delete('/api/list-items/:id', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    await removeItemById(req.params.id);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    console.error('List item delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reminder API — create a reminder
app.post('/api/reminders', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    // Get the first user to associate the reminder with
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users?.length) return res.status(404).json({ error: 'No user found' });
    const reminder = await createReminder(users[0].id, req.body);
    invalidateCache();
    res.json(reminder);
  } catch (err) {
    console.error('Reminder create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reminder API — delete a reminder
app.delete('/api/reminders', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users?.length) return res.status(404).json({ error: 'No user found' });
    await deleteReminder(req.body.reminder_id, users[0].id);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    console.error('Reminder delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Adjust kid points
app.post('/api/points', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
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
    console.error('Points adjust error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get point history for a kid
app.get('/api/point-history', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { kid_name } = req.query;
    if (!kid_name) return res.status(400).json({ error: 'kid_name is required' });
    const result = await getPointHistory(familyId, kid_name);
    res.json(result);
  } catch (err) {
    console.error('Point history error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get available themes
app.get('/api/themes', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  res.json(listThemes());
});

// Set dashboard theme
app.post('/api/theme', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const result = await setTheme(familyId, req.body.theme);
    invalidateCache();
    res.json(result);
  } catch (err) {
    console.error('Theme set error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Seed UK holidays for a year
app.post('/api/seed-holidays', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { data: users } = await supabase.from('users').select('id').eq('family_id', familyId).limit(1);
    const year = req.body.year || new Date().getFullYear();
    const results = await seedUKHolidays(familyId, users?.[0]?.id || null, year);
    invalidateCache();
    res.json({ year, holidays: results });
  } catch (err) {
    console.error('Seed holidays error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Watchlist ──
app.get('/api/watchlist', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const includeWatched = req.query.watched === 'true';
    const items = await getWatchlist(familyId, includeWatched);
    res.json({ items });
  } catch (err) {
    console.error('Watchlist fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/watchlist', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const item = await addToWatchlist(familyId, req.body, null);
    invalidateCache();
    res.json(item);
  } catch (err) {
    console.error('Watchlist add error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/watchlist/:id/watched', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const item = await markWatched(req.params.id, familyId, req.body.rating);
    invalidateCache();
    res.json(item);
  } catch (err) {
    console.error('Watchlist mark watched error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/watchlist/:id', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await removeFromWatchlist(req.params.id, familyId);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    console.error('Watchlist remove error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Birthdays ──
app.get('/api/birthdays', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const items = await getBirthdays(familyId);
    res.json({ birthdays: items });
  } catch (err) {
    console.error('Birthdays fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/birthdays', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const item = await addBirthday(familyId, req.body);
    invalidateCache();
    res.json(item);
  } catch (err) {
    console.error('Birthday add error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/birthdays/:id', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const item = await updateBirthday(req.params.id, familyId, req.body);
    invalidateCache();
    res.json(item);
  } catch (err) {
    console.error('Birthday update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/birthdays/:id', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await removeBirthday(req.params.id, familyId);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    console.error('Birthday remove error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Only register webhook route when in webhook mode
if (isWebhookMode) {
  app.post('/bot/webhook', webhookCallback(bot, 'express'));
}

// Set webhook and start server
async function start() {
  if (isWebhookMode) {
    const webhookUrl = process.env.WEBHOOK_URL;
    await bot.api.setWebhook(`${webhookUrl}/bot/webhook`, {
      secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
    });
    console.log(`Webhook set to ${webhookUrl}/bot/webhook`);
  } else {
    // Local development: use long polling
    console.log('Starting in long polling mode (local dev)...');
    await bot.api.deleteWebhook();
    bot.start();
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch(console.error);
