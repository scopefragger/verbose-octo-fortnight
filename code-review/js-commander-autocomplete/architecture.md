# Architecture Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `fetchSuggestions` makes up to 9 Scryfall API calls per keystroke (debounced)
**Severity:** Medium
**Lines:** 2102–2111
After a single autocomplete query (1 request), `fetchSuggestions` makes up to 8 additional requests in parallel to fetch preview images for each suggestion. This means a single debounced keystroke triggers up to 9 Scryfall API calls. Scryfall has rate limits (10 requests/second) and a user typing 3–4 characters rapidly could approach that limit.
**Action:** Reduce parallel image prefetches to 4–5, or use Scryfall's catalog endpoint that returns names only without requiring per-name image fetches. The `format=image` query param on the named endpoint could also be used. Alternatively, only fetch images on hover (lazy image loading for dropdown items).

### `selectCommander` re-derives `stateKey` from `inputId` — fragile coupling
**Severity:** Low
**Lines:** 2131
`selectCommander` uses `inputId === 'commander-input' ? 'commander' : 'partner'` to look up the autocomplete state. This creates a hidden dependency between the HTML element IDs and the `acState` object keys. Adding a third autocomplete input would require updating this ternary.
**Action:** Pass `stateKey` as a parameter to `selectCommander` (from `setupAutocomplete` context) or store it in the dropdown element's `data-state-key` attribute.

### Global `document.addEventListener('click', ...)` registered per autocomplete instance
**Severity:** Medium
**Lines:** 2093–2097
`setupAutocomplete` adds a `document.addEventListener('click', ...)` each time it is called. If `setupAutocomplete` is called twice (for commander and partner), two click listeners are added to `document`. These cannot be removed without keeping a reference to the handler function. This is a minor listener leak that accumulates if `setupAutocomplete` is ever called more than twice.
**Action:** Store the click handler as a named function and use `removeEventListener` if re-setup is needed, or register a single document-level click handler that dismisses all open dropdowns.

### `fetchSuggestions` is a side-effectful async function — no loading state
**Severity:** Low
**Lines:** 2100–2126
There is no loading indicator while Scryfall requests are in flight. The dropdown simply remains empty (or shows previous results) during the fetch. For a family app this is acceptable, but on slow connections the UX is confusing.
**Action:** Show a loading placeholder in the dropdown while fetching: `dropdown.innerHTML = '<div class="ac-item">Loading…</div>'; dropdown.classList.remove('hidden');` before the fetch.

## Summary
The main architectural concerns are the high number of parallel API calls per keystroke (up to 9) and the document-level click listener registered once per autocomplete setup call. Both could cause issues at scale or with repeated initialization.
