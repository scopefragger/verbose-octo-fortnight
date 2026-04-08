-- Migration 024: Add ON DELETE CASCADE to FKs missing it
-- This ensures deleting a family or user cleans up all their data

-- food_items → families
ALTER TABLE food_items
  DROP CONSTRAINT IF EXISTS food_items_family_id_fkey,
  ADD CONSTRAINT food_items_family_id_fkey
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE;

-- birthdays → families
ALTER TABLE birthdays
  DROP CONSTRAINT IF EXISTS birthdays_family_id_fkey,
  ADD CONSTRAINT birthdays_family_id_fkey
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE;

-- ideas → families
ALTER TABLE ideas
  DROP CONSTRAINT IF EXISTS ideas_family_id_fkey,
  ADD CONSTRAINT ideas_family_id_fkey
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE;

-- idea_theories → ideas
ALTER TABLE idea_theories
  DROP CONSTRAINT IF EXISTS idea_theories_idea_id_fkey,
  ADD CONSTRAINT idea_theories_idea_id_fkey
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE;

-- countdowns → families
ALTER TABLE countdowns
  DROP CONSTRAINT IF EXISTS countdowns_family_id_fkey,
  ADD CONSTRAINT countdowns_family_id_fkey
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE;

-- conversations → users
ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS conversations_user_id_fkey,
  ADD CONSTRAINT conversations_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- conversation_summaries → users
ALTER TABLE conversation_summaries
  DROP CONSTRAINT IF EXISTS conversation_summaries_user_id_fkey,
  ADD CONSTRAINT conversation_summaries_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
