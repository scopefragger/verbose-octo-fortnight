# Static Code Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `acState` only supports two keys (`commander`, `partner`); `selectCommander` hardcodes key derivation
**Severity:** Medium
**Lines:** 2131–2132
`selectCommander` derives the state key with: `const key = inputId === 'commander-input' ? 'commander' : 'partner'`. Any third autocomplete input added to the page would silently fall through to use the `'partner'` state, causing selection conflicts. This is a tight coupling between element IDs and the state object keys.
**Action:** Pass the state key explicitly to `selectCommander` as a parameter rather than re-deriving it from the element ID. Change the signature to `selectCommander(name, inputId, dropdownId, stateKey)`.

### `fetchSuggestions` calls `.slice(0, 8)` twice on `names`
**Severity:** Low
**Lines:** 2104, 2108
`const names = (json.data || []).slice(0, 8)` limits to 8 names. Then `names.slice(0, 8).map(...)` slices again — since `names` already has at most 8 elements, the second slice is a no-op but confusing.
**Action:** Remove the second `.slice(0, 8)` call on line 2108: `const previews = await Promise.all(names.map(...))`.

### No cancellation of in-flight `fetchSuggestions` requests
**Severity:** Medium
**Lines:** 2100–2126
The debounce timer (200ms) delays the fetch, but if the user types quickly and multiple `fetchSuggestions` calls are in flight simultaneously, whichever request resolves last will overwrite the dropdown — potentially showing suggestions for an older search query. This is a classic TOCTOU race condition in autocomplete implementations.
**Action:** Use an `AbortController` per request and cancel the previous request when a new `fetchSuggestions` call starts. Store the controller in `state` alongside `timer` and `index`.

### `state.index` not reset when `fetchSuggestions` is still loading
**Severity:** Low
**Lines:** 2113
`state.index = -1` is set after `await Promise.all(...)` resolves. If the user presses arrow keys while the previews are loading, they operate on the old dropdown items (from a previous search). After the new results render, `state.index` resets to `-1` and the active highlight disappears.
**Action:** Reset `state.index = -1` before the async operations begin (after the initial debounce triggers the call).

## Summary
The autocomplete implementation is functional but has a notable race condition: concurrent requests from rapid typing can cause the dropdown to display results for the wrong query. The hardcoded state-key derivation from element ID is a coupling risk for future inputs. The double `.slice(0, 8)` is a minor clean-up.
