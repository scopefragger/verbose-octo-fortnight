-- One-time script: Merge all families into one
-- Run this in Supabase SQL Editor
-- All data is preserved, kid points are summed

-- Step 1: Identify the primary family (first created)
-- Replace these with your actual family UUIDs if needed, or run the SELECT first:
-- SELECT id, name, created_at FROM families ORDER BY created_at;

DO $$
DECLARE
  primary_family_id UUID;
  secondary_family_id UUID;
  primary_kid RECORD;
  secondary_kid RECORD;
BEGIN
  -- Get the two family IDs (oldest = primary)
  SELECT id INTO primary_family_id FROM families ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO secondary_family_id FROM families WHERE id != primary_family_id ORDER BY created_at ASC LIMIT 1;

  -- If there's only one family, nothing to do
  IF secondary_family_id IS NULL THEN
    RAISE NOTICE 'Only one family found, nothing to merge.';
    RETURN;
  END IF;

  RAISE NOTICE 'Primary family: %, Secondary family: %', primary_family_id, secondary_family_id;

  -- Step 2: Move all users to primary family
  UPDATE users SET family_id = primary_family_id WHERE family_id = secondary_family_id;

  -- Step 3: Merge kid_points (sum points for same kid_name)
  FOR secondary_kid IN
    SELECT * FROM kid_points WHERE family_id = secondary_family_id
  LOOP
    -- Check if primary family already has this kid
    SELECT * INTO primary_kid FROM kid_points
      WHERE family_id = primary_family_id AND LOWER(kid_name) = LOWER(secondary_kid.kid_name);

    IF primary_kid.id IS NOT NULL THEN
      -- Sum the points
      UPDATE kid_points SET points = primary_kid.points + secondary_kid.points
        WHERE id = primary_kid.id;
      -- Move point_history to the primary kid record
      UPDATE point_history SET kid_points_id = primary_kid.id
        WHERE kid_points_id = secondary_kid.id;
      -- Delete the duplicate kid record
      DELETE FROM kid_points WHERE id = secondary_kid.id;
    ELSE
      -- No duplicate, just move to primary family
      UPDATE kid_points SET family_id = primary_family_id WHERE id = secondary_kid.id;
    END IF;
  END LOOP;

  -- Step 4: Move all other data to primary family
  UPDATE events SET family_id = primary_family_id WHERE family_id = secondary_family_id;
  UPDATE lists SET family_id = primary_family_id WHERE family_id = secondary_family_id;
  UPDATE countdowns SET family_id = primary_family_id WHERE family_id = secondary_family_id;
  UPDATE meal_plans SET family_id = primary_family_id WHERE family_id = secondary_family_id;

  -- Step 5: Delete the empty secondary family
  DELETE FROM families WHERE id = secondary_family_id;

  RAISE NOTICE 'Merge complete! All data now under family %', primary_family_id;
END $$;
