import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { webhookCallback } from 'grammy';
import { bot } from './bot/bot.js';
import { checkReminders, sendDailyDigest, sendWeeklyDigest } from './routes/cron.js';
import { getDashboardData } from './routes/dashboard.js';
import authRoutes from './routes/auth.js';
import { requireAuth, requireCronSecret } from './middleware/auth.js';
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
import { getIdeas, addIdea, deleteIdea, processIdeaQueue, generateIdeas } from './services/ideas.js';
import * as expensesService from './services/expenses.js';
import * as choresService from './services/chores.js';
import * as memoriesService from './services/memories.js';
import { supabase } from './db/supabase.js';
import { registerInvalidator } from './utils/cache.js';
import { logError, getErrors, clearErrors } from './utils/errorLog.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 3000;
const isWebhookMode = Boolean(process.env.WEBHOOK_URL);

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
    const result = await checkReminders(bot);
    res.json(result);
  } catch (err) {
    logError('cron-check', err);
    res.status(500).json({ error: 'check failed' });
  }
});

// Daily digest — called by cron-job.org at 8am
app.get('/cron/daily', requireCronSecret, async (req, res) => {
  try {
    const result = await sendDailyDigest(bot);
    res.json(result);
  } catch (err) {
    logError('daily-digest', err);
    res.status(500).json({ error: 'digest failed' });
  }
});

// Weekly digest — called by cron-job.org every Sunday
app.get('/cron/weekly', requireCronSecret, async (req, res) => {
  try {
    const result = await sendWeeklyDigest(bot);
    res.json(result);
  } catch (err) {
    logError('weekly-digest', err);
    res.status(500).json({ error: 'digest failed' });
  }
});

// Dashboard HTML page
app.get('/dashboard', requireAuth, (req, res) => {
  const filePath = path.join(__dirname, 'public', 'dashboard.html');
  const html = fs.readFileSync(filePath, 'utf-8');
  res.type('html').send(html);
});

// Ideas Lab page
app.get('/ideas', requireAuth, (req, res) => {
  const filePath = path.join(__dirname, 'public', 'ideas.html');
  const html = fs.readFileSync(filePath, 'utf-8');
  res.type('html').send(html);
});

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

// Meal API — create or update a meal
app.post('/api/meals', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
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
    const { item_id } = req.body;
    await removeFoodItemById(item_id);
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
    await removeItemById(req.params.id);
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

// ── Expenses & Budgets ──
app.get('/api/expenses', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { month, year, category } = req.query;
    const items = await expensesService.listExpenses(familyId, {
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      category: category || undefined,
    });
    res.json({ expenses: items });
  } catch (err) {
    logError('Expenses list', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { amount, category, note, paid_by, expense_date } = req.body;
    if (!amount || !category) return res.status(400).json({ error: 'amount and category are required' });
    const item = await expensesService.addExpense(familyId, { amount, category, note, paid_by, expense_date }, null);
    invalidateCache();
    res.json(item);
  } catch (err) {
    logError('Expenses add', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await expensesService.deleteExpense(familyId, req.params.id);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('Expenses delete', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/expenses/summary', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const now = new Date();
    const summary = await expensesService.getMonthlySpend(familyId, now.getMonth() + 1, now.getFullYear());
    res.json({ summary });
  } catch (err) {
    logError('Expenses summary', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/budgets', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const budgets = await expensesService.listBudgets(familyId);
    res.json({ budgets });
  } catch (err) {
    logError('Budgets list', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { category, monthly_limit } = req.body;
    if (!category || !monthly_limit) return res.status(400).json({ error: 'category and monthly_limit are required' });
    const budget = await expensesService.setBudget(familyId, { category, monthly_limit });
    invalidateCache();
    res.json(budget);
  } catch (err) {
    logError('Budgets set', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Chores ──
app.get('/api/chores', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { assigned_to, due_by } = req.query;
    const items = await choresService.listChores(familyId, {
      assigned_to: assigned_to || undefined,
      due_by: due_by || undefined,
    });
    res.json({ chores: items });
  } catch (err) {
    logError('Chores list', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chores', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { title, assigned_to, recurrence, next_due, points_reward } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const chore = await choresService.addChore(familyId, { title, assigned_to, recurrence, next_due, points_reward });
    invalidateCache();
    res.json(chore);
  } catch (err) {
    logError('Chores add', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/chores/:id/complete', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const { completed_by, award_points } = req.body;
    const result = await choresService.completeChore(familyId, req.params.id, { completed_by, award_points });
    invalidateCache();
    res.json(result);
  } catch (err) {
    logError('Chores complete', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/chores/:id', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    await choresService.deleteChore(familyId, req.params.id);
    invalidateCache();
    res.json({ deleted: true });
  } catch (err) {
    logError('Chores delete', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/chores/overdue', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    const items = await choresService.getOverdueChores(familyId);
    res.json({ chores: items });
  } catch (err) {
    logError('Chores overdue', err);
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
