# Patterns Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Debounce timeout of 200ms is a magic number
**Severity:** Low
**Lines:** 2071
`setTimeout(() => fetchSuggestions(...), 200)` uses a bare `200` millisecond debounce delay. This is a reasonable UX value but should be a named constant so it can be tuned without searching the code.
**Action:** Define `const AC_DEBOUNCE_MS = 200` and reference it here.

### Minimum query length of 2 characters is a magic number
**Severity:** Low
**Lines:** 2070
`if (q.length < 2)` uses a bare `2` as the minimum query length before fetching. This should be a named constant.
**Action:** Define `const AC_MIN_QUERY_LENGTH = 2`.

### Maximum suggestions count of 8 is duplicated
**Severity:** Low
**Lines:** 2104, 2108
The maximum number of autocomplete suggestions is `8`, appearing twice (in `.slice(0, 8)` and the redundant inner `.slice(0, 8)`). Even after removing the redundant slice, the value should be a named constant.
**Action:** Define `const AC_MAX_SUGGESTIONS = 8` and use it in `.slice(0, AC_MAX_SUGGESTIONS)`.

### `hideDropdown` clears `innerHTML` — could use `textContent` for clarity
**Severity:** Low
**Lines:** 2137
`dropdown.innerHTML = ''` clears the dropdown content. Using `dropdown.replaceChildren()` (modern DOM API) or simply `dropdown.textContent = ''` would be marginally more performant (avoids HTML parsing). This is a micro-optimization but shows an inconsistency in DOM clearing style.
**Action:** No action required; this is a trivial nit.

### `acState` object uses object notation but `stateKey` is a raw string — no type safety
**Severity:** Low
**Lines:** 2065
`const state = acState[stateKey]` accesses the state object with a runtime string key. If `stateKey` is anything other than `'commander'` or `'partner'`, `state` will be `undefined`, causing a crash in subsequent `clearTimeout(state.timer)`. There is no guard against an invalid key.
**Action:** Add a guard: `const state = acState[stateKey]; if (!state) throw new Error('Unknown autocomplete state key: ' + stateKey);`.

## Summary
The commander autocomplete section has multiple magic numbers (debounce delay, min query length, max suggestions) that should be named constants. The `acState` key lookup has no validation, and the `hideDropdown` method is slightly inconsistent with modern DOM APIs. These are all minor pattern issues.
