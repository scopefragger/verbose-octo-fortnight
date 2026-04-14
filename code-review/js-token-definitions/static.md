# Static Code Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### `colors` array may be empty but `tokenColorClass` expects at least one element
**Severity:** Low
**Lines:** 1658–1660
Artifact tokens (Treasure, Food, Clue, Thopter) have `colors: []`. `tokenColorClass` in the render section handles this with `if (!colors?.length) return 'tok-C'`, so empty arrays are safe. However, `COMMON_TOKENS` entries don't document that `colors: []` maps to colorless — this relationship is implicit.
**Action:** Add a comment to the `COMMON_TOKENS` declaration noting that an empty `colors` array renders as colorless (`tok-C`).

### `power` and `toughness` are `null` for artifact tokens but strings elsewhere
**Severity:** Low
**Lines:** 1658–1660
Creature token entries use string values for `power`/`toughness` (e.g., `'1'`, `'2'`), while artifact tokens use `null`. Code that uses these values must handle both `null` and string cases. Consumers do check `bfc.card.power != null` before rendering P/T, so this is safe, but the mixed type is worth documenting.
**Action:** Add a JSDoc-style comment or inline note indicating the intended type contract (`string | null`).

## Summary
The token definitions array is data-only and well-formed. The only static concerns are implicit contracts between the data shape and the consumers that render it — these are safe in the current implementation but should be documented for future maintainers.
