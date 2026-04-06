-- MTG Commander decklists
-- Stores saved Commander decks including card list and tokens.

CREATE TABLE mtg_decklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  commander TEXT,
  partner TEXT,
  cards JSONB NOT NULL DEFAULT '[]',
  tokens JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mtg_decklists_family ON mtg_decklists(family_id);
CREATE INDEX idx_mtg_decklists_created ON mtg_decklists(family_id, created_at DESC);
