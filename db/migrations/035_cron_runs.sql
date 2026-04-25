-- Immutable audit log of every cron execution. Rows are never deleted.
-- Used for health indicators in the cron management UI and for incident diagnosis.
-- Index supports the most common query: "last N runs of cron X for this family".

CREATE TABLE IF NOT EXISTS cron_runs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id     UUID        NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  cron_name     TEXT        NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  status        TEXT        NOT NULL DEFAULT 'running',  -- 'running' | 'success' | 'error'
  error_message TEXT,
  result        JSONB
);

CREATE INDEX IF NOT EXISTS idx_cron_runs_lookup ON cron_runs(family_id, cron_name, started_at DESC);
