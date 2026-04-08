# Patterns Review — Navigation
Lines: 1057–1069 | File: public/mtg-commander.html

## Findings

### Magic strings for tab names and element ID prefixes
**Severity:** Low
**Lines:** 1063–1065
Tab names (`'import'`, `'cards'`, `'saved'`) and element ID prefixes (`'tab-'`, `'pane-'`) are magic strings repeated across `switchTab` and the HTML. A mismatch between the HTML IDs and the strings here would cause silent failures.
**Action:** Define tab name constants (e.g. `const TABS = ['import', 'cards', 'saved']`) to make the contract explicit.

### `goBack` navigation pattern is inconsistent with SPA conventions
**Severity:** Low
**Lines:** 1058–1060
`goBack()` performs a full page navigation (`window.location.href`) rather than using browser history (`history.back()` or `history.pushState`). For a dashboard link this is intentional, but naming it `goBack` implies history-based navigation.
**Action:** Rename to `goToDashboard()` or add a comment clarifying it is not a history-back operation.

## Summary
Navigation is minimal and functional. Magic tab-name strings and the misleading `goBack` function name are the main patterns concerns.
