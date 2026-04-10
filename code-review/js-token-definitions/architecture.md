# Architecture Review — js-token-definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Token definitions live in frontend — not shareable with backend
**Severity:** Low
**Lines:** 1647–1662
`COMMON_TOKENS` is defined in the client-side HTML file. If the backend ever needs to validate or reference common token data (e.g., for a critique endpoint), these definitions cannot be reused without duplication.
**Action:** For the current single-file app design, this is acceptable. If token data is ever needed server-side, consider moving it to a shared JSON file or embedding it in the API response.

### No schema validation for token objects
**Severity:** Low
**Lines:** 1647–1662
The `COMMON_TOKENS` array entries have no enforced schema. There is no TypeScript, JSDoc, or runtime check ensuring new tokens added to this array have the required fields. A missing `type_line` or wrong field name would silently cause rendering issues.
**Action:** Add a JSDoc comment or a brief inline schema comment above the array describing the expected fields and their types.

## Summary
The section is a straightforward data constant. The main architectural note is that the data is frontend-only, which limits reuse. Adding a schema comment would aid future maintainers.
