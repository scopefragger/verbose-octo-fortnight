# Patterns Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Inconsistent field presence across token entries
**Severity:** Low
**Lines:** 1648–1661
Some tokens include `keywords` and some do not. This inconsistency means the data structure is not normalized — each entry is a different shape. For a small array this is manageable but signals lack of a schema.
**Action:** Normalize all entries to include `keywords: []` as a default so consumers can always iterate over `token.keywords` without a guard.

### `power` and `toughness` stored as strings not numbers
**Severity:** Low
**Lines:** 1648–1657
Power and toughness values like `'1'`, `'2'`, `'5'` are stored as string literals. MTG cards naturally use strings (since values can be `'*'` or `'1+*'`), so this is technically correct. However, it could lead to bugs if any code performs numeric comparisons without `parseInt`.
**Action:** Add a comment on the array noting that `power`/`toughness` are strings by design (matching Scryfall's schema) and should be displayed as-is rather than parsed as numbers.

### Token names double as display labels and identifiers
**Severity:** Low
**Lines:** 1647–1662
Token `name` values serve as both display labels and implicit identifiers. There are no unique IDs. If two tokens have the same name, there is no way to distinguish them programmatically.
**Action:** Consider adding a `templateId` or relying on array index as a stable key for token selection in the modal UI.

## Summary
`COMMON_TOKENS` is a clean, readable constant with minor normalization issues. The main pattern improvements are normalizing `keywords` fields and documenting the string type for power/toughness. The array is small enough that these are low-priority concerns.
