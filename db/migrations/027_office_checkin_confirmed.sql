-- Migration 027: Add confirmed (attended) flag to office_checkin_days
-- A day can be planned (confirmed=false) or confirmed as actually attended (confirmed=true).
-- Run manually in the Supabase SQL Editor.

ALTER TABLE office_checkin_days ADD COLUMN IF NOT EXISTS confirmed BOOLEAN NOT NULL DEFAULT false;
