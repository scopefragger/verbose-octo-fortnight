# Architecture Review — Sidebar Import Pane
Lines: 796–829 | File: public/mtg-commander.html

## Findings

### Behaviour wired via inline `onclick` — tight HTML/JS coupling
**Severity:** Medium
**Lines:** 823, 826, 827
`importDecklist()`, `clearDeck()`, and `saveDeck()` are called directly from HTML attributes. This makes the markup structurally dependent on specific global function names. Renaming or modularising any of those functions requires hunting through raw HTML rather than following a JS dependency graph. It also makes the pane impossible to unit-test or hydrate from a component boundary without the full global scope in place.
**Action:** Wire all three via `addEventListener` in the existing `DOMContentLoaded` initialiser block, removing the `onclick` attributes. This is consistent with how autocomplete is initialised.

### Save button placement leaks a responsibility boundary
**Severity:** Low
**Lines:** 827
The `Save` button sits inside `.import-actions` alongside `Load Deck` and `Clear`, but its action (`saveDeck()`) belongs to the persistence layer, not the import workflow. The import pane is responsible for parsing and loading a decklist; saving is a separate concern (currently also exposed via the deck-list pane at segment 4). Having `Save` here creates two entry points for the same action, which can drift out of sync (e.g., one shows a toast, the other does not).
**Action:** Consider removing the Save button from the import pane and relying solely on the deck-list pane's Save button, or extract a shared `<save-button>` include to keep both in sync.

### Autocomplete dropdown markup co-located with input fields — good, but undocumented
**Severity:** Low
**Lines:** 803, 807
The `.ac-dropdown` divs are siblings to their respective inputs inside `.commander-wrap`. This co-location is the right pattern for absolute positioning, but there is no comment explaining that these divs are populated and shown/hidden by `setupAutocomplete()` in JS. A future developer editing the HTML could remove them as "empty divs," breaking autocomplete silently.
**Action:** Add a short HTML comment: `<!-- populated by setupAutocomplete() in JS -->`.

## Summary
The pane's structure is straightforward and readable. The primary architectural concern is the global-function `onclick` coupling that makes the import actions invisible to a JS dependency graph and untestable in isolation. The secondary concern is the Save button's dual presence creating a split responsibility across two panes that will diverge over time.
