# Static Review — js-commander-autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Redundant `.slice(0, 8)` on line 2108
**Severity:** Low
**Lines:** 2108
`names` is already sliced to 8 on line 2104 (`slice(0, 8)`), so `names.slice(0, 8)` on the next use is a no-op that adds noise.
**Action:** Remove the second `.slice(0, 8)`: `const previews = await Promise.all(names.map(...))`.

### `selectCommander` re-derives state key from inputId string comparison
**Severity:** Low
**Lines:** 2131
```js
const key = inputId === 'commander-input' ? 'commander' : 'partner';
```
This hardcodes both the DOM element ID and the state key names. If a third autocomplete input is added (e.g., for a second partner), this ternary silently assigns it the 'partner' state, causing a state collision.
**Action:** Pass the `stateKey` as a third parameter to `selectCommander` or close over it: `onclick="selectCommander('...', '...', '${stateKey}')"`.

### No `res.ok` check on Scryfall autocomplete response
**Severity:** Low
**Lines:** 2103
```js
const res = await fetch(`https://api.scryfall.com/cards/autocomplete?...`);
const json = await res.json();
```
A non-2xx response (rate limit, server error) is not checked. The fallback `json.data || []` handles a missing `data` key, but a response with `res.status === 429` and a JSON body like `{"object":"error","code":"too_many_requests",...}` would produce an empty dropdown without any user feedback.
**Action:** Add `if (!res.ok) { hideDropdown(dropdown, state); return; }` after the fetch.

## Summary
Solid autocomplete implementation with debouncing and keyboard navigation. The main static issue is `selectCommander` re-deriving the state key from a hardcoded element-ID comparison — a pattern that breaks as soon as a third autocomplete is added.
