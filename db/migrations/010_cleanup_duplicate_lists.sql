-- Migration 010: Clean up duplicate lists
-- The getOrCreateList function has been creating duplicate lists instead of finding existing ones.
-- This migration consolidates all items under the oldest list per name per family, then deletes duplicates.

-- Step 1: Move all items from duplicate lists to the canonical (oldest) list per name per family
WITH canonical AS (
  SELECT DISTINCT ON (family_id, LOWER(name))
    id, family_id, LOWER(name) as norm_name
  FROM lists
  ORDER BY family_id, LOWER(name), created_at ASC
),
duplicates AS (
  SELECT l.id as dup_id, c.id as canonical_id
  FROM lists l
  JOIN canonical c ON c.family_id = l.family_id AND c.norm_name = LOWER(l.name)
  WHERE l.id != c.id
)
UPDATE list_items
SET list_id = d.canonical_id
FROM duplicates d
WHERE list_items.list_id = d.dup_id;

-- Step 2: Delete orphaned items (if any remain on duplicate lists)
DELETE FROM list_items
WHERE list_id NOT IN (
  SELECT DISTINCT ON (family_id, LOWER(name)) id
  FROM lists
  ORDER BY family_id, LOWER(name), created_at ASC
);

-- Step 3: Delete duplicate list rows
DELETE FROM lists
WHERE id NOT IN (
  SELECT DISTINCT ON (family_id, LOWER(name)) id
  FROM lists
  ORDER BY family_id, LOWER(name), created_at ASC
);

-- Step 4: Add a unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_lists_family_name_unique
  ON lists (family_id, LOWER(name));
