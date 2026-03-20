-- Countdowns: family-wide countdown timers
CREATE TABLE countdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date DATE NOT NULL,
  background TEXT DEFAULT 'fireworks',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kid points: track reward points per child
CREATE TABLE kid_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  kid_name TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, kid_name)
);

-- Points history: log of all point changes
CREATE TABLE point_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_points_id UUID NOT NULL REFERENCES kid_points(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  reason TEXT,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_point_history_kid ON point_history(kid_points_id, created_at DESC);
