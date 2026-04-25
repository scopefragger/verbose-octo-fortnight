-- Tracks cron job definitions, enabled/disabled state, and last run timestamps.
-- One row per cron per family. Seeded automatically on server startup.
-- family_id scoping is mandatory — not enforced by RLS but by application code.

CREATE TABLE IF NOT EXISTS crons (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID        NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  human_label  TEXT        NOT NULL,
  description  TEXT        NOT NULL,
  enabled      BOOLEAN     NOT NULL DEFAULT true,
  last_run_started   TIMESTAMPTZ,
  last_run_completed TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, name)
);

CREATE INDEX IF NOT EXISTS idx_crons_family_id ON crons(family_id);
