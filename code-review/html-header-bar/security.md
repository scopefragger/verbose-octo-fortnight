# Security Review — Header Bar
Lines: 776–783 | File: public/mtg-commander.html

## Findings

### Inline `onclick` handlers pass string literals — no injection surface here, but pattern is risky
**Severity:** Low
**Lines:** 780–781
`onclick="setMode('prepare')"` and `onclick="setMode('play')"` pass hard-coded string literals, so there is no injection vector in this specific snippet. However, the `onclick` attribute pattern is a footgun: if a future developer follows the same pattern with dynamic content (e.g., a deck name or card name inserted into a button's `onclick`), it would introduce XSS. The `#deck-status` element is written via JavaScript (`innerHTML` or `textContent` elsewhere) — that call site is where XSS risk lives, not here, but the header is the destination.
**Action:** No immediate fix required for these two buttons. As a low-priority hardening step, replace `onclick` attributes with `addEventListener` calls in the JS init block to discourage the inline-handler pattern being replicated with dynamic data.

## Summary
No direct XSS, injection, or secret exposure exists in lines 776–783. All attribute values are static string literals. The only flag is that inline `onclick` attributes set a pattern that would be unsafe if imitated with dynamic content.
