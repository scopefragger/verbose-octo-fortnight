# Static Code Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### No null guard on `input` or `dropdown` elements
**Severity:** Medium
**Lines:** 2063–2065
`document.getElementById(inputId)` and `document.getElementById(dropdownId)` can return `null` if called before the DOM is ready or with a wrong ID. Any subsequent access (`.addEventListener`, `.querySelectorAll`, etc.) will throw a TypeError.
**Action:** Add null checks after each `getElementById` call and return early (or throw a descriptive error) if either element is not found.

### `acState` key lookup is unbounded
**Severity:** Low
**Lines:** 2065, 2131–2132
`acState[stateKey]` will return `undefined` if `stateKey` is anything other than `"commander"` or `"partner"`. This silently propagates as `undefined` into `hideDropdown` and `fetchSuggestions`, causing crashes.
**Action:** Validate `stateKey` against the known keys, or use a `Map` with explicit entries and throw if the key is missing.

### Stale-query race condition (no request cancellation)
**Severity:** Medium
**Lines:** 2100–2126
`fetchSuggestions` is debounced but two concurrent fetches can still resolve out of order: a slow first request may overwrite the dropdown rendered by a faster later request. There is no check that `q` still matches `input.value` when the response arrives.
**Action:** Capture `input.value` at fetch start and compare it to `input.value` again before updating `dropdown.innerHTML`; discard the result if they differ. Alternatively use an `AbortController`.

### `names.slice(0, 8)` is redundant
**Severity:** Low
**Lines:** 2104, 2108
`names` is already limited to 8 items on line 2104 (`(json.data || []).slice(0, 8)`), so `names.slice(0, 8)` on line 2108 is a no-op.
**Action:** Remove the second `.slice(0, 8)` and use `names` directly in the `Promise.all` call.

### ArrowUp navigation stops at index 0 instead of wrapping or cycling
**Severity:** Low
**Lines:** 2082–2083
When `state.index` is already `0`, pressing ArrowUp does nothing (clamps to 0). Many autocomplete UIs wrap around to the last item. This is not a bug but is inconsistent with common UX expectations and leaves the initial `-1` state unreachable via keyboard after first navigation.
**Action:** Consider wrapping: on ArrowUp from 0, set `state.index = items.length - 1`; on ArrowDown from last item, set `state.index = 0`. At minimum document the intentional clamping behaviour.

### `selectCommander` hard-codes known input IDs
**Severity:** Low
**Lines:** 2131
`inputId === 'commander-input' ? 'commander' : 'partner'` assumes exactly two possible input IDs. Any future third commander slot would silently map to `'partner'`.
**Action:** Pass the `stateKey` string as a fourth argument to `selectCommander`, eliminating the reverse-lookup.

## Summary
The section is mostly well-structured, but lacks null guards on DOM lookups and has a race condition that can display stale autocomplete results. Several minor issues (redundant slice, hard-coded ID mapping, unbounded state key) add fragility and should be addressed.
