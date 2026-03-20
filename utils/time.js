/**
 * Get the current date/time formatted for a given timezone.
 */
export function nowInTimezone(timezone = 'America/New_York') {
  return new Date().toLocaleString('en-US', { timeZone: timezone });
}

/**
 * Get today's date as YYYY-MM-DD in the user's timezone.
 */
export function todayInTimezone(timezone = 'America/New_York') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === 'year').value;
  const month = parts.find((p) => p.type === 'month').value;
  const day = parts.find((p) => p.type === 'day').value;
  return `${year}-${month}-${day}`;
}

/**
 * Format a TIMESTAMPTZ for display in a user's timezone.
 */
export function formatForUser(isoString, timezone = 'America/New_York') {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
