import { Bot } from 'grammy';
import { registerCommands } from './commands.js';
import { handleMessage } from './messageHandler.js';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Error handling
bot.catch((err) => {
  console.error('Bot error:', err);
});

// Register /start, /help, /link commands
registerCommands(bot);

// All other text messages go through the LLM
bot.on('message:text', handleMessage);

export { bot };
