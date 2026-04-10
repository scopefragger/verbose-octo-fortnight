# Architecture Review — js-commander-autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Direct `fetch` to Scryfall bypasses the `apiFetch` wrapper
**Severity:** Medium
**Lines:** 2102, 2109
All other API calls in the file use the `apiFetch()` wrapper, which handles the `?secret=` parameter. The autocomplete calls make direct `fetch()` calls to the Scryfall API. While Scryfall is a public API that does not require authentication, using `fetch` directly is inconsistent with the codebase pattern and means this code cannot benefit from any future enhancements to `apiFetch` (e.g., error normalisation, retry logic).

This is architecturally appropriate for a public external API (Scryfall does not require auth), but should be clearly commented.
**Action:** Add a comment explaining why direct `fetch` is used: `// Direct fetch — Scryfall is a public API, no auth required`.

### Autocomplete performs N+1 API calls
**Severity:** Medium
**Lines:** 2107–2111
After getting autocomplete suggestions (1 call), the code fetches card details for each suggestion in parallel (up to 8 more calls). This N+1 pattern is expensive. The Scryfall `/cards/autocomplete` endpoint does not return card images, but a search endpoint (`/cards/search`) or collection endpoint could return multiple cards in a single request.
**Action:** Replace the N individual `named?fuzzy=` calls with a single `/cards/collection` POST request using the `identifiers` array format, reducing 8 calls to 1.

### `acState` object couples autocomplete state to specific element IDs
**Severity:** Low
**Lines:** 2057–2060, 2131
The `acState` object has fixed keys `'commander'` and `'partner'` that correspond to specific input IDs. `selectCommander` maps input IDs back to state keys. This tight coupling means adding a third autocomplete requires changes in multiple places.
**Action:** Store the state key alongside the element setup, or derive the key from the element ID directly.

## Summary
The main architectural concern is the N+1 pattern for fetching card previews, which makes up to 9 Scryfall API calls per autocomplete trigger. This should be refactored to use the `/cards/collection` batch endpoint.
