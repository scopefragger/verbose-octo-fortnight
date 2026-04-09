# Architecture Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Token data mixed with application code
**Severity:** Low
**Lines:** 1647–1662
`COMMON_TOKENS` is a data constant that logically belongs in a data file or configuration object, but in a single-file app this is an unavoidable trade-off. If tokens need to be extended by users or fetched from Scryfall, this hardcoded array would need to be replaced entirely.
**Action:** No immediate action required for a single-file app. Document that this is intentionally static preset data and that user-defined tokens go through the token modal's custom form path.

### Token objects use Scryfall-like field names but are not Scryfall objects
**Severity:** Low
**Lines:** 1647–1662
The token objects use field names (`power`, `toughness`, `type_line`, `colors`, `keywords`) that mirror the Scryfall API response structure. However, they lack fields that Scryfall objects always have (`id`, `oracle_id`, `image_uris`, `mana_cost`). Code that uses these tokens as if they were full Scryfall card objects may encounter missing-field errors.
**Action:** Document that these are lightweight token stubs, not full Scryfall objects, and ensure all code that accesses token data uses safe optional chaining.

## Summary
The token definitions section is appropriate for a single-file app. The main architectural concern is that the token objects partially mimic Scryfall card objects without being full Scryfall objects, which can mislead code that expects a complete card structure.
