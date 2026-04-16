# Architecture Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Hard-coded data in the view layer
**Severity:** Low
**Lines:** 1647–1662
**Description:** `COMMON_TOKENS` is a pure data constant embedded inside a 2000-line HTML file. In the current single-file architecture this is acceptable, but it mixes static game data with UI logic, making it harder to update the token list independently or reuse it server-side for validation.
**Action:** No immediate action required given the deliberate single-file design. If the app grows, extract to a `data/tokens.js` module or fetch from the API so the list is defined once and shareable between client and server.

## Summary
No structural problems within the current single-file constraint. The only note is that pure data constants are easiest to maintain when isolated from rendering logic — something to keep in mind if this file is ever split.
