# Security Review — Decklist Parser
Lines: 1071–1086 | File: public/mtg-commander.html

## Findings

### User input processed but never injected into DOM in this section
**Severity:** Informational
**Lines:** 1072–1086
`parseDecklist` processes raw user text input but only returns a structured array — it does not touch the DOM. XSS risk is deferred to whichever rendering functions consume the returned `entries`. Those rendering functions must ensure `esc()` / `textContent` is used.
**Action:** No action needed in this section; note in downstream rendering review.

## Summary
No XSS or injection risks in the parser itself. The function is a pure data transformer with no DOM interaction. Security review is clean.
