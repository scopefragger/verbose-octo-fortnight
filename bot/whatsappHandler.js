import { getUserByWhatsAppNumber, registerWhatsAppUser } from '../services/family.js';
import { chatCompletion } from '../llm/groq.js';
import { buildSystemPrompt } from '../llm/systemPrompt.js';
import { tools, dispatch } from '../llm/functions.js';
import { supabase } from '../db/supabase.js';
import { summariseMessages, getCachedSummary, saveSummary } from '../llm/summarise.js';
import { getTodayRow, upsertDay } from '../services/officeCheckin.js';
import { sendMessage, markRead } from './whatsapp.js';
import { handleWhatsAppCommand } from './whatsappCommands.js';
import { logError } from '../utils/errorLog.js';
import { classifyError } from '../utils/classifyError.js';

const MAX_HISTORY = 30;
const RECENT_VERBATIM = 1;
const MAX_TOOL_ROUNDS = 5;
const MAX_TOKEN_ESTIMATE = 6000;

/**
 * Process an incoming WhatsApp message from the webhook payload.
 */
export async function handleWhatsAppMessage({ from, text, messageId, replyToId, displayName, isGroup, groupId }) {
  // Mark as read immediately (best-effort)
  if (messageId) markRead(messageId);

  // Check for text-based commands first (hi, help, link, setgroup)
  const handled = await handleWhatsAppCommand({ from, text, messageId, displayName, isGroup, groupId });
  if (handled) return;

  // Look up registered user
  const user = await getUserByWhatsAppNumber(from);
  if (!user) {
    await sendMessage(from,
      `Hi! I don't recognise your number. Send "hi" to register and get started.`
    );
    return;
  }

  // Check if this is a reply to the daily digest → office check-in shortcut
  // replyToId is the ID of the message being replied to (from message.context.id in the webhook)
  if (replyToId && user.last_digest_message_id === replyToId) {
    await handleDigestReply({ from, user, text: text.trim() });
    return;
  }

  const familyId = user.family_id;
  const timezone = user.timezone || 'Europe/London';

  const history = await loadSmartHistory(user.id);
  const messages = [
    { role: 'system', content: buildSystemPrompt(user.display_name, timezone) },
    ...history,
    { role: 'user', content: text },
  ];
  trimToTokenBudget(messages);
  await saveMessage(user.id, 'user', text);

  try {
    let response = await chatCompletion(messages, tools);
    let rounds = 0;

    while (rounds < MAX_TOOL_ROUNDS) {
      const choice = response.choices[0];

      if (choice.finish_reason === 'tool_calls' || choice.message.tool_calls?.length > 0) {
        const toolCalls = choice.message.tool_calls;
        messages.push(choice.message);

        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          let args;
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch {
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: `Invalid arguments for ${functionName}` }),
            });
            continue;
          }
          const context = { familyId, userId: user.id, timezone };
          let result;
          try {
            result = await dispatch(functionName, args, context);
          } catch (err) {
            logError(`Tool ${functionName}`, err);
            result = JSON.stringify({ error: classifyError(err).userMessage });
          }
          messages.push({ role: 'tool', tool_call_id: toolCall.id, content: result });
        }

        response = await chatCompletion(messages);
        rounds++;
      } else {
        break;
      }
    }

    const reply = response.choices[0].message.content;
    if (reply) {
      await sendMessage(from, reply);
      await saveMessage(user.id, 'assistant', reply);
    }
  } catch (err) {
    logError('WhatsApp message handler', err);
    try {
      await sendMessage(from, classifyError(err).userMessage);
    } catch (sendErr) {
      logError('WhatsApp sendMessage failed', sendErr, { from });
    }
  }
}

/**
 * Handle a reply to the daily digest as an office check-in.
 */
