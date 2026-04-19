-- Add WhatsApp support: phone numbers for users and groups for families.
-- whatsapp_number: E.164 format without '+' (e.g. '447911123456')
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
ALTER TABLE families ADD COLUMN IF NOT EXISTS whatsapp_group_id VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS users_whatsapp_number_idx ON users (whatsapp_number)
  WHERE whatsapp_number IS NOT NULL;
