# Static Code Review — js-commander-autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Race condition: `fetchSuggestions` results may arrive out of order
**Severity:** Medium
**Lines:** 2100–2126
`fetchSuggestions` is called after a 200ms debounce, but there is no cancellation mechanism for in-flight requests. If the user types quickly, two requests may be outstanding and the first (slower) request may resolve after the second, overwriting the dropdown with stale results. The `state.timer` debounce reduces frequency, but does not prevent race conditions for requests that have already been dispatched.
**Action:** Add a request counter or use an AbortController: track a `state.fetchId` counter, increment it on each call, and discard results if `state.fetchId` has advanced before the response is processed.

### `names.slice(0, 8)` applied to already-sliced array
**Severity:** Low
**Lines:** 2104, 2108
`json.data` is sliced to 8 items at line 2104: `const names = (json.data || []).slice(0, 8)`. Then on line 2108, `names.slice(0, 8)` is applied again — this is redundant since `names` already has at most 8 items.
**Action:** Remove the second `.slice(0, 8)` call on line 2108.

### `selectCommander` maps `inputId` to `stateKey` with a string equality check
**Severity:** Low
**Lines:** 2131
`const key = inputId === 'commander-input' ? 'commander' : 'partner';` hardcodes the mapping from element ID to state key. If a third autocomplete input is added, this ternary silently defaults to `'partner'`.
**Action:** Add a lookup map: `const keyMap = { 'commander-input': 'commander', 'partner-input': 'partner' }; const key = keyMap[inputId];` and guard against unknown keys.

### Global click listener registered once per `setupAutocomplete` call — accumulates
**Severity:** Medium
**Lines:** 2093–2097
Each call to `setupAutocomplete` adds a new `document.addEventListener('click', ...)` listener. Since `setupAutocomplete` is called twice (for commander and partner), there are two global click listeners. These are never removed. If `setupAutocomplete` were ever called again (e.g., after a page re-render), listeners would accumulate further.
**Action:** Register only one shared global click listener rather than one per input, or use `{ once: false }` with explicit removal.

## Summary
The autocomplete is functional but has a race condition for rapid typing, a redundant slice, and accumulating global click listeners. The race condition is the highest-priority fix.
