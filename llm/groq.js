import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

/**
 * Run a chat completion with optional tool definitions.
 * Handles Groq rate-limit fallback to a smaller model.
 */
export async function chatCompletion(messages, tools = []) {
  const params = {
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  };

  if (tools.length > 0) {
    params.tools = tools;
    params.tool_choice = 'auto';
  }

  try {
    return await groq.chat.completions.create(params);
  } catch (err) {
    if (err.status === 429) {
      console.warn('Groq rate limited, falling back to', FALLBACK_MODEL);
      params.model = FALLBACK_MODEL;
      return await groq.chat.completions.create(params);
    }
    throw err;
  }
}
