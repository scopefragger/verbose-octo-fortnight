# Architecture Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### `loadDeckFromSaved` mutates DOM inputs and then calls `importDecklist()` — bypasses normal import flow
**Severity:** Medium
**Lines:** 1506–1513
`loadDeckFromSaved` writes directly into `#deck-name`, `#commander-input`, `#partner-input`, and `#decklist-input` DOM elements, then delegates to `importDecklist()` to re-parse them. This couples the load function to the exact element IDs used by the import UI. If `importDecklist()` is ever refactored to accept parameters rather than reading from the DOM, this function breaks silently.
**Action:** Refactor `importDecklist()` (or create an `importDeckData(data)` variant) to accept the deck data as arguments rather than always reading from the DOM, so `loadDeckFromSaved` can call it directly without the DOM-write intermediary.

### `saveDeck` reads state via DOM instead of from the in-memory `deck` variable
**Severity:** Low
**Lines:** 1456–1458
Commander name and partner name are read from DOM input elements (`commander-input`, `partner-input`) rather than from a canonical in-memory state object. This means if the in-memory state and the DOM inputs ever diverge, the saved data will be wrong. The `cards` array is correctly sourced from the `deck` array, creating an inconsistency.
**Action:** Maintain a single source of truth (e.g. a `deckMeta` state object) that is kept in sync with the inputs, and read from that in `saveDeck`.

### `loadSavedDecks` renders HTML inside its own logic — mixing data-fetch and render concerns
**Severity:** Low
**Lines:** 1476–1497
The function fetches data and builds the full HTML string in one place. This makes it hard to test, re-render on sort/filter, or reuse the rendering logic.
**Action:** Split into `fetchSavedDecks()` (returns data) and `renderSavedDecks(decks)` (builds HTML), following the pattern used by `renderPlayArea` / `renderBattlefield` elsewhere in the file.

## Summary
The save/load section conflates data fetching, state mutation, and DOM rendering in single functions, tightly coupling it to specific element IDs and the import flow. A modest refactor separating fetch, render, and state-update responsibilities would make each function independently testable and easier to evolve.
