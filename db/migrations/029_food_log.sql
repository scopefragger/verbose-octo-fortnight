-- Migration 029: Food logging — replaces Nutra app subscription
-- Tracks daily food/calorie intake per user.
-- Run manually in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS food_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  food_name  TEXT NOT NULL,
  calories   INTEGER,
  meal_type  TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  notes      TEXT,
  logged_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_logs_user_date   ON food_logs(user_id,   logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_logs_family_date ON food_logs(family_id, logged_at DESC);

CREATE TABLE IF NOT EXISTS nutrition_goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id      UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  daily_calories INTEGER,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id)
);
