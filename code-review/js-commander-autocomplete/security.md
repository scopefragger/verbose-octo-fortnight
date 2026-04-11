# Security Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `input.id` and `dropdown.id` injected into onclick attribute via `escapeQuotes()`
**Severity:** Medium
**Lines:** 2118
`onclick="selectCommander('${escapeQuotes(name)}', '${escapeQuotes(input.id)}', '${escapeQuotes(dropdown.id)}')"`
The card `name` (from Scryfall API) is correctly escaped with `escapeQuotes()`. However, `input.id` and `dropdown.id` are element IDs taken from the DOM — these originate from static HTML (`'commander-input'`, `'partner-dropdown'` etc.), so they are not user-controlled.
The pattern is safe in practice, but injecting DOM element IDs as JavaScript string arguments in onclick attributes is fragile. If element IDs ever come from user input or a dynamic source, this becomes an XSS vector.
**Action:** Rather than passing element IDs as onclick arguments, store the mapping in a data attribute on the dropdown item or use a delegated listener with closed-over references to `input` and `dropdown`.

### `name` value from Scryfall injected into onclick via `escapeQuotes()` — correct but limited
**Severity:** Low
**Lines:** 2118
Card names from Scryfall's autocomplete endpoint are passed through `escapeQuotes()` before injection into an onclick attribute's single-quoted JS string. This is the correct function for this context. However, if a card name contained a backslash or other special JS character that `escapeQuotes()` doesn't handle, the onclick could behave unexpectedly.
**Action:** Check that `escapeQuotes()` handles backslashes and other JS metacharacters. If not, extend it or switch to a `data-name` attribute approach.

### Scryfall API responses are used without schema validation
**Severity:** Low
**Lines:** 2103–2111
The Scryfall API response (`json.data`, `card.image_uris`, `card.type_line`) is accessed without validating the shape of the response. If Scryfall returns an unexpected structure (API change, error response), the code could fail silently or produce garbled output.
**Action:** Add basic response structure checks (e.g., `if (!res.ok) throw new Error(...)`) before using `json.data`.

### Scryfall requests are made directly from the client
**Severity:** Low (by design)
**Lines:** 2102, 2109
The autocomplete makes direct client-side requests to the Scryfall API without any server-side proxy. This exposes the client's IP directly to Scryfall and bypasses any server-side rate limiting or caching.
**Action:** This is an accepted pattern for low-traffic family tools. If rate limiting becomes an issue, route the requests through a server endpoint.

## Summary
The autocomplete section handles escaping reasonably well for a vanilla JS app. The most notable concern is the pattern of injecting element IDs as JavaScript onclick arguments, which is safe now but fragile. Switching to data attributes with a delegated listener would eliminate this risk entirely.
