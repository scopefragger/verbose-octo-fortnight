-- Store multi-pass theorize results for ideas
CREATE TABLE IF NOT EXISTS idea_theories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  pass_number INTEGER NOT NULL,
  pass_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_idea_theories_idea ON idea_theories(idea_id);

-- Add theorize status to ideas table
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS theorize_status TEXT
  CHECK (theorize_status IS NULL OR theorize_status IN ('pending', 'running', 'complete', 'failed'))
  DEFAULT NULL;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS theorize_progress INTEGER DEFAULT 0;
