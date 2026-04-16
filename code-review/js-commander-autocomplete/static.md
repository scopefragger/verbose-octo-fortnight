# Static Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `input` and `dropdown` used without null guards
**Severity:** Medium
**Lines:** 2063–2065, 2067, 2074, 2093
`document.getElementById(inputId)` and `document.getElementById(dropdownId)` are called without null checks. If either ID is wrong or the element has not yet been added to the DOM when `setupAutocomplete` is called, all subsequent `.addEventListener` calls will throw a TypeError.
**Action:** Add guards immediately after each `getElementById` call: `if (!input || !dropdown) { console.error('setupAutocomplete: element not found', inputId, dropdownId); return; }`.

### `acState[stateKey]` could be undefined for unknown stateKey values
**Severity:** Low
**Lines:** 2065
`const state = acState[stateKey]` silently returns `undefined` if `stateKey` is not `'commander'` or `'partner'`. All subsequent operations on `state` would throw.
**Action:** Validate: `if (!acState[stateKey]) { console.error('setupAutocomplete: unknown stateKey', stateKey); return; }`.

### `names.slice(0, 8)` applied twice redundantly
**Severity:** Low
**Lines:** 2104, 2108
`(json.data || []).slice(0, 8)` at line 2104 produces `names` capped at 8. Then at line 2108, `names.slice(0, 8)` slices again — which is a no-op but creates confusion about intent.
**Action:** Remove the second `.slice(0, 8)` at line 2108: `const previews = await Promise.all(names.map(...))`.

### `selectCommander` hardcodes element ID `'commander-input'` to determine the state key
**Severity:** Medium
**Lines:** 2131
`const key = inputId === 'commander-input' ? 'commander' : 'partner'` assumes that any input that is not `commander-input` must be the partner input. This breaks if a third autocomplete is ever added and does not scale.
**Action:** Pass the `stateKey` as a data attribute on the input element or as an argument to `selectCommander`, rather than reverse-engineering it from the element ID.

### `state.index` not reset on `ArrowUp` when already at 0
**Severity:** Low
**Lines:** 2083
`state.index = Math.max(state.index - 1, 0)` clamps at 0 rather than wrapping or deselecting. This means pressing ArrowUp at the top of the list keeps the first item selected rather than deselecting all items. This is a UX edge case but consistent with the non-wrapping ArrowDown behaviour.
**Action:** Document the intentional non-wrap behaviour with a comment, or allow `state.index` to return to `-1` when ArrowUp is pressed at position 0 (deselect all).

### Scryfall API response not validated before accessing `.data`
**Severity:** Low
**Lines:** 2103–2104
`json.data` is accessed without first checking `res.ok`. If the Scryfall API returns an error response (e.g. HTTP 429 Too Many Requests), `json.data` will be `undefined`, and `(json.data || [])` silently returns an empty array. The HTTP error is effectively swallowed.
**Action:** Add `if (!res.ok) { hideDropdown(dropdown, state); return; }` after `const res = await fetch(...)`.

## Summary
The autocomplete section is well-structured but has several robustness gaps: missing null guards on DOM lookups, a silent undefined risk for unknown stateKeys, a hardcoded element-ID-to-key mapping in `selectCommander`, and no HTTP error check on the Scryfall autocomplete response. The redundant double-slice is a minor dead-code issue.
