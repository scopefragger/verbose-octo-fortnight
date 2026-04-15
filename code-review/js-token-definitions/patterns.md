# Patterns Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Inconsistent object shape — `keywords` is optional, `power`/`toughness` use `null` vs omission
**Severity:** Low
**Lines:** 1648–1662
Token entries that have keywords include the `keywords` array; others omit the property entirely (rather than using `keywords: []`). Non-creature tokens use `null` for stats. This inconsistency requires consumers to use defensive patterns (`token.keywords?.length`, `token.power != null`) rather than relying on a uniform shape.
**Action:** Standardize the token object shape: always include `keywords: []` for entries without keywords, and use `null` only for non-creature stats with a comment. Alternatively use `''` for stats consistently.

### Token names embed stats in the name string (e.g. `'1/1 Soldier'`)
**Severity:** Low
**Lines:** 1648–1657
The `name` field encodes power/toughness as a prefix (e.g. `'1/1 Soldier'`), duplicating information already stored in separate `power`/`toughness` fields. If the token is displayed, the name may show stats twice.
**Action:** Consider using only the creature type as `name` (e.g. `'Soldier'`) and constructing the display label from `power`, `toughness`, and `name` at render time. This avoids duplication and makes the data easier to filter or search by type.

### No trailing comma consistency check
**Severity:** Low
**Lines:** 1662
The array ends without a trailing comma on the last entry. Most entries are followed by commas, which is fine — but it is worth noting that the absence of a trailing comma on the last entry is a minor style inconsistency compared to multi-line array conventions in modern JS (where trailing commas are preferred for diff cleanliness).
**Action:** Add a trailing comma after the last token entry for consistency with modern JS style.

## Summary
The token definition array is readable and correct. The main pattern issues are the inconsistent object shape (missing `keywords` vs. empty array, `null` for non-creature stats) and the redundant stat encoding in name strings. These are low-effort cleanups that would improve consistency for consumers.
