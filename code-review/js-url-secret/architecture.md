# Architecture Review — URL Secret
Lines: 1039–1048 | File: public/mtg-commander.html

## Findings

### `apiFetch` is the sole API abstraction layer — correctly placed
**Severity:** Informational
**Lines:** 1043–1048
All API calls in the file funnel through `apiFetch()`, making auth transparent to callers. This is a good pattern that centralises the credential injection.
**Action:** No action needed structurally.

### Auth mechanism is client-side only
**Severity:** Medium
**Lines:** 1041–1045
The authentication decision (whether to attach the secret) is made on the client. If `secret` is empty (user navigates without the param), all API calls become unauthenticated and the server returns 401/403. There is no client-side redirect or error message to guide the user.
**Action:** Add a startup check: if `secret` is empty, display a warning or redirect to an auth page rather than silently failing API calls later.

## Summary
`apiFetch` is an effective single-responsibility auth wrapper. The architectural gap is the lack of a client-side guard for the absent-secret case, which leads to silent downstream failures.
