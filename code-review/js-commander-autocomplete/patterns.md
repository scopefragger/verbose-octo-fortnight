# Code & Pattern Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Magic number `8` for max suggestions used in two places
**Severity:** Low
**Lines:** 2104, 2108
`(json.data || []).slice(0, 8)` and `names.slice(0, 8).map(...)` both use `8` as a magic number. The second `.slice(0, 8)` on line 2108 is also redundant since `names` is already sliced to 8 elements on line 2104.
**Action:** Define `const AC_MAX_SUGGESTIONS = 8;` and use it in both places. Remove the duplicate `.slice(0, 8)` on line 2108.

### Debounce delay of `200`ms is a magic number
**Severity:** Low
**Lines:** 2071
`setTimeout(() => fetchSuggestions(...), 200)` uses a hardcoded 200ms debounce. This is a reasonable value but should be a named constant.
**Action:** Define `const AC_DEBOUNCE_MS = 200;`.

### Minimum query length `2` is a magic number
**Severity:** Low
**Lines:** 2070
`if (q.length < 2)` uses a hardcoded minimum. Define `const AC_MIN_QUERY_LENGTH = 2;`.

### `ac-item` class is a magic string used in the keydown handler
**Severity:** Low
**Lines:** 2075
`dropdown.querySelectorAll('.ac-item')` is the only place this class name is referenced in JS. If the CSS class changes, the keyboard navigation silently breaks.
**Action:** Define `const AC_ITEM_CLASS = 'ac-item';` and use it here.

### Arrow key navigation resets to index 0 on ArrowUp when at index 0
**Severity:** Low
**Lines:** 2083
`state.index = Math.max(state.index - 1, 0)` stops at 0 on ArrowUp rather than wrapping to the last item. Many autocomplete UIs allow wrapping (pressing up at the top goes to the bottom).
**Action:** Acceptable as-is for simplicity. Document as a deliberate non-wrapping behavior.

## Summary
Several magic numbers (8, 200, 2) should be named constants. The duplicate `.slice(0, 8)` is a harmless but unnecessary redundancy. The `ac-item` class string coupling is a minor fragility risk.
