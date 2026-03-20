import {
  getUserByTelegramId,
  registerUser,
  generateLinkCode,
  joinFamily,
  getFamilyMembers,
} from '../services/family.js';

/**
 * Register all slash commands on the bot.
 */
export function registerCommands(bot) {
  bot.command('start', handleStart);
  bot.command('help', handleHelp);
  bot.command('link', handleLink);
}

async function handleStart(ctx) {
  const telegramId = ctx.from.id;
  const existing = await getUserByTelegramId(telegramId);

  if (existing) {
    await ctx.reply(
      `Welcome back, ${existing.display_name}! 👋\n\nYou're all set. Just send me a message and I'll help with your calendar, reminders, and lists.`
    );
    return;
  }

  const displayName = ctx.from.first_name || 'Friend';
  const username = ctx.from.username;

  const user = await registerUser(telegramId, displayName, username);
  await ctx.reply(
    `Hi ${user.display_name}! 🎉 You're registered.\n\n` +
    `Here's what I can do:\n` +
    `📅 Calendar — "Add dentist Tuesday 2pm"\n` +
    `⏰ Reminders — "Remind me to call mom in 2 hours"\n` +
    `📝 Lists — "Add milk to the grocery list"\n` +
    `💬 Chat — Ask me anything!\n\n` +
    `To share with your partner, send /link to get a code.`
  );
}

async function handleHelp(ctx) {
  await ctx.reply(
    `Here's what I can help with:\n\n` +
    `📅 Calendar\n` +
    `  "Add dinner at 7pm Friday"\n` +
    `  "What's on the calendar this week?"\n` +
    `  "Cancel the dentist appointment"\n\n` +
    `⏰ Reminders\n` +
    `  "Remind me to take out the trash at 8pm"\n` +
    `  "What reminders do I have?"\n\n` +
    `📝 Shared Lists\n` +
    `  "Add eggs to the grocery list"\n` +
    `  "Show me the grocery list"\n` +
    `  "Check off milk"\n\n` +
    `💬 Or just chat — I'm happy to help with anything!\n\n` +
    `Commands:\n` +
    `/start — Register\n` +
    `/link — Link with your partner\n` +
    `/help — Show this message`
  );
}

async function handleLink(ctx) {
  const telegramId = ctx.from.id;
  const user = await getUserByTelegramId(telegramId);

  if (!user) {
    await ctx.reply('Please /start first to register.');
    return;
  }

  const args = ctx.message.text.split(' ').slice(1).join(' ').trim();

  if (args) {
    // Joining with a code
    const family = await joinFamily(user, args.toUpperCase());
    if (!family) {
      await ctx.reply('Invalid or expired link code. Ask your partner to send /link again.');
      return;
    }
    const members = await getFamilyMembers(family.id);
    const names = members.map((m) => m.display_name).join(' and ');
    await ctx.reply(`You're now linked! 🎉 ${names} are sharing calendars, lists, and more.`);
  } else {
    // Generating a code
    const code = await generateLinkCode(user);
    await ctx.reply(
      `Share this code with your partner:\n\n` +
      `🔗 ${code}\n\n` +
      `They should send: /link ${code}`
    );
  }
}
