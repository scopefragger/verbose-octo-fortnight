# Architecture Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Static data embedded in executable script section
**Severity:** Low
**Lines:** 1647–1662
`COMMON_TOKENS` is a static lookup table that has no dependency on any runtime state. In a modular codebase, this would live in a separate data file (e.g. `tokens.json` or a constants module). In this single-file app it is acceptable, but it sits between play-state variable declarations and render functions, breaking the conceptual flow of the script section.
**Action:** No immediate change required. If the file is ever refactored, extract this constant to the top of the JS section alongside other constants (`MANA_COLORS`, `MANA_COLOR_STYLES`), or into a dedicated data block.

### Token schema is informal — no validation or type definition
**Severity:** Low
**Lines:** 1647–1662
The expected shape of a token object is implicit. Nothing enforces that custom tokens added via the token modal match this shape. If a consumer expects `colors` to always be an array but a custom token omits it, runtime errors occur.
**Action:** Add a brief comment documenting the expected token object shape, and ensure `addToken()` in the Token Modal section constructs objects with matching fields.

## Summary
Pure data constant with no architectural violations in isolation. Its placement mid-file between stateful variables and render functions is a minor organization issue; grouping with other constants at the top of the JS section would improve readability.
