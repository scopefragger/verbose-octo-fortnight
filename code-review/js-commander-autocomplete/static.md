# Static Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `acState` only supports `commander` and `partner` keys — hardcoded mapping
**Severity:** Low
**Lines:** 2057–2060, 2131
`acState` is initialized with exactly two keys: `commander` and `partner`. The `selectCommander` function maps `inputId === 'commander-input'` to `'commander'` else `'partner'`. This hardcoded binary assumption means the autocomplete cannot be reused for a third input (e.g., a second partner in three-partner Commander variants) without modifying multiple locations.
**Action:** Make `setupAutocomplete` accept the state key as a parameter rather than deriving it from the input ID in `selectCommander`.

### Keyboard navigation index is not clamped to -1 on ArrowUp from first item
**Severity:** Low
**Lines:** 2082–2084
When `state.index` is 0 and the user presses ArrowUp, `Math.max(state.index - 1, 0)` clamps to 0, keeping the first item highlighted. This is reasonable behavior but means the user cannot "deselect all" by pressing ArrowUp past the first item (which some autocomplete implementations support). Not a bug, but a UX limitation.
**Action:** Optionally allow `Math.max(state.index - 1, -1)` to deselect all items when arrowing up past the first.

### `fetchSuggestions` makes N+1 API calls to Scryfall
**Severity:** Medium
**Lines:** 2102–2111
`fetchSuggestions` first calls the autocomplete endpoint to get up to 8 card names, then makes up to 8 individual `named` API calls in parallel to fetch card images. This is an N+1 pattern: every keystroke (after debounce) generates up to 9 Scryfall API requests. Scryfall's API rate limits and CORS policies make this viable for low-traffic use, but it is aggressive for a UI typing interaction.
**Action:** Document the N+1 pattern. Consider using Scryfall's `/cards/search` endpoint which returns full card objects including images in a single request, or cache fetched card data locally.

### `names.slice(0, 8)` followed by `.map(name =>` on the same 8-item array — `slice` in `Promise.all` is redundant
**Severity:** Low
**Lines:** 2104, 2108
`const names = (json.data || []).slice(0, 8)` limits to 8 names, then `names.slice(0, 8).map(...)` in the `Promise.all` call slices again unnecessarily. The inner slice is a no-op.
**Action:** Remove the redundant `.slice(0, 8)` from line 2108: `const previews = await Promise.all(names.map(...))`.

## Summary
The autocomplete section has an N+1 Scryfall API pattern (up to 9 requests per keystroke), a hardcoded two-input state limitation, and a redundant array slice. The keyboard navigation is functional but cannot deselect all items via ArrowUp, which is a minor UX limitation.
