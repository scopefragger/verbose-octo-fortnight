-- Add handoff tracking columns to ideas table
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS handoff_status TEXT
  CHECK (handoff_status IS NULL OR handoff_status IN (
    'generating_prompt', 'creating_branch', 'committing_prompt',
    'generating_code', 'committing_code', 'creating_pr',
    'complete', 'failed'
  ))
  DEFAULT NULL;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS handoff_branch TEXT DEFAULT NULL;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS handoff_pr_url TEXT DEFAULT NULL;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS handoff_files INTEGER DEFAULT 0;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS handoff_error TEXT DEFAULT NULL;
