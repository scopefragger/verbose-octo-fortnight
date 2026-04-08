# Static Review — Navigation
Lines: 1057–1069 | File: public/mtg-commander.html

## Findings

### `document.getElementById` calls lack null guards
**Severity:** Low
**Lines:** 1064–1065
`document.getElementById('tab-' + t)` and `document.getElementById('pane-' + t)` are called for all three tab names. If any element is missing from the DOM (e.g. a typo in the ID), `.classList` will throw a TypeError. No null check is present.
**Action:** Add null guards or use `?.classList.toggle(...)` optional chaining.

### `loadSavedDecks()` called on every `saved` tab activation
**Severity:** Low
**Lines:** 1067
Every time the user clicks the Saved tab, `loadSavedDecks()` fires an API request. There is no debounce or freshness check.
**Action:** Guard with a staleness check or a `savedDecksLoaded` flag to avoid redundant fetches on repeated tab switches.

## Summary
Navigation logic is simple and correct. Findings are minor: missing null guards on element lookups and a redundant API call on repeated tab switches.
