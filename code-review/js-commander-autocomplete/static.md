# Static Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `acState` keys are hardcoded strings in `selectCommander` — brittle coupling
**Severity:** Low
**Lines:** 2131
`const key = inputId === 'commander-input' ? 'commander' : 'partner';` hardcodes the mapping between input element IDs and `acState` keys. If a new autocomplete field is added (e.g. a second partner input), this ternary must be updated. The `setupAutocomplete` function already receives `stateKey` as a parameter, but `selectCommander` re-derives the key from the input ID.
**Action:** Pass `stateKey` as a fourth argument to `selectCommander`, or store `stateKey` in the dropdown element's `dataset.stateKey` attribute at setup time.

### `ArrowUp` navigation has an off-by-one edge case when `state.index` is 0
**Severity:** Low
**Lines:** 2083
`Math.max(state.index - 1, 0)` prevents going below 0, which means pressing ArrowUp when the first item is active keeps the first item active (no wrap-around). This is functionally correct (no bug) but the UX does not wrap from first to last item. Document this as an intentional limitation.
**Action:** Add a comment: `// No wrap-around: ArrowUp at first item stays at first item`.

### Race condition: stale dropdown results on rapid typing
**Severity:** Medium
**Lines:** 2100–2126
`fetchSuggestions` debounces by 200ms via `clearTimeout(state.timer)`. However, once a debounced fetch starts, a second fetch from a subsequent debounce can complete before the first (if the first Scryfall request is slow). The second fetch's results would be overwritten by the first fetch's late results. `state.timer` is reset on each input, but there is no cancellation or ordering guard for in-flight requests.
**Action:** Track a `state.requestId` counter and only apply results if the counter matches the one at request start. Alternatively, use an `AbortController` to cancel the previous fetch on each new input.

### `json.data || []` does not validate that `data` is an array
**Severity:** Low
**Lines:** 2104
If Scryfall returns an unexpected response shape (e.g. an error object), `json.data` could be a non-array value. Calling `.slice(0, 8)` on a non-array would throw a `TypeError`. The outer `try/catch` (line 2101) would catch this, but it would silently hide the error.
**Action:** Add explicit type checking: `const names = Array.isArray(json.data) ? json.data.slice(0, 8) : [];` to be more defensive.

### `names.slice(0, 8)` called twice — redundant
**Severity:** Low
**Lines:** 2104, 2108
`json.data.slice(0, 8)` is stored in `names`, but then `names.slice(0, 8)` is called again on line 2108 in the `Promise.all` call. Since `names` already has at most 8 elements, the second `.slice(0, 8)` is redundant.
**Action:** Replace `names.slice(0, 8).map(...)` with `names.map(...)` on line 2108.

## Summary
The most significant static issue is the race condition where stale Scryfall responses can overwrite newer results during rapid typing. The remaining issues are minor robustness and clarity improvements.
