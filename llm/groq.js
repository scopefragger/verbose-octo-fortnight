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
      // The 8b fallback model has poor tool-calling reliability — strip tools to avoid
      // compounding the failure with another malformed generation.
      params.model = FALLBACK_MODEL;
      delete params.tools;
      delete params.tool_choice;
      return await groq.chat.completions.create(params);
    }
    if (err.status === 400 && err.error?.code === 'tool_use_failed') {
      console.warn('Groq tool_use_failed — retrying without tools');
      delete params.tools;
      delete params.tool_choice;
      return await groq.chat.completions.create(params);
    }
    throw err;
  }
}
