import { Bot } from 'grammy';
import { registerCommands } from './commands.js';
import { handleMessage } from './messageHandler.js';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Error handling
bot.catch((err) => {
  console.error('Bot error:', err);
});

// Allowlist: only permit specific Telegram user IDs
// Set ALLOWED_TELEGRAM_IDS in env as a comma-separated list of numeric IDs
// If not set, the bot is open to anyone (backwards-compatible)
const allowedIds = process.env.ALLOWED_TELEGRAM_IDS
  ? process.env.ALLOWED_TELEGRAM_IDS.split(',').map((id) => Number(id.trim()))
  : null;

if (allowedIds) {
  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !allowedIds.includes(userId)) {
      // Silently ignore messages from unknown users
      return;
    }
    await next();
  });
}

// Register /start, /help, /link commands
registerCommands(bot);

// All other text messages go through the LLM
bot.on('message:text', handleMessage);

export { bot };
