# Static Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### `power` and `toughness` use `null` for non-creature tokens inconsistently
**Severity:** Low
**Lines:** 1658–1660
Artifact tokens (Treasure, Food, Clue) have `power: null, toughness: null`. Consumers of this array must null-check before displaying or comparing these values. If any code treats these as numbers (e.g., `parseInt(token.power)`), it will silently produce `NaN`.
**Action:** Audit all consumers of `COMMON_TOKENS` to ensure they handle `null` power/toughness. Consider using `undefined` or omitting the fields entirely, or using empty string `''` if display is the primary use.

### `keywords` field is absent for most tokens (optional but inconsistent)
**Severity:** Low
**Lines:** 1648–1662
Some tokens have `keywords: ['Flying']`; others omit the `keywords` field entirely. This means consumers must always guard with `token.keywords || []` to avoid iterating over `undefined`.
**Action:** Either make `keywords` a required field defaulting to `[]` on every token, or document that consumers must use `token.keywords?.` optional chaining.

### `colors` is `[]` for Thopter but Thopters are typically colorless artifact creatures
**Severity:** Low
**Lines:** 1661
The 1/1 Thopter token has `colors: []` which correctly represents a colorless token. This is fine, but it is worth verifying that the color rendering logic handles empty arrays (colorless) correctly vs. missing colors.
**Action:** No code change needed; add a comment on the Thopter entry noting it is intentionally colorless.

## Summary
The `COMMON_TOKENS` array is a straightforward data definition with no logical errors. The main concerns are the inconsistent `keywords` field presence and `null` power/toughness for artifact tokens, which require defensive handling in consumers.
