# Architecture Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Two sequential external API calls per keystroke (debounced)
**Severity:** Medium
**Lines:** 2102, 2108–2111
`fetchSuggestions` first calls the Scryfall autocomplete endpoint, then fires up to 8 parallel requests to the `cards/named?fuzzy=` endpoint to fetch card images. This means each debounced user input event can produce up to 9 HTTP requests. For a family tool on a home connection this is acceptable, but it is architecturally heavy.
**Action:** Consider either (a) showing text-only suggestions first and fetching images only on selection, or (b) using the Scryfall search endpoint with `q=name:${q}&type:legendary+type:creature` which returns full card objects including images in one request.

### `setupAutocomplete` registers a new global document listener each time it is called
**Severity:** Medium
**Lines:** 2093–2097
Each call to `setupAutocomplete` attaches a new `click` listener to `document`. Since this is called twice (for commander and partner), there are now two global click listeners. If `setupAutocomplete` were ever called more than twice or called again on re-init, listener accumulation would worsen.
**Action:** Maintain a single global click listener that delegates to all registered autocomplete instances, or use `{ once: false }` with a module-level listener registered once.

### `selectCommander` is a global function but tightly coupled to the two hardcoded element IDs
**Severity:** Low
**Lines:** 2128–2133
`selectCommander` maps `inputId === 'commander-input'` to `'commander'` key. This means the function is implicitly aware of the HTML element IDs rather than relying on the `acState` structure. Adding a third autocomplete (e.g., for a second partner) would require modifying this logic.
**Action:** Pass the `stateKey` as a parameter to `selectCommander` rather than deriving it from the element ID.

### `fetchSuggestions` receives both `input` and `dropdown` as parameters — could use closures
**Severity:** Low
**Lines:** 2100
`fetchSuggestions(q, input, dropdown, state)` takes four arguments, with `input`, `dropdown`, and `state` all passed from the closure in `setupAutocomplete`. This could be simplified by returning a bound function or using a class-based approach, but the current approach is acceptable in a single-file app.
**Action:** No immediate change required. The current parameter passing is explicit and readable.

## Summary
The autocomplete section makes good use of debouncing and parallel image fetching, but the two-round-trip API pattern (autocomplete + named card fetch) is heavy. The most structural concern is the global click listener accumulation, which should be refactored into a single delegated listener.
