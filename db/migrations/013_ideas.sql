-- Ideas queue table for capturing and AI-enriching feature ideas
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'processing', 'enriched', 'failed')) DEFAULT 'pending',
  category TEXT,
  enriched_summary TEXT,
  enriched_implementation TEXT,
  enriched_considerations TEXT,
  enriched_effort TEXT,
  added_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ideas_family ON ideas(family_id);
CREATE INDEX IF NOT EXISTS idx_ideas_pending ON ideas(family_id, status) WHERE status = 'pending';
