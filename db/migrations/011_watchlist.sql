-- Migration 011: Watchlist / Things to Watch
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('movie', 'tv', 'documentary', 'other')) DEFAULT 'movie',
  platform TEXT,  -- Netflix, Disney+, Prime, etc.
  added_by UUID REFERENCES users(id),
  watched BOOLEAN DEFAULT false,
  watched_at TIMESTAMPTZ,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_watchlist_family ON watchlist(family_id);
CREATE INDEX idx_watchlist_unwatched ON watchlist(family_id, watched) WHERE watched = false;
