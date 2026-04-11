# Patterns Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Debounce delay (200ms) is a magic number
**Severity:** Low
**Lines:** 2071
The debounce delay of `200` milliseconds is hard-coded. This is a common value but should be a named constant for clarity and easy adjustment.
**Action:** Define `const AC_DEBOUNCE_MS = 200;` near the `acState` declaration and reference it in the `setTimeout` call.

### Minimum query length (2) is a magic number
**Severity:** Low
**Lines:** 2070
`if (q.length < 2)` uses the magic number `2` as the minimum trigger length.
**Action:** Define `const AC_MIN_LENGTH = 2;` alongside other autocomplete constants.

### Result limit (8) set in two places
**Severity:** Low
**Lines:** 2104, 2108
The result count `8` appears twice: once in `.slice(0, 8)` to limit autocomplete names, and again in the comment on line 2107 ("top results"). After the fix to remove the redundant second slice, this will only appear once — but it should still be a named constant.
**Action:** Define `const AC_MAX_RESULTS = 8;` and use it in both the slice and any related comments.

### `catch {}` swallows all errors silently
**Severity:** Medium
**Lines:** 2125
The `catch` block in `fetchSuggestions` calls `hideDropdown()` but provides no user feedback and logs nothing when the Scryfall request fails. A network failure or rate limit will silently clear the dropdown with no indication to the user.
**Action:** At minimum, add `console.warn('Autocomplete fetch failed:', err)` or show a brief toast indicating a search error, so failures are visible during development and debugging.

### `dropdown.innerHTML = ''` in `hideDropdown` — clearing innerHTML vs setting to empty string
**Severity:** Low (informational)
**Lines:** 2137
`dropdown.innerHTML = ''` is a standard way to clear child nodes in vanilla JS. It is consistent with other clearing patterns in the file.
**Action:** No change needed. The approach is fine.

### `acState` object uses a flat structure that does not scale to more than two inputs
**Severity:** Low
**Lines:** 2057–2060
`acState` has hardcoded `commander` and `partner` keys. This is appropriate for the current use case but the structure gives no guidance for how to add additional autocomplete instances.
**Action:** Add a comment noting the two supported keys, or refactor to a `Map` keyed by `stateKey` for extensibility.

## Summary
The autocomplete section is well-implemented for its purpose with debouncing and keyboard navigation. The main patterns concern is the silent error swallowing in the `catch` block. Multiple magic numbers (debounce delay, min length, max results) should be named constants.
