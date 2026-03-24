-- Migration 004: Recurring reminders
-- Run this in Supabase SQL Editor
--
-- Adds a recurrence column to reminders so they can repeat.
-- Valid values: 'daily', 'weekdays', 'weekly', 'biweekly', 'monthly', or NULL (one-off).
-- When a recurring reminder fires, the cron job auto-creates the next occurrence.

ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS recurrence TEXT
  CHECK (recurrence IS NULL OR recurrence IN ('daily', 'weekdays', 'weekly', 'biweekly', 'monthly'));

COMMENT ON COLUMN reminders.recurrence IS 'Repeat pattern: daily, weekdays, weekly, biweekly, monthly, or NULL for one-off';
