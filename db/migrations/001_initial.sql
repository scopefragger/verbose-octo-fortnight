-- Families: links two users together
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Family',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users: each Telegram user
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  display_name TEXT NOT NULL,
  family_id UUID REFERENCES families(id),
  timezone TEXT NOT NULL DEFAULT 'Europe/London',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Calendar events: belong to a family (shared)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_family_starts ON events(family_id, starts_at);

-- Reminders: belong to a user (personal), optionally linked to an event
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reminders_due ON reminders(sent, remind_at)
  WHERE sent = false;

-- Lists: belong to a family (shared)
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- List items
CREATE TABLE list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_list_items_list ON list_items(list_id, sort_order);

-- Conversation history: per-user, for Groq context
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tool_call_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_user ON conversations(user_id, created_at DESC);
