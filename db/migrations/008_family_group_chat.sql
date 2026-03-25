-- Add group_chat_id to families for sending daily digest to group chats.

ALTER TABLE families ADD COLUMN IF NOT EXISTS group_chat_id TEXT;
