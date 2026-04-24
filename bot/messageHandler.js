import { getUserByTelegramId } from '../services/family.js';
import { chatCompletion } from '../llm/groq.js';
import { buildSystemPrompt } from '../llm/systemPrompt.js';
import { tools, dispatch, confirmationRequiredTools } from '../llm/functions.js';
import { supabase } from '../db/supabase.js';
import { summariseMessages, getCachedSummary, saveSummary } from '../llm/summarise.js';
import { getTodayRow, upsertDay } from '../services/officeCheckin.js';
import { checkRateLimit, logApiCall } from '../services/rateLimiter.js';
import { logError } from '../utils/errorLog.js';
import { classifyError } from '../utils/classifyError.js';

const MAX_HISTORY = 30;
const RECENT_VERBATIM = 8; // Keep last 8 messages as-is (4 exchanges)
const MAX_TOOL_ROUNDS = 5;
const MAX_TOKEN_ESTIMATE = 6000; // Rough char/4 budget for context

/**
 * Handle all non-command text messages.
 * Routes through Groq with function calling.
 */
export async function handleMessage(ctx) {
  const telegramId = ctx.from.id;
  const user = await getUserByTelegramId(telegramId);

  if (!user) {
    await ctx.reply('Please send /start first to register!');
    return;
  }

  // Check if this is a reply to the daily digest → office check-in shortcut
  const replyToId = ctx.message.reply_to_message?.message_id;
  if (replyToId && user.last_digest_message_id === replyToId) {
    await handleDigestReply(ctx, user, (ctx.message.text || '').trim());
    return;
  }

  const userMessage = ctx.message.text;
  const familyId = user.family_id;
  const timezone = user.timezone || 'Europe/London';

  // Load conversation history with smart summarisation
  const history = await loadSmartHistory(user.id);

  // Build messages array for Groq
  const messages = [
    { role: 'system', content: buildSystemPrompt(user.display_name, timezone) },
    ...history,
    { role: 'user', content: userMessage },
  ];

  // Trim if context is too large
  trimToTokenBudget(messages);

  // Save user message to history
  await saveMessage(user.id, 'user', userMessage);

  // Send "typing" indicator
  await ctx.replyWithChatAction('typing');

  try {
    // Rate limit check — throws with a user-friendly message if exceeded
    await checkRateLimit(familyId);

    // Chat completion loop (handles multi-round tool calls)
    let response = await chatCompletion(messages, tools);
    logApiCall(familyId, user.id, response.model, response.usage?.total_tokens);
    let rounds = 0;

    while (rounds < MAX_TOOL_ROUNDS) {
      const choice = response.choices[0];

      if (choice.finish_reason === 'tool_calls' || choice.message.tool_calls?.length > 0) {
        const toolCalls = choice.message.tool_calls;

        // Add assistant's tool call message to context
        messages.push(choice.message);

        // Execute each tool call
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

          // Enforce confirmation for destructive tools if not already confirmed
          if (confirmationRequiredTools.has(functionName) && !hasPendingConfirmation(messages, functionName)) {
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                confirmation_required: true,
                tool: functionName,
                message: 'Ask the user to confirm this action before proceeding. Do not call this tool again until they explicitly confirm (e.g. "yes", "confirm", "go ahead").',
              }),
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

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result,
          });
        }

        // Get next response from Groq
        await ctx.replyWithChatAction('typing');
        response = await chatCompletion(messages, tools);
        logApiCall(familyId, user.id, response.model, response.usage?.total_tokens);
        rounds++;
      } else {
        // No more tool calls — we have the final response
        break;
      }
    }

    const reply = response.choices[0].message.content;
    if (reply) {
      await ctx.reply(reply);
      await saveMessage(user.id, 'assistant', reply);
    }
  } catch (err) {
    logError('Telegram message handler', err);
    await ctx.reply(classifyError(err).userMessage);
  }
}

/**
 * Load conversation history with smart summarisation.
 * Keeps recent messages verbatim and summarises older ones.
 */
