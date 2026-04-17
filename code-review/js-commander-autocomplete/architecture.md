# Architecture Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `setupAutocomplete` makes two live Scryfall API calls per keystroke (debounced)
**Severity:** Medium
**Lines:** 2100–2125
`fetchSuggestions` first calls the Scryfall autocomplete endpoint, then immediately fires up to 8 parallel card-detail requests to get preview images. This is 1 + N API calls per debounce trigger (where N ≤ 8). For a commander input that users type into repeatedly, this can generate a large number of concurrent requests to an external API, potentially hitting rate limits or causing noticeable latency.
**Action:** Consider caching fetched preview cards by name in a module-level `Map` to avoid re-fetching the same card data on repeated queries. Also consider only fetching previews for the top 3–4 names rather than all 8.

### `selectCommander` re-looks up elements by ID instead of using closures
**Severity:** Low
**Lines:** 2128–2133
`selectCommander(name, inputId, dropdownId)` calls `document.getElementById(inputId)` and `document.getElementById(dropdownId)` at runtime. But `setupAutocomplete` already holds closure references to `input` and `dropdown`. Passing element IDs through the `onclick` string and then re-looking them up is an architectural round-trip that could be avoided.
**Action:** Remove `selectCommander` as a standalone global function. Instead, attach the click handler in `fetchSuggestions` using a closure over the `input`, `dropdown`, and `state` references already in scope — eliminating the need to pass IDs through the inline onclick.

### Two separate `document` click handlers registered for two autocomplete instances
**Severity:** Low
**Lines:** 2093–2097
Each `setupAutocomplete` call adds a listener to `document`. With two calls (commander, partner), there are two persistent document-level listeners for the same dismiss-on-outside-click behaviour. Neither is ever removed.
**Action:** Refactor to a single shared document listener that iterates `acState` entries. Or use a more modern approach: `element.addEventListener('focusout', ...)` with `relatedTarget` checking to close when focus leaves the autocomplete widget.

### `acState` is a module-level object that couples the two autocomplete instances together
**Severity:** Low
**Lines:** 2057–2060
Both autocomplete instances share the `acState` object, with each instance addressed by a string key (`'commander'`, `'partner'`). Adding a third instance requires modifying `acState` in one place and `selectCommander`'s ternary in another — the two are out of sync by design.
**Action:** Encapsulate per-instance state inside `setupAutocomplete` as a closure variable (`const state = { timer: null, index: -1 }`) and remove `acState` as a module-level export. `selectCommander` should then be a closure rather than a named global.

### `fetchSuggestions` is not cancellable — race condition on rapid typing
**Severity:** Medium
**Lines:** 2100–2126
The 200ms debounce reduces the frequency of requests, but if two fetches are in-flight (e.g. the debounce fires, then the user types very quickly), the second response may arrive before the first, and both update `dropdown.innerHTML`. The last response to arrive wins, which may not be the most recent query.
**Action:** Implement a generation counter or `AbortController` pattern: increment a counter at the start of each `fetchSuggestions` call and only apply the response if the counter matches the current value when the response arrives.

## Summary
The autocomplete is well-designed overall — it has proper debouncing, keyboard navigation, and error handling. The main architectural concerns are the potential race condition from non-cancellable in-flight requests, the N+1 Scryfall API call pattern per keystroke, and the indirect state management through `selectCommander`'s ID round-trip. Refactoring to use closures throughout would eliminate the module-level `acState` object and the global `selectCommander` function.
