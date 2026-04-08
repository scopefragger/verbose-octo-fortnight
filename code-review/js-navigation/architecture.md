# Architecture Review — Navigation
Lines: 1057–1069 | File: public/mtg-commander.html

## Findings

### `switchTab` triggers side-effects (data fetch, render) inline
**Severity:** Low
**Lines:** 1067–1068
Tab switching triggers `loadSavedDecks()` and `renderDeckList()` directly. These are data-fetching and rendering concerns, not navigation concerns. This couples the navigation function to those subsystems.
**Action:** This is acceptable in a single-file app but note that `switchTab` is doing more than toggling visibility — it is also the entry point for lazy-loading. A comment making this explicit would help.

### Hard-coded tab list `['import','cards','saved']`
**Severity:** Low
**Lines:** 1063
The tab list is a magic array literal. If a new tab is added or an existing one renamed, this array must be updated manually. There is no single source of truth for tab names.
**Action:** Extract to a constant `const TABS = ['import', 'cards', 'saved']` at the top of the section.

## Summary
`switchTab` is a compact but multi-responsibility function. Architecture is acceptable for the single-file context; the main concern is the hard-coded tab list and implicit lazy-loading side effects.
