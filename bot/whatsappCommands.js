import {
  getUserByWhatsAppNumber,
  registerWhatsAppUser,
  generateLinkCode,
  joinFamily,
  getFamilyMembers,
} from '../services/family.js';
import { supabase } from '../db/supabase.js';
import { sendMessage } from './whatsapp.js';

const HELP_TEXT =
  `Here's what I can help with:\n\n` +
  `📅 Calendar\n` +
  `  "Add dinner at 7pm Friday"\n` +
  `  "What's on this week?"\n` +
  `  "Cancel the dentist"\n\n` +
  `⏰ Reminders\n` +
  `  "Remind me to take out the bins at 8pm"\n` +
  `  "What reminders do I have?"\n\n` +
  `📝 Lists\n` +
  `  "Add eggs to the grocery list"\n` +
  `  "Show me the shopping list"\n\n` +
  `🗑️ Bins\n` +
  `  "Which bin is it this week?"\n` +
  `  "Set up my bin reminders"\n\n` +
  `💬 Or just chat — ask me anything!\n\n` +
  `Commands: hi · help · link [code] · setgroup`;

/**
 * Check if the incoming message is a command and handle it.
 * Returns true if handled (caller should not process further), false otherwise.
 */
export async function handleWhatsAppCommand({ from, text, isGroup, groupId }) {
  const lower = text.trim().toLowerCase();

  // Registration / greeting
  if (lower === 'hi' || lower === 'hello' || lower === 'start') {
    await handleRegister(from, text);
    return true;
  }

  // Help
  if (lower === 'help') {
    await sendMessage(from, HELP_TEXT);
    return true;
  }

  // Link command: "link" (generate) or "link ABC123" (join)
  if (lower === 'link' || lower.startsWith('link ')) {
    await handleLink(from, text.trim());
    return true;
  }

  // Set family group (must be sent from a group)
  if (lower === 'setgroup') {
    await handleSetGroup(from, isGroup, groupId);
    return true;
  }

  return false;
}

async function handleRegister(from, text) {
  const existing = await getUserByWhatsAppNumber(from);
  if (existing) {
    await sendMessage(from,
      `Welcome back, ${existing.display_name}! 👋\n\nJust send me a message and I'll help with your calendar, reminders, lists and more.`
    );
    return;
  }

  // Use the first word of whatever they sent as a display name hint, otherwise "Friend"
  const displayName = text.split(' ').find(w => w.length > 1 && !/^(hi|hello|hey|start)$/i.test(w)) || 'Friend';

  const user = await registerWhatsAppUser(from, displayName);
  await sendMessage(from,
    `Hi ${user.display_name}! 🎉 You're registered.\n\n` +
    `Here's what I can do:\n` +
    `📅 Calendar — "Add dentist Tuesday 2pm"\n` +
    `⏰ Reminders — "Remind me to call mum in 2 hours"\n` +
    `📝 Lists — "Add milk to the grocery list"\n` +
    `🗑️ Bins — "Which bin is it this week?"\n` +
    `💬 Chat — Ask me anything!\n\n` +
    `To share with your partner, send: link`
  );
}

async function handleLink(from, text) {
  const user = await getUserByWhatsAppNumber(from);
  if (!user) {
    await sendMessage(from, 'Send "hi" first to register.');
    return;
  }

  const parts = text.split(' ');
  const code = parts[1]?.toUpperCase();

  if (code) {
    // Joining with a code
    const family = await joinFamily(user, code);
    if (!family) {
      await sendMessage(from, 'Invalid or expired code. Ask your partner to send "link" again to get a fresh one.');
      return;
    }
    const members = await getFamilyMembers(family.id);
    const names = members.map((m) => m.display_name).join(' and ');
    await sendMessage(from, `You're now linked! 🎉 ${names} are sharing calendars, lists, and more.`);
  } else {
    // Generating a code
    const linkCode = await generateLinkCode(user);
    await sendMessage(from,
      `Share this code with your partner:\n\n🔗 ${linkCode}\n\nThey should send: link ${linkCode}`
    );
  }
}

async function handleSetGroup(from, isGroup, groupId) {
  if (!isGroup || !groupId) {
    await sendMessage(from, 'Send "setgroup" from inside a WhatsApp group to set it as your family group.');
    return;
  }

  const user = await getUserByWhatsAppNumber(from);
  if (!user) {
    await sendMessage(from, 'Send "hi" in a DM first to register.');
    return;
  }

  const { error } = await supabase
    .from('families')
    .update({ whatsapp_group_id: groupId })
    .eq('id', user.family_id);

  if (error) {
    console.error('Failed to set WhatsApp group:', error);
    await sendMessage(from, 'Failed to save group. Please try again.');
    return;
  }

  await sendMessage(from, '✅ This group is now set as your family chat! Daily briefings will be sent here too.');
}
