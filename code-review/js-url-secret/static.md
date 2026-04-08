# Static Review — URL Secret
Lines: 1039–1048 | File: public/mtg-commander.html

## Findings

### `apiFetch` does not return the response or handle errors
**Severity:** Low
**Lines:** 1043–1048
`apiFetch()` returns a raw `fetch()` Promise. Callers must remember to call `.json()` and handle non-2xx responses themselves. There is no centralised error guard (e.g. checking `response.ok`). Inconsistent error handling is scattered across callers.
**Action:** Consider adding a `.then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })` wrapper, or at minimum document that callers are responsible for response handling.

### `secret` defaults to empty string, not null
**Severity:** Low
**Lines:** 1041
`urlParams.get('secret') || ''` silently degrades to unauthenticated requests if the param is absent. Callers that expect auth will silently get a 401/403 with no client-side indication.
**Action:** Consider logging a console warning when `secret` is empty in non-production environments to surface misconfiguration early.

## Summary
The URL secret extraction and `apiFetch` wrapper are correct and minimal. The two findings are about missing error-handling conventions and a silent fallback to unauthenticated state.
