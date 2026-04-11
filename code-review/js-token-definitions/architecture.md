# Architecture Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Data definition embedded in script section rather than being externalized
**Severity:** Low
**Lines:** 1647–1662
`COMMON_TOKENS` is a static data definition embedded inside the JavaScript section. In a larger application this data would be in a separate JSON file or fetched from an API (e.g., Scryfall token data). However, for a single-file app this is acceptable.
**Action:** No immediate change required. If the token list grows significantly, consider moving it to an external JSON asset or fetching it from Scryfall's token endpoint.

### Token structure does not match Scryfall card object shape
**Severity:** Low
**Lines:** 1647–1662
Tokens in `COMMON_TOKENS` use a simplified subset of Scryfall's card schema (e.g., `name`, `power`, `toughness`, `type_line`, `colors`, `keywords`). If they are mixed with Scryfall-fetched card objects (e.g., `playBattlefield`), consumers must handle two different shapes.
**Action:** Add a comment clarifying that `COMMON_TOKENS` entries are partial Scryfall-compatible objects. Verify that all battlefield rendering code that processes both real cards and tokens handles the missing fields (e.g., `mana_cost`, `oracle_text`, `image_uris`) gracefully.

## Summary
The token definitions are a compact and reasonable approach for a single-file app. The main architectural concern is ensuring these partial-schema objects are handled safely alongside full Scryfall card objects in shared rendering and state code.
