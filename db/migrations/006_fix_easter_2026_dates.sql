-- Migration 006: Fix Easter 2026 dates (off by one day)
-- Good Friday should be Apr 3, Easter Sunday Apr 5, Easter Monday Apr 6.
-- Run in Supabase SQL Editor.

-- Fix Good Friday: Apr 2 → Apr 3
UPDATE events
SET starts_at = '2026-04-03T00:00:00'
WHERE title = 'Good Friday'
  AND starts_at::date = '2026-04-02';

-- Fix Easter Sunday: Apr 4 → Apr 5
UPDATE events
SET starts_at = '2026-04-05T00:00:00'
WHERE title = 'Easter Sunday'
  AND starts_at::date = '2026-04-04';

-- Fix Easter Monday: Apr 5 → Apr 6
UPDATE events
SET starts_at = '2026-04-06T00:00:00'
WHERE title = 'Easter Monday'
  AND starts_at::date = '2026-04-05';
