# Patterns Review — js-token-definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Inconsistent `keywords` presence across token entries
**Severity:** Medium
**Lines:** 1648–1662
Tokens with flying ability include `keywords: ['Flying']`; all other tokens omit the field entirely. The consistent pattern would be to include `keywords: []` on every entry to make the shape uniform. As written, destructuring or length checks on `token.keywords` will fail on 10 of the 14 tokens.
**Action:** Add `keywords: []` to all token objects that currently omit the field.

### `power`/`toughness` typed as strings, `null` for non-creatures
**Severity:** Low
**Lines:** 1658–1660
Artifact tokens (Treasure, Food, Clue) use `power: null, toughness: null`. This is consistent with Scryfall's API format, but is not documented. If rendering code does `+token.power` expecting a number, it gets `NaN` for creatures and `0` for non-creatures — a subtle type inconsistency.
**Action:** Add a comment: `// power/toughness are strings (matching Scryfall format) or null for non-creatures`.

## Summary
Well-structured data table. Fixing the inconsistent `keywords` field presence would make every token object uniform and prevent latent TypeErrors in consuming code.
