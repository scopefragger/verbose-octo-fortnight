import {
  getUserByTelegramId,
  registerUser,
  generateLinkCode,
  joinFamily,
  getFamilyMembers,
} from '../services/family.js';
import { supabase } from '../db/supabase.js';

/**
 * Register all slash commands on the bot.
 */
export function registerCommands(bot) {
  bot.command('start', handleStart);
  bot.command('help', handleHelp);
  bot.command('link', handleLink);
  bot.command('setgroup', handleSetGroup);
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
    `📅 Calendar — "Add dentist Tuesday 2pm" · "What's on this week?"\n` +
    `⏰ Reminders — "Remind me to call mum at 6pm" · "Snooze that reminder"\n` +
    `📝 Lists — "Add milk to shopping" · "Show the grocery list" · "Tick off eggs"\n` +
    `🍽️ Meal planning — "What's for dinner?" · "Plan pasta for Wednesday"\n` +
    `⭐ Kid points — "Give Sam 5 points for tidying up"\n` +
    `⏳ Countdowns — "Create a countdown to Disney in July"\n` +
    `🎂 Birthdays — "Add Gran's birthday, 12th June 1948"\n` +
    `👀 Watchlist — "Add Moana 2 to our watchlist"\n` +
    `🥗 Food expiry — "Track the chicken, use by Thursday"\n` +
    `🍎 Calorie log — "Log a banana for breakfast"\n` +
    `🎯 Family goals — "Add a goal: read 10 books this month"\n` +
    `🏢 Office tracker — "I'm in the office today"\n` +
    `🌤️ Weather — "What's the weather like?"\n` +
    `🗑️ Bins — "Which bin goes out this week?"\n` +
    `🎨 Dashboard theme — "Set the theme to Christmas"\n\n` +
    `Commands:\n` +
    `/start — Register\n` +
    `/link — Link with your partner\n` +
    `/help — Show this message`
  );
}

async function handleSetGroup(ctx) {
  const isGroup = ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';
  if (!isGroup) {
    await ctx.reply('Run this command in a group chat to set it as your family group.');
    return;
  }

  const telegramId = ctx.from.id;
  const user = await getUserByTelegramId(telegramId);
  if (!user) {
    await ctx.reply('Please /start in a DM first to register.');
    return;
  }

  const chatId = String(ctx.chat.id);
  const { error } = await supabase
    .from('families')
    .update({ group_chat_id: chatId })
    .eq('id', user.family_id);

  if (error) {
    console.error('Failed to set group chat:', error);
    await ctx.reply('Failed to save group chat. Please try again.');
    return;
  }

  await ctx.reply('✅ This group is now set as your family chat! Daily briefings will be sent here too.');
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
