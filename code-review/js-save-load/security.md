# Security Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### XSS risk in onclick attribute — deck ID not sanitised
**Severity:** High
**Lines:** 1489–1490
Deck IDs (`d.id`) from the API are interpolated directly into `onclick="loadDeckFromSaved('${d.id}')"` and `onclick="deleteSavedDeck('${d.id}', ...)"` without any escaping. If the API returns a malicious `id` value containing a single-quote or JavaScript, it would break out of the string context and execute arbitrary code.
**Action:** Wrap `d.id` with `escapeQuotes(d.id)` in both onclick strings, or preferably switch to `data-id` attributes and add event listeners in JS to avoid inline handlers entirely.

### XSS risk in onclick attribute — deck name in `deleteSavedDeck`
**Severity:** Medium
**Lines:** 1490
`escapeQuotes(d.name)` is used, which is correct for the onclick JS context. However, verify that `escapeQuotes` escapes backslashes as well as single-quotes, since `d.name = "it\\'s"` could still break out if only apostrophes are escaped.
**Action:** Confirm `escapeQuotes` covers backslash escaping. Prefer data attributes over inline onclick handlers.

### `saveDeck()` error message reflected in toast
**Severity:** Low
**Lines:** 1472
`showToast('Save failed: ' + err.message, true)` displays the raw server error message to the user. If the server error contains HTML, it will be rendered as text (since `showToast` likely sets `textContent`), but confirm `showToast` does not use `innerHTML`.
**Action:** Verify `showToast` sets `textContent` or uses `escapeHtml()`. If it uses `innerHTML`, escape `err.message`.

### IDOR — deck ID passed directly to API endpoint without client-side validation
**Severity:** Low (server-side must enforce scoping)
**Lines:** 1502, 1522
`/api/mtg/decks/' + id` uses the raw ID from the API response. The server service must scope by `family_id` on GET/DELETE. This is noted as correct in the service layer pattern, but it is worth confirming the DELETE endpoint scopes by both `id` AND `family_id`.
**Action:** Verify `services/mtgCommander.js` `deleteDecklist` filters by both `id` and `family_id` (per project patterns). No client change needed if server is correct.

## Summary
The most significant issue is that `d.id` is interpolated raw into inline event-handler strings — if the backend ever returns a non-UUID id, this is an XSS vector. Switching to `data-*` attributes and JS event listeners would eliminate this class of risk entirely. The `escapeQuotes` usage on `d.name` shows awareness of the pattern but is not applied to `d.id`.
