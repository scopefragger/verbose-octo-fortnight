# Patterns Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Inline styles in generated HTML
**Severity:** Low
**Lines:** 1478
`'<div class="empty-saved"><span class="loading-spinner"></span></div>'` uses a CSS class, which is good, but the pattern is inconsistent — later empty-state strings like `'<div class="empty-saved">No saved decks yet.</div>'` use the same class while the failure state at line 1495 also uses the class. This is actually consistent; no action needed here. However, the loading spinner wrapper's structure differs slightly from the empty state.
**Action:** None — this is minor and the class reuse is appropriate.

### `loadSavedDecks` is called twice in `saveDeck` and `deleteSavedDeck` — no debounce
**Severity:** Low
**Lines:** 1470, 1525
Both `saveDeck` and `deleteSavedDeck` call `loadSavedDecks()` to refresh the list after a mutation. This is the correct pattern, but rapid successive saves/deletes could trigger multiple simultaneous fetches with race conditions.
**Action:** Add a simple in-flight guard or debounce to `loadSavedDecks()` if concurrent calls are a concern.

### Magic number — no named constant for the `tokens: []` default
**Severity:** Low
**Lines:** 1466
The empty array `[]` passed as `tokens` is a placeholder, but there is no comment or named constant indicating this is intentional and temporary.
**Action:** Add an inline comment: `tokens: [] // TODO: persist token state`.

### Missing loading state during `loadDeckFromSaved`
**Severity:** Low
**Lines:** 1499–1516
`saveDeck` shows a loading toast (`showToast('Loading deck…')`), which is good. However, there is no visual feedback that the subsequent `importDecklist()` call (which itself does async Scryfall fetches) is in progress. The toast disappears after 3 seconds regardless of whether the import is complete.
**Action:** Consider disabling the load button or showing a persistent loading indicator until `importDecklist()` resolves.

## Summary
The Save/Load section follows the general patterns of the file reasonably well. The main pattern concerns are the lack of a named constant/comment for the hardcoded empty `tokens` array and the absence of a loading indicator during the full deck-import flow that follows a load.