async function handleDigestReply({ from, user, text }) {
  const timezone = user.timezone || 'Europe/London';
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: timezone });

  const dow = new Date(todayStr + 'T12:00:00').getDay();
  if (dow === 0 || dow === 6) {
    await sendMessage(from, "No check-in needed — today is a weekend! 🎉");
    return;
  }

  const existing = await getTodayRow(user.family_id, todayStr);
  const lower = text.toLowerCase();

  let dayType, destination;
  if (lower.startsWith('travel')) {
    dayType = 'travel';
    destination = text.slice(6).trim() || existing?.destination || null;
  } else if (lower === 'off' || lower.startsWith('time off') || lower === 'holiday') {
    dayType = 'time_off';
  } else {
    dayType = existing?.day_type || 'office';
    destination = existing?.destination || null;
  }

  const fields = {
    day_type:          dayType,
    confirmed:         dayType !== 'time_off',
    parking_booked:    existing?.parking_booked    ?? false,
    destination:       destination,
    flight_booked:     existing?.flight_booked     ?? false,
    hotel_booked:      existing?.hotel_booked      ?? false,
    expense_submitted: existing?.expense_submitted ?? false,
    expense_received:  existing?.expense_received  ?? false,
    notes:             existing?.notes             ?? null,
  };

  try {
    await upsertDay(user.family_id, todayStr, fields);
  } catch (err) {
    logError('WhatsApp digest check-in', err);
    try {
      await sendMessage(from, "Couldn't check in right now. Please try again in a moment.");
    } catch (sendErr) {
      logError('WhatsApp sendMessage failed', sendErr, { from });
    }
    return;
  }

  const dateLabel = new Date(todayStr + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  const typeLabel = dayType === 'office'  ? '🏢 Office'
                  : dayType === 'travel'  ? `✈️ Travel${destination ? ' to ' + destination : ''}`
                  : '🏖️ Time Off';
  const wasPlanned = existing && !existing.confirmed;
  const suffix = wasPlanned ? '' : existing ? ' (already confirmed)' : ' — logged & confirmed';

  await sendMessage(from, `✅ Checked in — ${typeLabel} (${dateLabel})${suffix}`);
}

async function loadSmartHistory(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('role, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(MAX_HISTORY);

  if (error) { console.error('Failed to load history:', error); return []; }
  if (!data || data.length === 0) return [];

  const allMessages = data.reverse();
  if (allMessages.length <= RECENT_VERBATIM) {
    return allMessages.map(({ role, content }) => ({ role, content }));
  }

  const olderMessages = allMessages.slice(0, allMessages.length - RECENT_VERBATIM);
  const recentMessages = allMessages.slice(allMessages.length - RECENT_VERBATIM);

  const cached = await getCachedSummary(userId);
  let summaryText = null;
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const summaryFresh = cached &&
    cached.covers_up_to >= olderMessages[olderMessages.length - 1]?.created_at &&
    Date.now() - new Date(cached.created_at).getTime() < ONE_HOUR_MS;

  if (summaryFresh) {
    summaryText = cached.summary;
  } else {
    summaryText = await summariseMessages(olderMessages);
    if (summaryText && olderMessages.length > 0) {
      await saveSummary(userId, summaryText, olderMessages[olderMessages.length - 1].created_at);
    }
  }

  const result = [];
  if (summaryText) {
    result.push({ role: 'system', content: `Previous conversation context: ${summaryText}` });
  }
  for (const msg of recentMessages) {
    result.push({ role: msg.role, content: msg.content });
  }
  return result;
}

function trimToTokenBudget(messages) {
  const estimateTokens = () =>
    messages.reduce((sum, m) => sum + (m.content?.length || 0) / 4, 0);

  while (estimateTokens() > MAX_TOKEN_ESTIMATE && messages.length > 3) {
    const idx = messages.findIndex((m, i) => i > 0 && m.role !== 'system');
    if (idx === -1) break;
    messages.splice(idx, 1);
  }
}

async function saveMessage(userId, role, content) {
  const { error } = await supabase.from('conversations').insert({ user_id: userId, role, content });
  if (error) logError('saveMessage', error);
}
