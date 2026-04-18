# Security Review — js-commander-autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Stale-response race condition could display wrong suggestions
**Severity:** Medium
**Lines:** 2100–2126
Multiple inflight fetch chains can race: if the user types "Sol" then "Sola", two `fetchSuggestions` calls fire (debounced, but can still overlap). If the "Sola" response arrives before "Sol", the dropdown temporarily shows "Sol" results. No request cancellation (`AbortController`) is implemented.
While not a security risk in the traditional sense, this is a data integrity issue: the autocomplete could populate the commander input with a name that doesn't match what the user typed.
**Action:** Store an `AbortController` in `acState` and abort the previous request before starting a new one:
```js
state.controller?.abort();
state.controller = new AbortController();
fetch(url, { signal: state.controller.signal });
```

### Direct Scryfall API calls from client expose no credentials
**Severity:** Low (informational)
**Lines:** 2102, 2109
The Scryfall API is called directly from the browser — no API key is required, and CORS is permitted. This is correct and expected. However, up to 9 parallel requests per autocomplete trigger (1 + 8 named lookups) could trigger Scryfall's rate limiting, which returns 429 responses (unhandled — see static review).
**Action:** No credentials to protect. Add rate-limit handling as noted in the static review.

## Summary
No XSS or injection risks — all user input is properly encoded and all API output is correctly escaped before HTML insertion. The primary concern is the stale-response race condition, which could cause incorrect commander selection.
