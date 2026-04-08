# Patterns Review — URL Secret
Lines: 1039–1048 | File: public/mtg-commander.html

## Findings

### `secret` and `urlParams` are module-level constants, not grouped with other config
**Severity:** Low
**Lines:** 1040–1041
`secret` is a runtime-derived constant that acts as app configuration, but it is declared in its own banner section rather than alongside other constants (there are none — magic strings and numbers appear inline throughout the file).
**Action:** Low priority; this is the correct place. Document it as "app configuration" in the comment.

### Ternary URL building could use `URL` or `URLSearchParams` API
**Severity:** Low
**Lines:** 1044–1045
The manual `url.includes('?') ? '&' : '?'` separator check replicates what the `URL` / `URLSearchParams` API handles automatically, and can fail for URLs with fragment identifiers (`#`).
**Action:** Consider building the auth URL with `const u = new URL(url, location.origin); u.searchParams.set('secret', secret); return fetch(u.toString(), opts)` for robustness.

## Summary
The section is concise and consistent with the rest of the file's patterns. Two low-severity improvements: document `secret` as app config, and replace manual URL separator logic with the URL API.
