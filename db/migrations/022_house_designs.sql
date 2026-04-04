-- Make Your Own House — quiz-style house builder for kids
-- Stores completed house designs and the choices made for each question.

CREATE TABLE house_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  builder_name TEXT NOT NULL,
  choices JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_house_designs_family ON house_designs(family_id);
CREATE INDEX idx_house_designs_created ON house_designs(family_id, created_at DESC);
