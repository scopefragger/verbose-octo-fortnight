import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 30000 });

const MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

function isTimeoutError(err) {
  return err.status === 408 || err.code === 'ETIMEDOUT' || err.name === 'APIConnectionTimeoutError';
}

/**
 * Run a chat completion with optional tool definitions.
 * Handles Groq rate-limit fallback to a smaller model.
 * Retries up to 2 times on timeout (5s, then 10s backoff).
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

  let lastErr;
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const response = await groq.chat.completions.create(params);
      if (response.usage) {
        console.log(`[groq] tokens prompt=${response.usage.prompt_tokens} completion=${response.usage.completion_tokens} total=${response.usage.total_tokens}`);
      }
      return response;
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
      if (isTimeoutError(err) && attempt < 2) {
        const wait = 5000 * Math.pow(2, attempt);
        console.warn(`[groq] timeout (attempt ${attempt + 1}/3), retrying in ${wait}ms`);
        lastErr = err;
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
