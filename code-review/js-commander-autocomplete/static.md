# Static Code Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `fetchSuggestions` makes 8 parallel card detail requests for every keystroke
**Severity:** Medium
**Lines:** 2107–2111
After getting up to 8 autocomplete names, the function immediately fires 8 parallel `fetch` calls to Scryfall's `/cards/named` endpoint to get images and type lines. This means every debounced keystroke generates 9 network requests (1 autocomplete + 8 card details). If the user types quickly and the debounce fires multiple times, Scryfall's rate limit of 10 requests/second could be breached.
**Action:** Limit parallel card detail fetches to 3–4 at a time (not all 8), or only fetch details for the top 4 results. Add a `Promise.allSettled` guard already exists via `.catch(() => null)`, which is good.

### `acState` only supports `commander` and `partner` keys
**Severity:** Low
**Lines:** 2057–2060, 2065
`acState` has hardcoded keys `commander` and `partner`. If a third autocomplete field is added, the pattern requires adding a new key manually. There is no guard against calling `setupAutocomplete` with an unknown `stateKey`.
**Action:** Add a fallback: `const state = acState[stateKey] ?? { timer: null, index: -1 };` or validate `stateKey` at the start of `setupAutocomplete`.

### `selectCommander` hardcodes input ID comparison to infer the state key
**Severity:** Medium
**Lines:** 2131
`const key = inputId === 'commander-input' ? 'commander' : 'partner';` — this hardcodes the mapping between input element IDs and `acState` keys. If the input ID changes, this silently breaks.
**Action:** Pass the state key directly to `selectCommander` instead of inferring it from the input ID.

### Stale dropdown if network request returns after a newer query
**Severity:** Medium
**Lines:** 2100–2125
There is no request cancellation or sequence tracking. If the user types "Sol" then "Sol Ring", and the "Sol" request responds after the "Sol Ring" request, the dropdown will show "Sol" results. The debounce (200ms) mitigates this but does not eliminate it.
**Action:** Use an AbortController per query and abort the previous request when a new one starts, or track a request sequence number and discard stale responses.

## Summary
The autocomplete is functional but makes excessive parallel requests to Scryfall on each keystroke, risking rate limiting. The stale response race condition and the hardcoded input-ID-to-state-key mapping are the most actionable findings.
