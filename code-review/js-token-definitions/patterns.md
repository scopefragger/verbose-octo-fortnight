# Patterns Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Magic string color codes with no documentation
**Severity:** Low
**Lines:** 1648–1661
MTG color identity codes (`'W'`, `'U'`, `'B'`, `'R'`, `'G'`) are used as raw string literals with no comment explaining the encoding. To a developer unfamiliar with MTG, `colors:['W']` is opaque.
**Action:** Add a brief comment above the array, e.g. `// colors follow Scryfall identity codes: W=White, U=Blue, B=Black, R=Red, G=Green`.

### Inconsistent trailing comma style / alignment is cosmetic but inconsistent
**Severity:** Low
**Lines:** 1647–1662
The column alignment of property values (using extra spaces to align colons) is applied to some properties (`name`, `type_line`) but not others (`power`, `toughness`, `colors`). This is purely cosmetic but deviates from consistent formatting and will cause noisy diffs when entries are added.
**Action:** Either remove alignment padding and use consistent single-space formatting, or apply alignment uniformly to all properties on all rows.

### `keywords` property only present on flying tokens — no documented list of valid keywords
**Severity:** Low
**Lines:** 1649, 1651, 1653, 1661
The only keyword used is `'Flying'`, but the `keywords` array implies it is extensible. There is no comment or constant defining what keyword values are valid or how they map to game effects.
**Action:** Add a comment listing the currently supported keyword strings (at minimum `'Flying'`) so contributors know the valid values without having to search the codebase.

### Token names encode the power/toughness inline (e.g. `'1/1 Soldier'`) but the data also carries `power`/`toughness` fields
**Severity:** Low
**Lines:** 1648–1657
The `name` field duplicates the p/t information that is already in `power` and `toughness`. If a token's stats were ever changed, both the `name` string and the numeric fields would need updating. The consumer at line 2027 derives a display suffix `pt` from the data fields — making the name redundant for that purpose — but the token modal button label uses `t.name` directly, so the name cannot be easily derived.
**Action:** Document that `name` is the canonical display label (matching the official token card name) and `power`/`toughness` are the numeric stats. Make clear they may overlap but are independent fields.

## Summary
The constant is clean and readable. The main pattern concerns are undocumented magic color strings, inconsistent object alignment, and the redundancy between token names and separate p/t fields — all low-severity quality issues that affect maintainability rather than correctness.
