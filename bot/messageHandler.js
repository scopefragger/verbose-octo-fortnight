import { getUserByTelegramId } from '../services/family.js';
import { chatCompletion } from '../llm/groq.js';
import { buildSystemPrompt } from '../llm/systemPrompt.js';
import { tools, dispatch } from '../llm/functions.js';
import { supabase } from '../db/supabase.js';

const MAX_HISTORY = 20;
const MAX_TOOL_ROUNDS = 5;

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
  const timezone = user.timezone || 'America/New_York';

  // Load conversation history
  const history = await loadHistory(user.id);

  // Build messages array for Groq
  const messages = [
    { role: 'system', content: buildSystemPrompt(user.display_name, timezone) },
    ...history,
    { role: 'user', content: userMessage },
  ];

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
 * Load the last N messages from conversation history.
 */
async function loadHistory(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('role, content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(MAX_HISTORY);

  if (error) {
    console.error('Failed to load history:', error);
    return [];
  }

  // Reverse to chronological order
  return data.reverse();
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
