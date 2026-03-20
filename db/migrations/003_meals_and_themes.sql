-- Migration 003: Meal planner + dashboard themes
-- Run this in Supabase SQL Editor

-- Meal plans: one row per family per day per meal slot
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  title TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, meal_date, meal_type)
);

CREATE INDEX idx_meal_plans_family_date ON meal_plans(family_id, meal_date);

-- Dashboard theme preference (one per family)
ALTER TABLE families ADD COLUMN IF NOT EXISTS dashboard_theme TEXT DEFAULT 'default';
