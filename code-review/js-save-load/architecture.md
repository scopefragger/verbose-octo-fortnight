# Architecture Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### `saveDeck` reads DOM state directly
**Severity:** Medium
**Lines:** 1456–1458
`saveDeck()` reaches directly into the DOM (`document.getElementById('deck-name').value`, `commander-input`, `partner-input`) to gather data. This tightly couples the save logic to the HTML structure. If these element IDs change, the save function silently fails to capture that data.
**Action:** Have `saveDeck` read from in-memory state variables rather than re-reading from the DOM. Ensure the app state is kept in sync with the UI as the user edits fields.

### `loadDeckFromSaved` imperatively populates DOM then calls `importDecklist`
**Severity:** Medium
**Lines:** 1506–1513
The function sets DOM values and then calls `importDecklist()`, which presumably re-reads those same DOM values. This is an indirect, fragile data flow. A direct approach would be to pass the card data directly to an import function rather than round-tripping through the DOM.
**Action:** Refactor `importDecklist` to optionally accept a card array directly, bypassing the textarea.

### `loadSavedDecks` mixes data fetch, transform, and render
**Severity:** Low
**Lines:** 1476–1497
This single function fetches from the API, transforms the response, and renders the HTML. Separation of these concerns would allow the list to be re-rendered without a network call (e.g., after an optimistic delete).
**Action:** Extract a `renderSavedDecksList(decks)` helper so re-render can be done independently of fetching.

## Summary
The save/load functions are tightly coupled to DOM IDs and mix fetch/transform/render concerns. The round-trip through the DOM textarea in `loadDeckFromSaved` is the most fragile pattern and should be replaced with direct data passing.
