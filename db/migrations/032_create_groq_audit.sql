-- Audit table for Groq API calls — used for per-family rate limiting and cost tracking
CREATE TABLE IF NOT EXISTS groq_api_calls (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID        NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  called_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model       TEXT        NOT NULL,
  tokens_used INTEGER
);

CREATE INDEX IF NOT EXISTS idx_groq_api_calls_family_day
  ON groq_api_calls(family_id, called_at DESC);

CREATE INDEX IF NOT EXISTS idx_groq_api_calls_user_day
  ON groq_api_calls(user_id, called_at DESC);
