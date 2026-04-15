# Static Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Missing null guard on `saved.cards`
**Severity:** Medium
**Lines:** 1510
`saved.cards.map(...)` will throw if `saved.cards` is null or undefined (e.g. deck saved without cards, or API returns an unexpected shape). There is no guard before accessing `.map()`.
**Action:** Add a null guard: `const text = (saved.cards || []).map(c => \`${c.qty} ${c.name}\`).join('\n');`

### Silent error in `loadSavedDecks` swallows the actual error message
**Severity:** Low
**Lines:** 1494
The catch block for `loadSavedDecks()` discards the error entirely (`catch {` with no binding), making debugging impossible in production.
**Action:** Bind the error: `catch (err) {` and at minimum `console.warn('loadSavedDecks failed:', err)` or pass `err.message` to `showToast`.

### Silent errors in `loadDeckFromSaved` and `deleteSavedDeck`
**Severity:** Low
**Lines:** 1514, 1527
Same pattern — catch blocks discard the error. Any failure is masked.
**Action:** Bind error variables and log or surface them consistently with `saveDeck()`.

### `!res.ok` handling in `loadSavedDecks` throws with no message
**Severity:** Low
**Lines:** 1481
`throw new Error()` with no argument produces an empty error message. The catch block already replaces with a static string, but it prevents any diagnosis.
**Action:** `throw new Error(await res.text())` for consistency with `saveDeck()`.

## Summary
The section is functionally sound but has inconsistent error handling — `saveDeck()` surfaces the server error message while the other three functions silently swallow errors. A missing null guard on `saved.cards` is the only crash risk.
