import 'dotenv/config';
import express from 'express';
import { webhookCallback } from 'grammy';
import { bot } from './bot/bot.js';
import { checkReminders } from './routes/cron.js';

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
