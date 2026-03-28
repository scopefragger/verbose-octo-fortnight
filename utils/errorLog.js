/**
 * In-memory error log ring buffer.
 * Keeps the last N errors for viewing via the dashboard.
 */
const MAX_ERRORS = 200;
const errors = [];

export function logError(source, error, extra = {}) {
  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    source,
    message: error?.message || String(error),
    stack: error?.stack || null,
    extra,
  };
  errors.unshift(entry); // newest first
  if (errors.length > MAX_ERRORS) errors.length = MAX_ERRORS;

  // Still log to console
  console.error(`[${source}]`, error);
}

export function getErrors(limit = 100) {
  return errors.slice(0, limit);
}

export function clearErrors() {
  errors.length = 0;
}
