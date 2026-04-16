# Patterns Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Inconsistent object shapes within the same array
**Severity:** Low
**Lines:** 1648–1661
**Description:** Creature tokens have `keywords` only when they have an ability (e.g. Flying), while non-ability creatures omit the key entirely. Artifact tokens also vary: Thopter has `keywords: ['Flying']`, but Treasure/Food/Clue omit `keywords` and also set `power`/`toughness` to `null`. This irregular shape makes it harder to write generic display or filter logic without repeated defensive checks.
**Action:** Normalise every entry to the full shape: `{ name, power, toughness, type_line, colors, keywords }`. Use `null` for power/toughness on non-creatures and `[]` for keywords when none exist.

### Column-aligned whitespace formatting
**Severity:** Low
**Lines:** 1647–1661
**Description:** Property values are padded with spaces to align columns (e.g. `name: '1/1 Soldier',    power:`). This is cosmetic, but it is inconsistent with the rest of the file and creates noisy diffs when a new token is added that is longer than the current longest name.
**Action:** Remove the manual alignment padding; rely on editor formatting or a linter instead.

## Summary
The array is readable but has inconsistent object shapes and cosmetic whitespace padding. Normalising the schema to a fixed set of keys with sensible defaults would make downstream code simpler and more robust.
