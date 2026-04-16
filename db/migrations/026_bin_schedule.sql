-- Bin collection schedule per family.
-- collection_day: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
-- bins: ordered JSON array [{ name, colour, emoji }, ...] — rotation length = bins.length
-- reference_date: a known date when bins[0] was/will be collected (anchors the rotation)
CREATE TABLE IF NOT EXISTS bin_schedule (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id      UUID        NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  collection_day SMALLINT    NOT NULL CHECK (collection_day BETWEEN 0 AND 6),
  bins           JSONB       NOT NULL,
  reference_date DATE        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (family_id)
);
