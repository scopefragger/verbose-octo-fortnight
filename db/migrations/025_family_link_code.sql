-- Migration 025: Add dedicated link_code column to families
-- Replaces the hack of encoding link codes in the family name field

ALTER TABLE families ADD COLUMN IF NOT EXISTS link_code TEXT;
ALTER TABLE families ADD COLUMN IF NOT EXISTS link_code_expires_at TIMESTAMPTZ;

-- Index for fast lookup during join
CREATE INDEX IF NOT EXISTS families_link_code_idx ON families(link_code) WHERE link_code IS NOT NULL;
