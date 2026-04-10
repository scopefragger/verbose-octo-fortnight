# Security Review — js-commander-autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `encodeURIComponent` used correctly for Scryfall API calls
**Severity:** N/A
**Lines:** 2102, 2109
User input is passed to the Scryfall API via `encodeURIComponent(q)` and `encodeURIComponent(name)`. This correctly prevents URL injection. No issues found here.

### `escapeQuotes` used in onclick for card names — adequate but incomplete
**Severity:** Medium
**Lines:** 2118
Card names from the Scryfall API are embedded into onclick attributes via `escapeQuotes(name)`. This prevents single-quote breakout but does not handle other HTML special characters. For example, a card name containing `>` or `&` would not be properly handled in the attribute context.
**Action:** Apply both `escapeHtml` and `escapeQuotes`: pass data by index or use `data-` attributes and event delegation instead of embedding strings in onclick attributes.

### `escapeHtml` applied correctly for displayed names and types
**Severity:** N/A
**Lines:** 2120–2121
`escapeHtml(name)` and `escapeHtml(type)` are correctly applied for values displayed in the dropdown text. This is the correct pattern.

### Direct `fetch` to Scryfall API — no rate limiting or error messaging to user
**Severity:** Low
**Lines:** 2102, 2109
The autocomplete makes up to 9 Scryfall API calls per keystroke (1 autocomplete + 8 card lookups). Scryfall has rate limits (10 req/sec for anonymous use). Rapid typing could trigger rate limiting, and errors are silently handled by hiding the dropdown.
**Action:** Add a user-visible message when the dropdown fails to load (currently silently hides). Consider reducing parallel requests or caching recent lookups.

## Summary
The main security concern is embedding card names directly in onclick attributes using only `escapeQuotes` — HTML special characters in names are not handled. Using `data-` attributes and event delegation would be a cleaner fix.
