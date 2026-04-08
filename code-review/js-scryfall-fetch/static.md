# Static Review — Scryfall Fetch
Lines: 1088–1145 | File: public/mtg-commander.html

## Findings

### `fetchCards` swallows all errors silently
**Severity:** Medium
**Lines:** 1130
The `catch {}` block on the collection endpoint discards all errors (network errors, 429 rate-limit, 5xx) with no user feedback and no logging. A rate-limit or network failure will silently result in all cards in that chunk being "not found".
**Action:** At minimum, log the error: `catch (err) { console.warn('Scryfall batch failed:', err); }`. Ideally surface a toast or UI message.

### `res.ok` not checked in `fetchCards` collection call
**Severity:** Medium
**Lines:** 1113
`fetchCards` calls `res.json()` without first checking `res.ok`. If Scryfall returns a non-2xx (e.g. 422 Unprocessable Entity for bad identifiers), `json.data` will be undefined and the cards will silently not be cached. The `fetchCard` single-lookup correctly checks `if (!res.ok) return null` (line 1093).
**Action:** Add `if (!res.ok) continue;` (or `throw`) after `const json = await res.json()`.

### Delay in `Promise.all` is ineffective
**Severity:** Low
**Lines:** 1137–1141
`await new Promise(r => setTimeout(r, 50))` inside a `Promise.all` callback doesn't introduce sequential delays — all promises start concurrently. The delay only delays each individual promise's completion but all fetches are already in-flight simultaneously.
**Action:** If rate-limiting is the intent, use sequential iteration (`for...of`) instead of `Promise.all`, or document that the delay is cosmetic.

## Summary
`fetchCard` is clean. `fetchCards` has two medium-severity issues: silent error swallowing and missing `res.ok` check on the collection endpoint. The delay in `Promise.all` is ineffective for rate-limiting.
