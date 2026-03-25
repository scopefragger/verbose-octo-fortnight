-- Conversation summaries for smart context management
-- Caches LLM-generated summaries of older messages to preserve context without wasting tokens.

CREATE TABLE IF NOT EXISTS conversation_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  covers_up_to TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conv_summaries_user ON conversation_summaries(user_id);
