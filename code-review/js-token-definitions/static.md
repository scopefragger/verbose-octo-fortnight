# Static Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### `power` and `toughness` use string representation for creature tokens, `null` for artifacts
**Severity:** Low
**Lines:** 1658–1660
Non-creature tokens (Treasure, Food, Clue) use `null` for `power` and `toughness`. Consumers must null-check before displaying these values. If any consumer assumes they are strings without a guard, it will render "null" or crash.
**Action:** Verify all consumers of `COMMON_TOKENS` null-check `power`/`toughness` before rendering. Alternatively, use empty strings `''` instead of `null` for consistency, with a comment noting non-creature tokens.

### `keywords` field is absent from most token entries (sparse optional property)
**Severity:** Low
**Lines:** 1648–1662
Most tokens lack the `keywords` property entirely rather than having an empty array. Consumers must use optional chaining (`token.keywords?.includes(...)`) or similar to avoid `TypeError`. If any consumer does `token.keywords.forEach(...)` without a guard, it will throw on tokens without the field.
**Action:** Add `keywords: []` to all token entries that currently omit it, for a consistent shape. This also avoids optional chaining requirements.

## Summary
A small, static data array with no logic. The only static concerns are the inconsistent shape (missing `keywords`, null vs. empty for non-creature stats) that downstream consumers must handle defensively.
