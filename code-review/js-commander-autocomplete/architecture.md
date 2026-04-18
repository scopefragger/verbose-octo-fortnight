# Architecture Review — js-commander-autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Two permanent global click listeners added by `setupAutocomplete`
**Severity:** Medium
**Lines:** 2093–2097
`setupAutocomplete` attaches a `document.addEventListener('click', ...)` listener on every call. Called twice (commander + partner), two global listeners run on every document click for the lifetime of the page. Unlike the context-menu's single global listener, these closures keep references to their respective input and dropdown elements, preventing GC.
**Action:** Replace with a single document-level listener that checks all known autocomplete dropdowns, or use event delegation on a common ancestor.

### `fetchSuggestions` makes up to 9 parallel API calls per query
**Severity:** Medium
**Lines:** 2108–2111
For each autocomplete query, the function fires 1 autocomplete call then up to 8 parallel named-card fetches. On a debounced 200ms trigger, this can generate 9 concurrent Scryfall requests per search. Scryfall's guidelines recommend a 50–100ms delay between requests.
**Action:** Either reduce the preview count (e.g., top 3–4) or implement a staggered fetch with small delays. Alternatively, defer image fetching until the user hovers over an item.

### `selectCommander` breaks the abstraction of `setupAutocomplete`
**Severity:** Low
**Lines:** 2128–2133
`setupAutocomplete` is designed to be generic (takes `inputId`, `dropdownId`, `stateKey`), but `selectCommander` — which is called from within the generated HTML — re-derives the state key from a hardcoded element-ID check. This means the generic abstraction in `setupAutocomplete` only works for the current two inputs.
**Action:** Encode the `stateKey` into the generated onclick: `onclick="selectCommander('${escapeQuotes(name)}', '${input.id}', '${stateKey}')"` and update `selectCommander` to accept it as a third parameter.

## Summary
The two main architecture concerns are: (1) multiple permanent global click listeners that could be consolidated, and (2) up to 9 parallel Scryfall API calls per autocomplete trigger that may violate Scryfall's rate-limiting guidelines.
