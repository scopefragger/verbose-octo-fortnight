-- Food expiry tracker: track perishable items and their use-by dates
CREATE TABLE IF NOT EXISTS food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id),
  name TEXT NOT NULL,
  quantity TEXT,            -- e.g. "2 packs", "500g", "1 bottle"
  expires_at DATE NOT NULL,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_food_items_family ON food_items(family_id);
CREATE INDEX idx_food_items_expiry ON food_items(family_id, expires_at);
