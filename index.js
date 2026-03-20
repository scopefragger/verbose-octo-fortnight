import 'dotenv/config';
import express from 'express';
import { webhookCallback } from 'grammy';
import { bot } from './bot/bot.js';
import { checkReminders, sendDailyDigest, sendWeeklyDigest } from './routes/cron.js';
import { getDashboardData } from './routes/dashboard.js';
import { supabase } from './db/supabase.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
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
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Dashboard API — returns JSON data for the dashboard
app.get('/api/dashboard', async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
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
    res.json(data);
  } catch (err) {
    console.error('Dashboard API error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Only register webhook route when in webhook mode
if (isWebhookMode) {
  app.use(express.json());
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
