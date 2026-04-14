-- Migration 026: Office Check-In Days
-- Tracks office attendance, travel days, and time-off for the 40% monthly target.
-- Run manually in the Supabase SQL Editor.

CREATE TABLE office_checkin_days (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id         UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  day_date          DATE NOT NULL,
  day_type          TEXT NOT NULL CHECK (day_type IN ('office', 'travel', 'time_off')),
  -- Office fields
  parking_booked    BOOLEAN NOT NULL DEFAULT false,
  -- Travel fields
  destination       TEXT,
  flight_booked     BOOLEAN NOT NULL DEFAULT false,
  hotel_booked      BOOLEAN NOT NULL DEFAULT false,
  -- Expense workflow (office or travel)
  expense_submitted BOOLEAN NOT NULL DEFAULT false,
  expense_received  BOOLEAN NOT NULL DEFAULT false,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (family_id, day_date)
);

CREATE INDEX idx_office_checkin_family_date ON office_checkin_days(family_id, day_date DESC);
