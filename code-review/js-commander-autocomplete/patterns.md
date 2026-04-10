# Code & Pattern Review — js-commander-autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Debounce implemented inline with `setTimeout`/`clearTimeout`
**Severity:** Low
**Lines:** 2068–2071
The debounce pattern is implemented inline with manual `state.timer` management. The same pattern could be extracted as a `debounce(fn, ms)` utility to avoid repetition if more debounced inputs are added. Currently only used for autocomplete, so duplication is not yet a concern.
**Action:** No immediate action. If debouncing is needed elsewhere, extract to a utility.

### `hideDropdown` clears `innerHTML` on hide
**Severity:** Low
**Lines:** 2137
`hideDropdown` calls `dropdown.innerHTML = ''` to clear the dropdown contents on every hide. This discards the rendered HTML, requiring a full re-fetch and re-render on every focus. For frequently-accessed dropdowns this is wasteful.
**Action:** Consider keeping the dropdown HTML intact and only toggling visibility, clearing only when new suggestions arrive.

### Keyboard navigation does not scroll active item into view
**Severity:** Low
**Lines:** 2079–2084
Arrow key navigation updates the `active` class on dropdown items but does not call `scrollIntoView` on the newly active item. For long dropdown lists, the active item may scroll off-screen without visual feedback.
**Action:** Add `items[state.index].scrollIntoView({ block: 'nearest' })` after updating the active class.

### Magic numbers: debounce `200ms` and result cap `8`
**Severity:** Low
**Lines:** 2071, 2104
`200` (debounce delay) and `8` (max suggestions) are magic numbers. If these need tuning, they must be found by searching the code.
**Action:** Define `const AC_DEBOUNCE_MS = 200; const AC_MAX_RESULTS = 8;` as named constants.

## Summary
The autocomplete implementation is solid and feature-complete. The main pattern issues are magic numbers, the N+1 API call pattern (covered in architecture), and the fact that `hideDropdown` destroys the dropdown HTML rather than hiding it.
