# Security Review — Toast Element
Lines: 1029 | File: public/mtg-commander.html

## Findings

### textContent used — no XSS risk
**Severity:** Low (informational)
**Lines:** 2152
`showToast()` assigns the message via `el.textContent = msg`, which automatically escapes any HTML entities. This is the safe pattern and means toast messages cannot be used as an XSS vector even if a caller passes attacker-controlled API data directly.
**Action:** No change needed. Document this intentional use of `textContent` with a brief inline comment so future contributors do not "upgrade" it to `innerHTML`.

## Summary
No security issues. The toast element uses `textContent` for message insertion, which is inherently safe against XSS. The pattern should be explicitly documented to guard against accidental future regression to `innerHTML`.
