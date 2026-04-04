-- Add validation tracking columns to ideas table
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS validation_result JSONB DEFAULT NULL;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS validation_score INTEGER DEFAULT NULL;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS validation_verdict TEXT
  CHECK (validation_verdict IS NULL OR validation_verdict IN ('pass', 'partial', 'fail'))
  DEFAULT NULL;
