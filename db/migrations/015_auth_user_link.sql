-- Link existing users to Supabase Auth accounts
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_user_id);
