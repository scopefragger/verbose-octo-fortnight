# Architecture Review — Sidebar — Saved Decks Pane
Lines: 841–843 | File: public/mtg-commander.html

## Findings

### Proper separation of container and content
**Severity:** Low
**Lines:** 841–843
The pane follows a clean two-level structure: the outer container (`.saved-area#pane-saved`) and the inner content container (`#saved-decks-list`). This allows `switchTab()` to toggle visibility on the outer container while `loadSavedDecks()` can cleanly replace the inner content. Good separation of concerns.
**Action:** No action required — architecture is sound.

### Visibility control via tab system
**Severity:** Low
**Lines:** 841–843
The pane is integrated into a tab-based UI pattern where `switchTab('saved')` (line 1067) triggers `loadSavedDecks()`. The flow is: user clicks tab → switchTab runs → pane becomes visible → async load starts. This is coherent with the import and deck-list tabs (`pane-import`, `pane-cards`).
**Action:** No action required — consistent with overall UI architecture.

### Content refresh tied to visibility
**Severity:** Low
**Lines:** 841–843 (related to line 1067)
`loadSavedDecks()` is only called when the tab is switched to 'saved', not on initial page load. This avoids unnecessary API calls but means users see stale data if decks are deleted from another tab. If real-time sync is needed, consider adding refresh handlers to delete and save operations.
**Action:** Consider calling `loadSavedDecks()` after successful save/delete operations (currently done after delete at line 1525, but not after save at line 1470).

## Summary
The saved decks pane follows the established tab-based architecture cleanly. Content is properly isolated in the inner container, visibility is managed consistently, and tab switching triggers appropriate data loading.
