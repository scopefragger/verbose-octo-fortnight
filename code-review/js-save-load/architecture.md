# Architecture Review — js-save-load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### `loadDeckFromSaved` triggers `importDecklist()` — cross-section coupling
**Severity:** Medium
**Lines:** 1513
`loadDeckFromSaved` calls `importDecklist()` which is defined in a different section of the file. This creates an implicit dependency where save/load logic is entangled with the deck import/parsing pipeline. If `importDecklist` changes its signature or side effects, `loadDeckFromSaved` silently breaks.
**Action:** Document the dependency with a comment. Consider returning the raw deck data and letting a higher-level orchestrator call both steps, or at minimum ensure `importDecklist` is always defined before the save/load section.

### `loadSavedDecks` does both data fetching and HTML rendering
**Severity:** Low
**Lines:** 1476–1497
The function mixes concerns: it fetches data and builds innerHTML in one pass. This is consistent with the rest of the single-file app's pattern, but makes testing or reuse harder. A future refactor separating `fetchSavedDecks()` (returns data) from a renderer would improve maintainability.
**Action:** Acceptable for the current monolithic design; note as future refactor candidate.

### No state update after load — deck ID not tracked
**Severity:** Medium
**Lines:** 1499–1517
After a successful load, there is no global state variable updated to record which deck is currently loaded. This means `saveDeck()` cannot distinguish between "new deck" and "update existing deck", leading to the duplicate-save issue noted in static review.
**Action:** Introduce a `currentDeckId` variable; set it in `loadDeckFromSaved`, clear it in `saveDeck` after a POST, and use it to choose PUT vs POST.

## Summary
The section's largest architectural gap is the absence of loaded-deck state tracking, causing `saveDeck` to always create new records. The coupling to `importDecklist()` is a reasonable design choice given the monolithic context, but should be explicitly documented.
