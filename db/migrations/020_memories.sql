CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  caption TEXT,
  photo_file_id TEXT,
  category TEXT,
  memory_date DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_memories_family ON memories(family_id, memory_date DESC);
CREATE INDEX idx_memories_date ON memories(memory_date);