async function loadSmartHistory(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('role, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(MAX_HISTORY);

  if (error) {
    console.error('Failed to load history:', error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Reverse to chronological order
  const allMessages = data.reverse();

  // If we have fewer messages than the verbatim threshold, return all
  if (allMessages.length <= RECENT_VERBATIM) {
    return allMessages.map(({ role, content }) => ({ role, content }));
  }

  // Split: older messages to summarise, recent to keep verbatim
  const olderMessages = allMessages.slice(0, allMessages.length - RECENT_VERBATIM);
  const recentMessages = allMessages.slice(allMessages.length - RECENT_VERBATIM);

  // Check if we have a cached summary that covers these older messages
  const cached = await getCachedSummary(userId);
  const oldestRecent = recentMessages[0]?.created_at;
  let summaryText = null;

  if (cached && cached.covers_up_to >= olderMessages[olderMessages.length - 1]?.created_at) {
    // Cached summary is still valid
    summaryText = cached.summary;
  } else {
    // Generate new summary from older messages
    summaryText = await summariseMessages(olderMessages);
    if (summaryText && olderMessages.length > 0) {
      await saveSummary(
        userId,
        summaryText,
        olderMessages[olderMessages.length - 1].created_at
      );
    }
  }

  const result = [];

  // Add summary as a system-style context message
  if (summaryText) {
    result.push({
      role: 'system',
      content: `Previous conversation context: ${summaryText}`,
    });
  }

  // Add recent verbatim messages
  for (const msg of recentMessages) {
    result.push({ role: msg.role, content: msg.content });
  }

  return result;
}

/**
 * Trim messages to stay within a rough token budget.
 * Removes oldest non-system messages first.
 */
function trimToTokenBudget(messages) {
  const estimateTokens = () =>
    messages.reduce((sum, m) => sum + (m.content?.length || 0) / 4, 0);

  while (estimateTokens() > MAX_TOKEN_ESTIMATE && messages.length > 3) {
    // Find the first non-system message to remove (index 1 is usually the summary or first history)
    const idx = messages.findIndex((m, i) => i > 0 && m.role !== 'system');
    if (idx === -1) break;
    messages.splice(idx, 1);
  }
}

/**
 * Handle a reply to the daily digest as an office check-in.
 * Parses the reply text to determine day type, then upserts with confirmed=true.
 */
async function handleDigestReply(ctx, user, text) {
  const timezone = user.timezone || 'Europe/London';
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: timezone });

  // Reject weekends
  const dow = new Date(todayStr + 'T12:00:00').getDay();
  if (dow === 0 || dow === 6) {
    await ctx.reply("No check-in needed — today is a weekend! 🎉");
    return;
  }

  const existing = await getTodayRow(user.family_id, todayStr);
  const lower = text.toLowerCase();

  // Determine day type and destination from reply text
  let dayType, destination;
  if (lower.startsWith('travel')) {
    dayType = 'travel';
    destination = text.slice(6).trim() || existing?.destination || null;
  } else if (lower === 'off' || lower.startsWith('time off') || lower === 'holiday') {
    dayType = 'time_off';
  } else {
    // "in", "yes", "office", "✓", blank — confirm existing type or default to office
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
    logError('Telegram digest check-in', err);
    await ctx.reply("Couldn't check in right now. Please try again in a moment.");
    return;
  }

  const dateLabel = new Date(todayStr + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  const typeLabel = dayType === 'office'   ? '🏢 Office'
                  : dayType === 'travel'   ? `✈️ Travel${destination ? ' to ' + destination : ''}`
                  : '🏖️ Time Off';

  const wasPlanned = existing && !existing.confirmed;
  const suffix = wasPlanned ? '' : existing ? ' (already confirmed)' : ' — logged & confirmed';

  await ctx.reply(`✅ Checked in — ${typeLabel} (${dateLabel})${suffix}`);
}

/**
 * Check if a prior confirmation request for this tool exists in the messages array.
 * Used to allow a destructive tool to proceed after the user has already confirmed.
 * The confirmation_required result from a prior turn is loaded into messages via history.
 */
function hasPendingConfirmation(messages, toolName) {
  for (const msg of messages) {
    if (msg.role === 'tool' && msg.content) {
      try {
        const result = JSON.parse(msg.content);
        if (result.confirmation_required === true && result.tool === toolName) {
          return true;
        }
      } catch {
        // ignore unparseable tool results
      }
    }
  }
  return false;
}

/**
 * Save a message to conversation history.
 */
async function saveMessage(userId, role, content) {
  const { error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, role, content });

  if (error) {
    logError('saveMessage', error);
  }
}
