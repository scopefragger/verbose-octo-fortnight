-- Add family_id to conversation_summaries for defensive scoping and family-level purge
ALTER TABLE conversation_summaries
  ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE CASCADE;

UPDATE conversation_summaries cs
  SET family_id = u.family_id
  FROM users u
  WHERE cs.user_id = u.id AND cs.family_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_conv_summaries_family ON conversation_summaries(family_id);

-- Add family_id to reminders for defensive scoping and family-level purge
ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE CASCADE;

UPDATE reminders r
  SET family_id = u.family_id
  FROM users u
  WHERE r.user_id = u.id AND r.family_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_reminders_family ON reminders(family_id);
