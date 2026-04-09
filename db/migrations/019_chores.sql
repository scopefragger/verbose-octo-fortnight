CREATE TABLE chores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  title TEXT NOT NULL,
  assigned_to TEXT,
  recurrence TEXT CHECK (recurrence IN ('once','daily','weekly','fortnightly')) DEFAULT 'once',
  next_due DATE NOT NULL DEFAULT CURRENT_DATE,
  points_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_chores_family ON chores(family_id, next_due);

CREATE TABLE chore_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_id UUID NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
  completed_by TEXT,
  completed_at TIMESTAMPTZ DEFAULT now(),
  points_awarded INTEGER DEFAULT 0
);
