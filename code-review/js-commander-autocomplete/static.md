# Static Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `names.slice(0, 8)` is redundant — already sliced two lines earlier
**Severity:** Low
**Lines:** 2104, 2108
`const names = (json.data || []).slice(0, 8)` on line 2104 already limits the array to 8 items. Then on line 2108, `names.slice(0, 8)` slices the same array again, which is a no-op.
**Action:** Remove `.slice(0, 8)` from line 2108: `const previews = await Promise.all(names.map(...))`.

### `stateKey` lookup in `acState` is unchecked
**Severity:** Low
**Lines:** 2065
`const state = acState[stateKey]` does not verify that `stateKey` is one of the two valid keys (`'commander'`, `'partner'`). If called with an invalid key, `state` will be `undefined` and subsequent `state.timer` / `state.index` accesses will throw.
**Action:** Add a guard: `if (!acState[stateKey]) throw new Error(\`Unknown autocomplete state key: \${stateKey}\`);` or provide a default.

### `selectCommander` hardcodes `'commander-input'` string for key mapping
**Severity:** Low
**Lines:** 2131
`const key = inputId === 'commander-input' ? 'commander' : 'partner';` hardcodes the element ID and assumes any non-commander input must be the partner input. This breaks if a third autocomplete is ever added.
**Action:** Use the `stateKey` system more robustly — either pass `stateKey` as a parameter to `selectCommander` or derive the key from the input element in a map.

### `document.addEventListener('click', ...)` registered once per `setupAutocomplete` call
**Severity:** Medium
**Lines:** 2093–2097
`setupAutocomplete` is called twice (for commander and partner inputs), registering two separate `click` listeners on `document`. Each listener closes its own dropdown. While functionally correct, adding multiple global click listeners accumulates across the page lifetime.
**Action:** Replace the per-call document listener with a single delegated listener at module level that checks all registered dropdowns.

### ArrowUp navigation stops at index 0 — cannot wrap around or navigate above first item
**Severity:** Low
**Lines:** 2083
`Math.max(state.index - 1, 0)` clamps the index at 0, so pressing ArrowUp when at the first item does nothing. Many autocomplete implementations allow wrapping (ArrowUp on first item goes to last) or allow returning to the text field.
**Action:** Acceptable as-is for simplicity. Optionally allow escape to clear selection and ArrowUp to wrap to bottom item.

## Summary
The autocomplete logic is well-structured with debouncing and keyboard navigation. The main concerns are the double-slice redundancy, the hardcoded ID-to-key mapping in `selectCommander`, and the accumulation of global click listeners on each call to `setupAutocomplete`.
