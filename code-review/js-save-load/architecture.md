# Architecture Review — Save / Load

Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### `saveDeck` mixes UI-state reads, data transformation, and API calls in one function
**Severity:** Medium
**Lines:** 1455–1474
`saveDeck` reads from three DOM inputs, transforms the deck array, performs an API call, shows a toast, and triggers a list refresh — all in a single function body. This tightly couples DOM access to persistence logic. If the deck-name or commander input IDs change, or if another code path needs to save a deck programmatically (e.g., auto-save), the whole function must be duplicated or reworked.
**Action:** Extract a `buildDeckPayload()` helper that reads DOM values and returns `{ name, commander, partner, cards, tokens }`. Keep the API call and toast in `saveDeck`. This separation makes the payload-building logic independently testable and reusable.

### `loadDeckFromSaved` owns the responsibility of re-populating DOM inputs and triggering import
**Severity:** Medium
**Lines:** 1499–1517
After fetching the saved deck, this function directly sets four different DOM element values and then calls `importDecklist()`. Populating the UI form belongs to the prepare-view rendering layer, not the save/load layer. This creates a hidden dependency: `loadDeckFromSaved` must know about all current input field IDs, making it fragile to UI refactors.
**Action:** Create a `populateDeckForm(saved)` function (or reuse the prepare-view renderer if one exists) that accepts a deck object and fills the form. `loadDeckFromSaved` should call that function rather than directly touching the DOM.

### `loadSavedDecks` is responsible for both data fetching and HTML generation
**Severity:** Low
**Lines:** 1476–1497
The function fetches the deck list and also generates all the list-item HTML inline. This conflates data-fetching with rendering. A change to how deck items are displayed requires editing the fetch function.
**Action:** Extract a `renderSavedDeckItem(d)` helper that returns the HTML string for a single deck. `loadSavedDecks` should call it inside the `map`. This is a minor separation but improves readability and makes the item template easy to find and update.

### `loadSavedDecks` is called imperatively from `saveDeck` and `deleteSavedDeck` as a refresh side-effect
**Severity:** Low
**Lines:** 1470, 1525
Rather than emitting an event or using a reactive pattern, mutation functions directly call `loadSavedDecks()` as a post-mutation refresh. This is appropriate for a single-file vanilla-JS app, but means the coupling is implicit: anyone who adds another mutation must remember to also call `loadSavedDecks()`.
**Action:** Consider a thin convention: document at the top of `loadSavedDecks` that it is the canonical refresh function and must be called after any mutation to the decks list. No code change required unless the pattern becomes a reliability problem.

## Summary
The save/load section has reasonable scope for a small feature, but `saveDeck` and `loadDeckFromSaved` each reach directly into multiple DOM elements rather than delegating to a form-population helper. Extracting `buildDeckPayload()` and `populateDeckForm()` would decouple UI structure from persistence logic without adding meaningful complexity.
