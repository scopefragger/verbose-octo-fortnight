# Static Code Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### `power` and `toughness` stored as strings, not numbers
**Severity:** Low
**Lines:** 1648–1661
Token `power` and `toughness` values are stored as string literals (e.g., `'1'`, `'2'`), while non-creature tokens use `null`. Any arithmetic on these values (e.g., pump effects) would require `parseInt()` conversion. This is inconsistent with how Scryfall represents these fields (also strings), but it should be documented as intentional.
**Action:** Add a comment noting that power/toughness are strings to align with the Scryfall data shape, and ensure all consumers handle `null` for non-creature tokens.

### No `id` field on token objects
**Severity:** Low
**Lines:** 1647–1662
Token objects have no unique `id`. When a token is added to the battlefield, the game engine presumably generates one. However, `COMMON_TOKENS` contains no identifier, so if two of the same token type are added, they are distinguishable only by their battlefield wrapper's generated ID.
**Action:** This is acceptable as long as the code that places tokens on the battlefield assigns unique IDs. Verify that `addToken()` always generates a unique ID per instance.

## Summary
The token definitions are a straightforward data structure. The only noteworthy issues are the string-typed power/toughness (consistent with Scryfall but worth documenting) and the absence of a template ID, which is fine as long as instantiation handles uniqueness.
