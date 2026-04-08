# Security Review — URL Secret
Lines: 1039–1048 | File: public/mtg-commander.html

## Findings

### Secret exposed in URL query string (known debt)
**Severity:** High
**Lines:** 1041, 1045
`?secret=` is visible in the browser address bar, server access logs, browser history, and any HTTP Referer headers sent to third parties (e.g. Scryfall image requests). CLAUDE.md acknowledges this as known security debt.
**Action:** Migrate to a cookie-based or Authorization-header-based approach (the server already supports `sb_access_token` cookie auth). As an interim measure, strip the secret from the URL after reading it using `history.replaceState`.

### `encodeURIComponent` usage is correct
**Severity:** Informational
**Lines:** 1045
`encodeURIComponent(secret)` prevents the secret from containing URL-breaking characters. This is correctly applied.
**Action:** No action needed.

### Secret value logged to no console — good
**Severity:** Informational
**Lines:** 1041
The `secret` variable is not logged to the console anywhere in this section, which is correct.
**Action:** No action needed.

## Summary
The primary finding is the well-known security debt of using `?secret=` in the URL. `encodeURIComponent` is correctly applied and the secret is not console-logged. Migration to header or cookie auth would eliminate the exposure.
