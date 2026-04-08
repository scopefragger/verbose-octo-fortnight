# Architecture Review — Import
Lines: 1147–1194 | File: public/mtg-commander.html

## Findings

### `importDecklist` mixes orchestration, UI update, and state mutation
**Severity:** Medium
**Lines:** 1148–1176
`importDecklist` performs: input reading, validation, spinner management, Scryfall fetch, state mutation (`deck`, `deckLoaded`, `hand`, `mulliganCount`), rendering (stats, deck list, hand), DOM updates (card count, button visibility), and tab switching. This is too many responsibilities for one function.
**Action:** Extract the UI reset logic into a helper (e.g. `resetHandUI()`), and separate the import orchestration from the UI feedback. The Scryfall fetch is already abstracted; at minimum extract the post-import UI update steps.

### `clearDeck` is a full DOM teardown — no single source of truth
**Severity:** Low
**Lines:** 1178–1194
`clearDeck` manually resets 8 individual DOM elements plus 4 state variables. If a new input or state variable is added, `clearDeck` must be manually updated. There is no shared reset function used by both `clearDeck` and the post-import hand reset.
**Action:** Consider deriving the cleared state from initial values rather than manually enumerating resets.

## Summary
`importDecklist` has too many responsibilities; the post-import UI logic should be extracted. `clearDeck` is a manual DOM teardown that will require maintenance if the form grows.
