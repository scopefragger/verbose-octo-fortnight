# Architecture Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### No separation between fetch and render in `loadSavedDecks`
**Severity:** Low
**Lines:** 1476–1497
`loadSavedDecks()` both fetches data from the API and generates the HTML for the saved deck list inline. The HTML template is embedded in the middle of the fetch logic, making the rendering logic hard to extract or test independently.
**Action:** Consider extracting a `renderSavedDeckList(decks)` helper, consistent with the `renderBattlefield` / `renderPlayHand` pattern used elsewhere.

### `saveDeck` reads directly from DOM inputs rather than from application state
**Severity:** Low
**Lines:** 1456–1458
Deck name, commander, and partner are read from DOM inputs directly inside `saveDeck()`. These values should ideally already be reflected in application state (e.g. a `currentDeck` object), and the save function should read from state, not re-query the DOM.
**Action:** Maintain a canonical state object for the deck being edited; `saveDeck` should serialize that rather than scraping inputs.

### `loadDeckFromSaved` calls `importDecklist()` which triggers full re-parse
**Severity:** Low
**Lines:** 1513
After populating the DOM inputs with saved card text, `loadDeckFromSaved` calls `importDecklist()`, which re-parses the text. The saved deck already has structured `cards` data (array of `{name, qty}`), so re-parsing via the textarea is unnecessary work and risks introducing parse drift.
**Action:** Load the structured `saved.cards` array directly into application state rather than round-tripping through the textarea.

## Summary
The Save/Load section mixes fetch, state mutation, and rendering responsibilities. Reading from DOM inputs rather than application state is inconsistent with how other sections manage data, and the round-trip through textarea re-parsing on load is architecturally wasteful.
