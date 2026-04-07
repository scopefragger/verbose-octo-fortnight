# Architecture Review — Import Tab
Lines: 145–256 | File: public/mtg-commander.html

## Findings

### `importDecklist` mixes fetch orchestration, UI mutation, and navigation side-effects
**Severity:** Medium
**Lines:** 1148–1176 (companion JS; this function drives the Import button defined in the HTML at line 823)
The function directly calls `fetchCards`, mutates the global `deck` array, updates three separate DOM elements (`deck-status`, the import button label, `mulligan-btn`, `keep-btn`), resets hand state, calls `renderHand()`, `renderDeckList()`, `updateStats()`, and then navigates to a different tab — all in one linear async function. This makes the import flow difficult to test, hard to retry cleanly on error, and fragile: adding any new state (e.g. play-mode state that should reset on import) requires editing this function.
**Action:** Extract a `resetUiAfterImport()` helper that handles all DOM/tab side-effects, keeping `importDecklist` responsible only for parsing, fetching, and assigning `deck`. This is a standard separation-of-concerns refactor.

### `clearDeck` reaches into DOM IDs that belong to multiple logical panels
**Severity:** Low
**Lines:** 1178–1194 (companion JS)
`clearDeck` directly resets `stats-empty`, `stats-content`, `mulligan-btn`, `keep-btn` — elements that belong to the Stats and Hand Simulator panels, not the Import panel. The Import tab's clear action is coupled to every other panel's reset logic. If a panel is later refactored or renamed, `clearDeck` silently breaks.
**Action:** Have each panel expose a `reset()` function (e.g. `resetStats()`, `resetHandSimulator()`) and call them from `clearDeck`, rather than reaching directly into foreign panel DOM IDs.

### Commander/partner inputs share a single `acState` keyed by string literals
**Severity:** Low
**Lines:** 2057–2065, 2131
`acState` is a plain object with hardcoded `'commander'` and `'partner'` keys. The `selectCommander` function selects the correct `acState` key using a string comparison `inputId === 'commander-input'`. This creates an implicit coupling between the HTML `id` attributes (defined in the HTML segment, line 802/806), the `acState` key names, and the string comparison in `selectCommander`. Renaming any one of these three without updating the others breaks autocomplete silently.
**Action:** Derive the state key from the input element's `id` consistently (e.g. strip the `-input` suffix automatically, or pass the key explicitly through `setupAutocomplete`), so the three pieces cannot diverge.

### Save button styled with inline `style="margin-left:auto"` rather than a layout class
**Severity:** Low
**Lines:** 827 (HTML companion)
The Save button in `.import-actions` uses an inline `style` attribute to push itself to the far right. This is a presentational concern that belongs in the CSS, not in the markup.
**Action:** Add a modifier class (e.g. `.btn-push-right { margin-left: auto; }`) and apply it to the button, keeping layout in the stylesheet.

## Summary
The segment's CSS is clean architecturally. The main structural issues live in the companion JS: `importDecklist` combines orchestration, state mutation, and UI navigation in a single function; `clearDeck` is coupled to the internals of foreign panels; and the autocomplete's three-way string coupling between HTML IDs, state keys, and a comparison literal creates a silent rename hazard.
