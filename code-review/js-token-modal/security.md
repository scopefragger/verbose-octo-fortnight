# Security Review — js-token-modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `escapeHtml(JSON.stringify(t))` creates a false sense of security
**Severity:** High
**Lines:** 2029
The code attempts to safely embed a JSON-serialised token object into an `onclick` attribute using `escapeHtml()`. However, `escapeHtml()` performs HTML entity encoding, which is the wrong tool for escaping JavaScript string arguments. While the `COMMON_TOKENS` data is hardcoded (so no user input is involved), this pattern is incorrect and dangerous:

1. If any token property ever contained a single quote (`'`), it could break out of the onclick JavaScript context.
2. The pattern suggests to future maintainers that `escapeHtml()` is safe for embedding arbitrary data in onclick attributes — it is not.

**Action:** Pass data by reference (index into `COMMON_TOKENS`) rather than embedding serialised objects in onclick attributes. Use `onclick="addTokenPreset(${i})"`.

### Token data is from a hardcoded constant — no user input risk
**Severity:** N/A
**Lines:** 2026–2030
`COMMON_TOKENS` is a static constant defined in the file. No user-supplied or API-sourced data is involved in rendering the preset buttons. The XSS risk from the misused `escapeHtml` pattern is latent, not currently exploitable.

## Summary
The `escapeHtml(JSON.stringify(...))` pattern is a security anti-pattern that is currently safe only because `COMMON_TOKENS` is hardcoded. It should be replaced with index-based dispatch to prevent the pattern from being copied to contexts where user data is involved.
