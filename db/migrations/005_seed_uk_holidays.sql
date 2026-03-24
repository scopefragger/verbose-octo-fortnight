-- Migration 005: Seed UK holidays for 2026-2028
-- Uses WHERE NOT EXISTS to avoid duplicates on re-run.
-- Run in Supabase SQL Editor.

-- 2026
INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'New Year''s Day', 'Bank Holiday', '2026-01-01T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'New Year''s Day'
  AND e.starts_at::date = '2026-01-01'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Valentine''s Day', NULL, '2026-02-14T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Valentine''s Day'
  AND e.starts_at::date = '2026-02-14'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Mother''s Day', 'Mothering Sunday', '2026-03-15T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Mother''s Day'
  AND e.starts_at::date = '2026-03-15'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Good Friday', 'Bank Holiday', '2026-04-03T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Good Friday'
  AND e.starts_at::date = '2026-04-03'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Easter Sunday', NULL, '2026-04-05T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Easter Sunday'
  AND e.starts_at::date = '2026-04-05'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Easter Monday', 'Bank Holiday', '2026-04-06T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Easter Monday'
  AND e.starts_at::date = '2026-04-06'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Early May Bank Holiday', 'Bank Holiday', '2026-05-04T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Early May Bank Holiday'
  AND e.starts_at::date = '2026-05-04'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Spring Bank Holiday', 'Bank Holiday', '2026-05-25T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Spring Bank Holiday'
  AND e.starts_at::date = '2026-05-25'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Father''s Day', NULL, '2026-06-21T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Father''s Day'
  AND e.starts_at::date = '2026-06-21'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Summer Bank Holiday', 'Bank Holiday', '2026-08-31T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Summer Bank Holiday'
  AND e.starts_at::date = '2026-08-31'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Halloween', 'Trick or Treat!', '2026-10-31T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Halloween'
  AND e.starts_at::date = '2026-10-31'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Bonfire Night', 'Remember, remember the 5th of November', '2026-11-05T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Bonfire Night'
  AND e.starts_at::date = '2026-11-05'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Christmas Day', 'Bank Holiday', '2026-12-25T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Christmas Day'
  AND e.starts_at::date = '2026-12-25'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Boxing Day', 'Bank Holiday', '2026-12-28T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Boxing Day'
  AND e.starts_at::date = '2026-12-28'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'New Year''s Eve', NULL, '2026-12-31T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'New Year''s Eve'
  AND e.starts_at::date = '2026-12-31'
);

-- 2027
INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'New Year''s Day', 'Bank Holiday', '2027-01-01T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'New Year''s Day'
  AND e.starts_at::date = '2027-01-01'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Valentine''s Day', NULL, '2027-02-14T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Valentine''s Day'
  AND e.starts_at::date = '2027-02-14'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Mother''s Day', 'Mothering Sunday', '2027-03-07T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Mother''s Day'
  AND e.starts_at::date = '2027-03-07'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Good Friday', 'Bank Holiday', '2027-03-26T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Good Friday'
  AND e.starts_at::date = '2027-03-26'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Easter Sunday', NULL, '2027-03-28T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Easter Sunday'
  AND e.starts_at::date = '2027-03-28'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Easter Monday', 'Bank Holiday', '2027-03-29T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Easter Monday'
  AND e.starts_at::date = '2027-03-29'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Early May Bank Holiday', 'Bank Holiday', '2027-05-03T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Early May Bank Holiday'
  AND e.starts_at::date = '2027-05-03'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Spring Bank Holiday', 'Bank Holiday', '2027-05-31T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Spring Bank Holiday'
  AND e.starts_at::date = '2027-05-31'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Father''s Day', NULL, '2027-06-20T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Father''s Day'
  AND e.starts_at::date = '2027-06-20'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Summer Bank Holiday', 'Bank Holiday', '2027-08-30T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Summer Bank Holiday'
  AND e.starts_at::date = '2027-08-30'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Halloween', 'Trick or Treat!', '2027-10-31T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Halloween'
  AND e.starts_at::date = '2027-10-31'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Bonfire Night', 'Remember, remember the 5th of November', '2027-11-05T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Bonfire Night'
  AND e.starts_at::date = '2027-11-05'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Christmas Day', 'Bank Holiday', '2027-12-27T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Christmas Day'
  AND e.starts_at::date = '2027-12-27'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Boxing Day', 'Bank Holiday', '2027-12-28T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Boxing Day'
  AND e.starts_at::date = '2027-12-28'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'New Year''s Eve', NULL, '2027-12-31T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'New Year''s Eve'
  AND e.starts_at::date = '2027-12-31'
);

-- 2028
INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'New Year''s Day', 'Bank Holiday', '2028-01-03T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'New Year''s Day'
  AND e.starts_at::date = '2028-01-03'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Valentine''s Day', NULL, '2028-02-14T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Valentine''s Day'
  AND e.starts_at::date = '2028-02-14'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Mother''s Day', 'Mothering Sunday', '2028-03-26T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Mother''s Day'
  AND e.starts_at::date = '2028-03-26'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Good Friday', 'Bank Holiday', '2028-04-14T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Good Friday'
  AND e.starts_at::date = '2028-04-14'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Easter Sunday', NULL, '2028-04-16T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Easter Sunday'
  AND e.starts_at::date = '2028-04-16'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Easter Monday', 'Bank Holiday', '2028-04-17T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Easter Monday'
  AND e.starts_at::date = '2028-04-17'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Early May Bank Holiday', 'Bank Holiday', '2028-05-01T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Early May Bank Holiday'
  AND e.starts_at::date = '2028-05-01'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Spring Bank Holiday', 'Bank Holiday', '2028-05-29T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Spring Bank Holiday'
  AND e.starts_at::date = '2028-05-29'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Father''s Day', NULL, '2028-06-18T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Father''s Day'
  AND e.starts_at::date = '2028-06-18'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Summer Bank Holiday', 'Bank Holiday', '2028-08-28T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Summer Bank Holiday'
  AND e.starts_at::date = '2028-08-28'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Halloween', 'Trick or Treat!', '2028-10-31T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Halloween'
  AND e.starts_at::date = '2028-10-31'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Bonfire Night', 'Remember, remember the 5th of November', '2028-11-05T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Bonfire Night'
  AND e.starts_at::date = '2028-11-05'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Christmas Day', 'Bank Holiday', '2028-12-25T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Christmas Day'
  AND e.starts_at::date = '2028-12-25'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'Boxing Day', 'Bank Holiday', '2028-12-26T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'Boxing Day'
  AND e.starts_at::date = '2028-12-26'
);

INSERT INTO events (family_id, created_by, title, description, starts_at, all_day)
SELECT f.id, u.id, 'New Year''s Eve', NULL, '2028-12-31T00:00:00', true
FROM families f
CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.family_id = f.id
  AND e.title = 'New Year''s Eve'
  AND e.starts_at::date = '2028-12-31'
);

