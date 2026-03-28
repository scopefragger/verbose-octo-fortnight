-- Migration 012: Birthdays
CREATE TABLE IF NOT EXISTS birthdays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,  -- original birth date (used to calculate age)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_birthdays_family ON birthdays(family_id);
