# Code & Pattern Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Inconsistent alignment (cosmetic)
**Severity:** Low
**Lines:** 1648–1661
The token array uses padded alignment for property names (e.g., `name: '1/1 Soldier',` aligned with spaces), which is tidy but will drift out of alignment when new tokens with longer names are added. Most modern style guides prefer not to align properties this way.
**Action:** Low priority cosmetic concern. If a linter is added, enforce no property alignment to prevent future drift.

### `keywords` field is present on some tokens but absent on others
**Severity:** Low
**Lines:** 1648–1661
Flying tokens include `keywords: ['Flying']` while non-flying tokens have no `keywords` property at all (rather than `keywords: []`). Code reading `t.keywords?.includes('Flying')` handles this correctly via optional chaining, but the inconsistency means the schema is not uniform.
**Action:** Add `keywords: []` to all tokens that don't have keywords for a uniform schema, or document that missing `keywords` is equivalent to an empty array.

### Token names encode stats in the name string
**Severity:** Low
**Lines:** 1648–1657
Token names like `'1/1 Soldier'` include the power/toughness in the display name. This duplicates the `power`/`toughness` fields and means any stat change requires updating both the `name` and the `power`/`toughness` fields.
**Action:** Consider deriving the display label programmatically: `${t.power}/${t.toughness} ${t.type_line.split('—')[1]?.trim() || t.name}`. This is an optional improvement for DRY compliance.

## Summary
The token definitions are clean and readable. The main pattern concerns are the inconsistent `keywords` field (present vs. absent), stat duplication in names, and cosmetic alignment that will drift. None are blocking issues.
