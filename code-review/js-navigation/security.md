# Security Review — Navigation
Lines: 1057–1069 | File: public/mtg-commander.html

## Findings

### `secret` appended to redirect URL without `encodeURIComponent`
**Severity:** Medium
**Lines:** 1059
`goBack()` builds the redirect URL with string concatenation: `'?secret=' + secret`. Unlike `apiFetch()` (which uses `encodeURIComponent`), this is unencoded. If `secret` contains characters like `&`, `=`, or `#`, the URL will be malformed or the secret will be truncated.
**Action:** Use `encodeURIComponent(secret)` here to match the pattern in `apiFetch()`:
`'/dashboard?secret=' + encodeURIComponent(secret)`.

## Summary
One medium-severity finding: the secret is not URL-encoded in `goBack()`, which is inconsistent with `apiFetch()` and could cause auth failures or URL injection if the secret contains special characters.
