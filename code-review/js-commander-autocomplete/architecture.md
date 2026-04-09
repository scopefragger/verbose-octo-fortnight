# Architecture Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `setupAutocomplete` closes over its parameters but `selectCommander` breaks the closure
**Severity:** Medium
**Lines:** 2062–2098, 2128–2133
`setupAutocomplete(inputId, dropdownId, stateKey)` captures its parameters in event listener closures. However, `fetchSuggestions` generates `onclick` attributes that call `selectCommander(name, input.id, dropdown.id)` — passing element IDs as strings through an HTML attribute. This breaks the closure: `selectCommander` must re-look up the elements by ID (line 2129–2130) and re-derive the state key (line 2131). The pattern is fragile; the closure-based setup and the ID-passing onclick work against each other.
**Action:** Use a delegated event listener on the dropdown element instead of per-item onclick attributes. The dropdown already has a reference in the closure, making the ID-passing unnecessary.

### Two separate `document.addEventListener('click', ...)` listeners added per `setupAutocomplete` call
**Severity:** Low
**Lines:** 2093–2097
Each call to `setupAutocomplete` adds a `document`-level click listener to dismiss its dropdown. Since `setupAutocomplete` is called twice (for commander and partner), two global listeners are added on every page load. These accumulate if `setupAutocomplete` is called more than once (e.g., if the component is re-initialized).
**Action:** Register a single global click listener that checks both dropdowns, or add protection against duplicate listener registration.

### `fetchSuggestions` handles both autocomplete fetching and image prefetching
**Severity:** Low
**Lines:** 2100–2126
`fetchSuggestions` performs two distinct concerns: (1) fetching autocomplete name suggestions and (2) prefetching card images for previews. These could be separate functions, especially since the image prefetching is the source of the N+1 API call problem and could be toggled off independently.
**Action:** Consider extracting image prefetching to a separate `prefetchCardImages(names)` function that `fetchSuggestions` optionally calls.

## Summary
The commander autocomplete section has an architectural tension between the closure-based setup and the onclick-based ID-passing in `selectCommander`. Two functions that should work together end up working against each other. The N+1 API call pattern and accumulating global listeners are also noteworthy architectural issues.
