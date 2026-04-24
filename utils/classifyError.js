import { AppError } from './AppError.js';

const USER_MESSAGES = {
  RATE_LIMITED:          "I'm being asked to slow down. Wait a minute then try again.",
  SERVICE_UNAVAILABLE:   "The service is temporarily unavailable. Try again in a few minutes.",
  NOT_FOUND:             "I couldn't find what you're looking for.",
  VALIDATION_ERROR:      "That request had a problem I couldn't work with. Try rephrasing it.",
  DATA_PERSISTENCE_FAILED: "I processed your request but couldn't save it. Please try again.",
  UNKNOWN:               "Something went wrong on my end. Please try again in a moment.",
};

/**
 * Classify any thrown error into a safe AppError with a pre-written user message.
 * Never surfaces raw error details (schema names, constraint names, stack traces).
 */
export function classifyError(err) {
  if (err instanceof AppError) return err;

  const msg = err?.message || '';
  const status = err?.status || err?.statusCode || err?.code;

  // Groq / HTTP rate limit
  if (status === 429 || msg.toLowerCase().includes('rate limit') || msg.startsWith('Daily message limit')) {
    return new AppError('RATE_LIMITED', msg.startsWith('Daily message limit') ? msg : USER_MESSAGES.RATE_LIMITED, { isRetryable: true });
  }

  // Groq / upstream service errors (5xx, network)
  if (status >= 500 || msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('network') || msg.includes('groq') && msg.includes('error')) {
    return new AppError('SERVICE_UNAVAILABLE', USER_MESSAGES.SERVICE_UNAVAILABLE, { isRetryable: true });
  }

  // Supabase: no rows returned
  if (status === 'PGRST116' || msg.includes('PGRST116') || msg.includes('no rows')) {
    return new AppError('NOT_FOUND', USER_MESSAGES.NOT_FOUND);
  }

  // Supabase: constraint violations, duplicate key, validation
  if (msg.includes('duplicate key') || msg.includes('unique constraint') || msg.includes('violates') || msg.includes('invalid input') || status === '23505' || status === '23514') {
    return new AppError('VALIDATION_ERROR', USER_MESSAGES.VALIDATION_ERROR);
  }

  // Supabase: connection / timeout
  if (msg.includes('timeout') || msg.includes('connection') || msg.includes('PGRST')) {
    return new AppError('SERVICE_UNAVAILABLE', USER_MESSAGES.SERVICE_UNAVAILABLE, { isRetryable: true });
  }

  return new AppError('UNKNOWN', USER_MESSAGES.UNKNOWN);
}
