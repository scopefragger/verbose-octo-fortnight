-- Migration 026: WDW holiday meal planner
-- Tables: wdw_holidays (trips), wdw_meal_options (restaurants to vote on), wdw_meal_votes (per-user votes)

CREATE TABLE IF NOT EXISTS wdw_holidays (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  archived_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wdw_holidays_family_idx ON wdw_holidays(family_id);

-- meal_id is an opaque slug referencing data/wdw-dining.json (e.g. "be-our-guest")
CREATE TABLE IF NOT EXISTS wdw_meal_options (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_id UUID NOT NULL REFERENCES wdw_holidays(id) ON DELETE CASCADE,
  family_id  UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  meal_id    TEXT NOT NULL,
  meal_name  TEXT NOT NULL,
  url        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wdw_meal_options_holiday_idx ON wdw_meal_options(holiday_id);
CREATE INDEX IF NOT EXISTS wdw_meal_options_family_idx  ON wdw_meal_options(family_id);

-- vote_type: 'yes' | 'no' | 'veto'
-- One row per user per meal per holiday — upsert on conflict
CREATE TABLE IF NOT EXISTS wdw_meal_votes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_id UUID NOT NULL REFERENCES wdw_holidays(id) ON DELETE CASCADE,
  family_id  UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  meal_id    TEXT NOT NULL,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type  TEXT NOT NULL CHECK (vote_type IN ('yes', 'no', 'veto')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (holiday_id, meal_id, user_id)
);

CREATE INDEX IF NOT EXISTS wdw_meal_votes_holiday_meal_idx ON wdw_meal_votes(holiday_id, meal_id);
CREATE INDEX IF NOT EXISTS wdw_meal_votes_family_idx       ON wdw_meal_votes(family_id);
