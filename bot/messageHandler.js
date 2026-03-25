import { getUserByTelegramId } from '../services/family.js';
import { chatCompletion } from '../llm/groq.js';
import { buildSystemPrompt } from '../llm/systemPrompt.js';
import { tools, dispatch } from '../llm/functions.js';
import { supabase } from '../db/supabase.js';
import { summariseMessages, getCachedSummary, saveSummary } from '../llm/summarise.js';

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
    // Chat completion loop (handles multi-round tool calls)
    let response = await chatCompletion(messages, tools);
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
          const args = JSON.parse(toolCall.function.arguments);
          const context = { familyId, userId: user.id, timezone };

          let result;
          try {
            result = await dispatch(functionName, args, context);
          } catch (err) {
            console.error(`Tool ${functionName} failed:`, err.message);
            result = JSON.stringify({ error: `Failed to execute ${functionName}: ${err.message}` });
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
    console.error('Message handling error:', err);
    await ctx.reply("Sorry, I hit an error. Please try again in a moment.");
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
 * Save a message to conversation history.
 */
async function saveMessage(userId, role, content) {
  const { error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, role, content });

  if (error) {
    console.error('Failed to save message:', error);
  }
}
