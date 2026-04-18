# Architecture Review — js-save-load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### `loadSavedDecks` fuses fetch and render
**Severity:** Medium
**Lines:** 1476–1497
`loadSavedDecks()` fetches data from the API and immediately builds and injects the full HTML string in one function. This makes it impossible to re-render the list without re-fetching, or to test the rendering logic independently.
**Action:** Split into `fetchSavedDecks()` → returns array of deck objects, and `renderSavedDecks(decks)` → builds HTML. The call site calls both. This mirrors the pattern used in `renderStats()` and `renderDeckList()` elsewhere.

### DOM reads inside business logic functions
**Severity:** Low
**Lines:** 1456–1458
`saveDeck()` reaches directly into the DOM to read `deck-name`, `commander-input`, and `partner-input`. If those element IDs ever change, the function silently reads empty strings.
**Action:** These values could be passed as parameters to `saveDeck(name, commander, partner)` and called from an event handler that collects them, improving testability and decoupling.

### Token state not persisted
**Severity:** Low
**Lines:** 1466
`tokens: []` is sent on every save. The token system (`COMMON_TOKENS`, `addToken()`, `playBattlefield` tokens) exists and is operational in play mode, but the save/load cycle does not round-trip token data. This creates a silent data loss on save→reload.
**Action:** Determine the canonical token store (likely `playBattlefield` filtered by `isToken`, or a dedicated `savedTokens` array) and include it in the save payload. Update `loadDeckFromSaved` to restore token state.

## Summary
The section is appropriately scoped to CRUD operations but `loadSavedDecks` conflates fetching and rendering in one function, and `saveDeck` reads the DOM directly instead of receiving values as arguments. The silent token data-loss on save is the most impactful architectural gap.
