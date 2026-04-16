# Architecture Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Global `click` listener registered once per `setupAutocomplete` call — accumulates on re-init
**Severity:** Medium
**Lines:** 2093–2097
`document.addEventListener('click', ...)` is registered inside `setupAutocomplete`. If `setupAutocomplete` is ever called more than once for the same input (e.g. after a UI reset or re-render), duplicate listeners accumulate on `document`. Each listener will independently hide the dropdown on clicks, which is harmless now but wastes resources.
**Action:** Use `{ once: false }` with an `AbortController` or store and remove the previous listener before adding a new one. Alternatively, register a single document-level click handler outside `setupAutocomplete` that delegates to all active dropdowns.

### `fetchSuggestions` makes 1 + N Scryfall API requests (autocomplete + one per suggestion)
**Severity:** Medium
**Lines:** 2102–2111
One autocomplete request fetches up to 8 card names, then a separate `named?fuzzy=` request is made for each name in parallel to retrieve preview images. This is up to 9 API calls per keystroke (after debounce). Scryfall's API has rate limits and the `named?fuzzy=` endpoint is heavier than needed.
**Action:** Use Scryfall's `cards/search` endpoint with `q=name:${query}&order=name` to get name + image data in a single request, or use the autocomplete result names with the `/cards/named?exact=` endpoint (which is lighter). At minimum, add request cancellation (AbortController) to cancel in-flight preview fetches when a new keystroke fires.

### `selectCommander` does not update any deck state or trigger a save
**Severity:** Low
**Lines:** 2128–2133
`selectCommander` only sets the input element's `value`. It does not update an in-memory deck state object or mark the deck as dirty. If the user selects a commander via autocomplete and immediately saves, it depends on whether the save function reads directly from the DOM input or from a state object.
**Action:** Determine whether commander selection should trigger an immediate state update. If the save reads from the DOM, document that explicitly. If a state object exists, update it here.

### `hideDropdown` clears `dropdown.innerHTML` on every hide — including keyboard navigation dismissal
**Severity:** Low
**Lines:** 2135–2139
`hideDropdown` always sets `dropdown.innerHTML = ''`, which destroys the rendered list. This means that if a user accidentally presses Escape and reopens the input, the full API call sequence runs again rather than restoring the last results.
**Action:** Consider separating visibility (hide/show) from content clearing. Only clear `innerHTML` when the input value changes, not on every dismiss.

### `acState` module-level object couples the state of two independent autocomplete instances
**Severity:** Low
**Lines:** 2057–2060
`acState` bundles the state for both `commander` and `partner` autocompletes in a single object. This is fine for two instances but would not scale to a dynamic number of autocomplete fields (e.g. in a future deck-building interface that allows multiple commanders or sideboard entries).
**Action:** Accept this as intentional given the fixed two-field design. Add a comment noting this is intentionally scoped to commander/partner only.

## Summary
The two most significant architectural issues are the accumulation of document-level click listeners on re-init and the high API call volume (up to 9 per debounce cycle) without cancellation. The `selectCommander` function's lack of state update and `hideDropdown`'s unconditional content clearing are lesser concerns.
