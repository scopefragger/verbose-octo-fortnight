# Architecture Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### `COMMON_TOKENS` is a presentational preset list, not a domain constant
**Severity:** Low
**Lines:** 1647–1662
`COMMON_TOKENS` serves as a UI convenience list for the token-creation modal. It is not derived from any game-rule data source and is not used for any logic outside the modal. Placing it near the Play State globals (mana pool, battlefield) implies it is a domain constant, but it is really a UI configuration array.
**Action:** Move the array to immediately before the `showTokenModal()` function (line 2023), or co-locate it with the Token Modal section comment, so that the definition lives next to its single consumer.

### No mechanism to extend tokens at runtime or from saved deck data
**Severity:** Low
**Lines:** 1647–1662
The token list is a hard-coded constant with no provision for user-defined tokens or deck-specific tokens (e.g. tokens referenced by cards in the loaded deck). The `addToken()` flow only allows manual input or preset selection.
**Action:** This is an intentional design simplification; document it with a comment (e.g. `// Preset tokens — extend here or wire to deck-specific token data in future`).

### `formatManaCostShort` is misplaced in this file region
**Severity:** Low
**Lines:** 1642–1645
This function appears between the Play State block and the Token Definitions block with no section heading. It belongs in the Utilities section and its placement here is likely a copy-paste artefact.
**Action:** Relocate to the Utilities section (around line 2141) and remove from this position.

## Summary
The section is architecturally simple — a static data array with no logic. The only architectural concern is placement: both `COMMON_TOKENS` and the misplaced `formatManaCostShort` function are in the wrong location relative to their consumers and logical siblings. Moving them to their natural homes would improve navigability with no functional impact.
