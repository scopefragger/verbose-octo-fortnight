# Code & Pattern Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Inconsistent trailing comma on last array element
**Severity:** Low
**Lines:** 1661
The `COMMON_TOKENS` array ends with a trailing comma after the last element, which is valid ES2017+ but should be confirmed consistent with the rest of the file's style.
**Action:** Verify that the linting/formatting rules for the project are consistent; this is a very minor style nit.

### `keywords` field is absent on most tokens rather than an empty array
**Severity:** Low
**Lines:** 1648–1661
Some tokens have `keywords: ['Flying']` and others omit the `keywords` property entirely. Consumers must use optional chaining (`t.keywords?.includes(...)`) to avoid a TypeError. While optional chaining is used in the consumer (line 2028), the inconsistency still creates risk.
**Action:** Normalize the data: include `keywords: []` on all tokens that have no keywords, making the shape uniform and removing the need for optional chaining.

### No `colors` field for Thopter token matches colorless pattern but is inconsistent
**Severity:** Low
**Lines:** 1661
The Thopter token has `colors: []` (empty array) rather than `colors: ['C']` used nowhere in the list. The colorless tokens (Treasure, Food, Clue, Thopter) all use `colors: []`, which is consistent internally but differs from Scryfall's convention where colorless is represented as an empty array. This is fine.
**Action:** No change needed; confirm this matches the `tokenColorClass` function's expectation (it returns `tok-C` when `colors` is empty/falsy — consistent).

## Summary
Minor pattern issues: the optional `keywords` field should be normalized to always be present as an array, and the trailing comma style should be confirmed intentional. Otherwise the definitions are clean and internally consistent.
