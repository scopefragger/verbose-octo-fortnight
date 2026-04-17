# Architecture Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### DOM manipulation mixed with API calls
**Severity:** Medium
**Lines:** 1476–1497
`loadSavedDecks()` directly mutates DOM elements (`el.innerHTML = ...`) while also making the API call and mapping the response. These two responsibilities — fetching data and rendering it — are conflated in a single function. Any change to either concern requires editing the same block.
**Action:** Extract a `renderSavedDecks(decks)` renderer function that takes the deck array and produces the HTML. `loadSavedDecks()` then becomes a thin fetch-and-dispatch wrapper. This follows the separation already visible in `renderPlayArea()` / `renderBattlefield()` elsewhere in the file.

### `saveDeck` reads DOM state directly instead of from application state
**Severity:** Medium
**Lines:** 1456–1458
`saveDeck()` reads `deck-name`, `commander-input`, and `partner-input` via `getElementById`. These values should already exist in the application's state object (the rest of the app uses a `state` variable for this). Reading directly from the DOM creates a second source of truth and means the saved values might differ from what the app is actually using internally.
**Action:** Store commander/partner/deckName in the central state object and read from there in `saveDeck()`.

### `loadDeckFromSaved` re-runs full import pipeline after populating DOM fields
**Severity:** Medium
**Lines:** 1506–1513
Loading a saved deck works by: (1) writing saved values back into DOM inputs, (2) calling `importDecklist()` which then re-reads those DOM inputs and runs the full import pipeline (which may include Scryfall fetches). This is a fragile round-trip through the DOM. If `importDecklist()` is ever changed to read from state instead of DOM, this flow breaks silently.
**Action:** Expose an `applyDeck(deckData)` function that sets state directly without going through the DOM fields, and call it from `loadDeckFromSaved`.

### Token saving not implemented, silently drops data
**Severity:** Low
**Lines:** 1466
`tokens: []` is hardcoded, meaning any tokens a user added in the current session are silently dropped on save. There is no UI indication that tokens are not saved.
**Action:** Either implement token saving (read from state and include in the payload) or display a warning to the user that tokens are not persisted.

## Summary
The section works correctly but conflates fetch logic with DOM rendering, and bypasses the application's state object by reading and writing DOM fields directly. These patterns make the code brittle; a state-driven approach (read from state, write to state, render from state) would be significantly more maintainable.
