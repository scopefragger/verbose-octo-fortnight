-- Family Goals & Challenges
-- Allows families to set shared goals and track progress together.

CREATE TABLE family_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_family_goals_family ON family_goals(family_id);
CREATE INDEX idx_family_goals_status ON family_goals(family_id, status);

CREATE TABLE goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES family_goals(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_goal_progress_goal ON goal_progress(goal_id, created_at DESC);
