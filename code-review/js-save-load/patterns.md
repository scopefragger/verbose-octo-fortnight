# Patterns Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Inconsistent error message handling across async functions
**Severity:** Medium
**Lines:** 1468, 1481, 1503, 1523
`saveDeck()` correctly calls `await res.text()` to extract the server error message before throwing. The other three functions (`loadSavedDecks`, `loadDeckFromSaved`, `deleteSavedDeck`) throw a bare `new Error()` with no message. This inconsistency means error UX is good for saves but opaque for loads and deletes.
**Action:** Standardise all four functions to use `throw new Error(await res.text())` on non-ok responses. Consider extracting a shared `assertOk(res)` helper.

### Loading spinner only shown for `loadSavedDecks`, not for `loadDeckFromSaved`
**Severity:** Low
**Lines:** 1478, 1500
`loadSavedDecks` shows a spinner while loading (`'<div class="empty-saved"><span class="loading-spinner"></span></div>'`). `loadDeckFromSaved` only shows a toast (`showToast('Loading deck…')`). This is inconsistent UX — a full deck load (which may trigger a Scryfall fetch chain) can take several seconds with no visual progress indicator beyond a small toast.
**Action:** Disable the Load button and show a more prominent loading state during `loadDeckFromSaved`.

### Magic string `'No commander set'` and inline date formatting
**Severity:** Low
**Lines:** 1487
The fallback label `'No commander set'` and the inline `new Date(...).toLocaleDateString()` are not extracted to constants or utility functions. These make internationalisation or consistent formatting changes harder.
**Action:** Extract the fallback string to a named constant and consider a shared `formatDate()` utility if date formatting appears in multiple places.

### `confirm()` used for delete confirmation
**Severity:** Low
**Lines:** 1520
`confirm()` is a browser-native blocking dialog — it cannot be styled and on some browsers may display a warning that the page is trying to prevent navigation. The rest of the app uses `showToast()` for user feedback, suggesting a richer UI layer is in place.
**Action:** Replace `confirm()` with an inline confirmation button pattern (e.g., first click shows "Are you sure? [Yes] [No]" in the deck row) to stay consistent with the app's visual design language.

### No optimistic UI update — list always fully reloaded after mutations
**Severity:** Low
**Lines:** 1470, 1525
Both `saveDeck` and `deleteSavedDeck` call `loadSavedDecks()` after success, which fires a new API call and re-renders the entire list. For small deck counts this is fine, but it causes a visible flicker and adds an unnecessary round-trip.
**Action:** For delete, remove the item from the DOM directly on success; for save, prepend the new item. Only fall back to `loadSavedDecks()` if the optimistic update fails.

## Summary
The section is functional and readable. The main pattern friction is inconsistent error-handling across the four async functions and the use of browser-native `confirm()` which clashes with the rest of the app's UI style. Standardising error handling and replacing `confirm()` with an inline pattern are the highest-value improvements.
