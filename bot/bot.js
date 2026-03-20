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

// Cache bot info for group chat mention detection
let cachedBotInfo = null;

// Register /start, /help, /link commands
registerCommands(bot);

// All other text messages go through the LLM
// In group chats, only respond when the bot is mentioned or replied to
bot.on('message:text', async (ctx) => {
  const isGroup = ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';

  if (isGroup) {
    if (!cachedBotInfo) cachedBotInfo = await bot.api.getMe();
    const botUsername = cachedBotInfo.username?.toLowerCase();
    const text = (ctx.message.text || '').toLowerCase();
    const isReplyToBot = ctx.message.reply_to_message?.from?.id === cachedBotInfo.id;
    const isMentioned = botUsername && text.includes(`@${botUsername}`);

    if (!isMentioned && !isReplyToBot) {
      return;
    }
  }

  await handleMessage(ctx);
});

export { bot };
