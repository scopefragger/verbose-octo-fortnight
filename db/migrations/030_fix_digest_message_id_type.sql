-- Migration 030: Fix last_digest_message_id column type
-- WhatsApp message IDs are strings (e.g. "wamid.HBgN..."), not integers.
-- The BIGINT type from migration 028 silently rejected every update, so the
-- office check-in digest-reply shortcut has never worked.
-- Run manually in the Supabase SQL Editor.

ALTER TABLE users ALTER COLUMN last_digest_message_id TYPE TEXT;
