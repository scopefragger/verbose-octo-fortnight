# Static Review — js-save-load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Empty Error objects discard server detail
**Severity:** Medium
**Lines:** 1481, 1503, 1523
`throw new Error()` with no message means the catch block receives an Error with an empty message, discarding whatever the server actually returned. `saveDeck()` (line 1468) correctly does `throw new Error(await res.text())` — the other three functions should match that pattern.
**Action:** Replace bare `throw new Error()` with `throw new Error(await res.text())` (or at minimum `throw new Error('HTTP ' + res.status)`) in `loadSavedDecks`, `loadDeckFromSaved`, and `deleteSavedDeck`.

### Missing null guard on `saved.cards`
**Severity:** Medium
**Lines:** 1510
`saved.cards.map(...)` will throw a TypeError if `saved.cards` is `null` or `undefined`, which can happen if the deck row was saved without a cards column or the JSON is malformed.
**Action:** Guard with `(saved.cards || []).map(...)` before mapping.

### Hardcoded empty `tokens` array on save
**Severity:** Low
**Lines:** 1466
`tokens: []` is always sent to the API, silently discarding any custom tokens the user may have defined in the token modal during a session.
**Action:** Collect current `playBattlefield` tokens (or a dedicated tokens state variable) and include them in the payload, or document this as a known limitation.

### Inconsistent error-toast content
**Severity:** Low
**Lines:** 1472 vs 1495, 1515, 1527
`saveDeck` exposes `err.message` in the toast; the other three functions show a generic string. This inconsistency makes debugging harder for users.
**Action:** Standardise — either always include `err.message` or always show a generic message.

## Summary
The section is functional but has inconsistent error handling: `saveDeck` correctly captures server error text while the other three functions throw empty Errors and lose diagnostic information. A missing null guard on `saved.cards` is a latent crash risk.
