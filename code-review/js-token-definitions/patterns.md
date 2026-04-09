# Patterns Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### `power` and `toughness` stored as strings, not numbers
**Severity:** Low
**Lines:** 1648–1661
Token power/toughness values are stored as string literals (`'1'`, `'2'`, `'5'`) rather than integers. This is consistent with Scryfall's API format (where P/T can be `'*'` or `'1+*'`), but creates a pattern inconsistency if any arithmetic is ever attempted on these values without conversion.
**Action:** Document that string format is intentional to match Scryfall's format, preventing future contributors from converting to integers.

### Artifact tokens use `null` for power/toughness while creature tokens use strings
**Severity:** Low
**Lines:** 1658–1660
Treasure, Food, and Clue tokens use `power: null` while creature tokens use `power: '1'`. This is semantically correct (artifacts have no P/T) but means consuming code must handle both `null` and string. The `bfCardHTML` function at line 1898 already guards with `bfc.card.power != null`, so it handles this correctly.
**Action:** No change needed; document the null convention for non-creature tokens in a comment.

### No constant name prefix or namespace for token-related constants
**Severity:** Low
**Lines:** 1647
`COMMON_TOKENS` uses SCREAMING_SNAKE_CASE which is appropriate for a constant. However, `MANA_COLORS` and `MANA_COLOR_STYLES` follow the same convention, so the naming is consistent across the file.
**Action:** No action required.

## Summary
Token definitions follow consistent naming patterns. The use of string values for power/toughness mirrors Scryfall format intentionally. No significant pattern violations found; the main note is that null P/T for artifact tokens is a valid but implicit convention that benefits from a comment.
