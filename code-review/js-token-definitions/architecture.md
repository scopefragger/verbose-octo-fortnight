# Architecture Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Token data is hardcoded rather than driven by Scryfall or a configurable source
**Severity:** Low
**Lines:** 1647–1662
The 14 common tokens are defined as a static array in the JS. Users cannot add custom tokens, and the list cannot be extended without editing the source file. For a game with hundreds of possible tokens this is a deliberate simplification, but the architecture cannot accommodate user-defined or deck-specific tokens without a refactor.
**Action:** Consider storing the token list in `localStorage` or as part of the deck's `tokens` JSONB field in Supabase, allowing users to extend it per-deck. This is a low-priority enhancement since the preset list covers the most common tokens.

### Token shape is a subset of Scryfall card shape but uses different field names
**Severity:** Low
**Lines:** 1647–1662
Scryfall card objects use `name`, `type_line`, `power`, `toughness`, `colors` — the same fields used here. However Scryfall uses lowercase string arrays for `colors` (e.g., `["W"]`) while the token definitions also use uppercase string arrays. This is consistent, but new developers may not realise the token objects are intentionally structured to be Scryfall-compatible.
**Action:** Add a comment noting that token objects are designed to be compatible with the Scryfall card shape used throughout the app.

## Summary
The token definitions serve their purpose as a convenient preset list. The main architectural concern is that the list is static and not user-extensible. The Scryfall shape compatibility is a good design choice that should be documented.
