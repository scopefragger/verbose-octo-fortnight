-- Migration 028: Store last daily digest message_id per user
-- Used to detect when a user replies to the digest for office check-in.
-- Run manually in the Supabase SQL Editor.

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_digest_message_id BIGINT;
