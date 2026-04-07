# Static Review — Sidebar Deck List Pane
Lines: 832–838 | File: public/mtg-commander.html

## Findings

### `deck-list-content` initial content is a static placeholder, never cleared on error paths
**Severity:** Low
**Lines:** 837
The `<div id="deck-list-content">` ships with a hardcoded `"No deck loaded yet."` fallback inside the HTML. `renderDeckList()` (line 1292) overwrites it with the same literal string when `deck` is empty, so the two definitions are in sync today. However, if the initial HTML placeholder text ever drifts from the JS string (e.g. a copy-edit to one but not the other), the visual state on first load will silently diverge from all subsequent renders. There is no single source of truth for this empty-state message.
**Action:** Remove the inline fallback text from the HTML and let `renderDeckList()` be the only place that writes to `deck-list-content`, so the empty-state is defined once.

### `switchTab` called without verifying the target tab identifier
**Severity:** Low
**Lines:** 835
`onclick="switchTab('import')"` passes a bare string literal. If the tab identifier is ever renamed in the JS navigation logic (`switchTab` at line 1057), this call will silently become a no-op (or navigate incorrectly) with no compile-time or lint-time warning. The same string `'import'` appears in multiple places across the file with no shared constant.
**Action:** While a single-file HTML app cannot use module-level constants easily, a comment cross-reference or a named `data-` attribute convention would reduce the risk of a silent rename mismatch.

## Summary
The two findings are both low-severity consistency/maintenance concerns rather than outright bugs. The most concrete risk is the duplicated empty-state string between HTML and JS, which will silently produce a stale placeholder if the text is updated in only one location. The tab-name string literal is a minor fragility in the same category.
