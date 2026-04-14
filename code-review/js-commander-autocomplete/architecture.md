# Architecture Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Two Scryfall requests per autocomplete query (autocomplete + per-name detail)
**Severity:** Medium
**Lines:** 2102–2111
`fetchSuggestions` makes one request to `/cards/autocomplete` to get up to 8 names, then fires 8 parallel requests to `/cards/named` to get images. This is 9 Scryfall API calls per keystroke (after the 200ms debounce). With multiple users or rapid typing, this could hit Scryfall's rate limit (10 req/s per IP as per Scryfall's guidelines).
**Action:** Use Scryfall's `/cards/search` endpoint with `q=name:${query}&unique=cards&order=edhrec&limit=8&format=json` which returns full card objects (including images) in a single request.

### `acState` is a module-level object but `setupAutocomplete` stores state by key
**Severity:** Low
**Lines:** 2057–2060, 2065
`acState` is pre-defined with `commander` and `partner` keys. `setupAutocomplete` looks up `acState[stateKey]`, which would return `undefined` for any unknown key. There is no guard against calling `setupAutocomplete` with an unrecognised `stateKey`.
**Action:** Dynamically create state entries in `setupAutocomplete` if the key doesn't exist: `acState[stateKey] = acState[stateKey] || { timer: null, index: -1 }`. This makes the function reusable for any future autocomplete inputs.

### Each `setupAutocomplete` call adds a new global `document.addEventListener('click')` listener
**Severity:** Medium
**Lines:** 2093–2097
`setupAutocomplete` adds a `document` click listener to hide the dropdown. If `setupAutocomplete` is called twice for the same element (or called again during component re-initialization), duplicate listeners accumulate and each will attempt to hide a potentially already-hidden dropdown. Currently the function is called at most twice (commander + partner), but listener stacking is still wasteful.
**Action:** Use a single shared document click listener that checks all open dropdowns, or use `{ once: false }` with explicit cleanup — store the listener reference in `state` so it can be removed if `setupAutocomplete` is called again.

## Summary
The most significant architectural issue is the 9-request-per-keystroke pattern — using Scryfall's search endpoint would reduce this to 1. The document-level click listener accumulation is a secondary concern. The `acState` design works for the current two inputs but will break for any additional autocomplete.
