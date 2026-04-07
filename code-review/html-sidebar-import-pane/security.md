# Security Review — Sidebar Import Pane
Lines: 796–829 | File: public/mtg-commander.html

## Findings

### Inline `onclick` handlers — no CSP compatibility
**Severity:** Medium
**Lines:** 823, 826, 827
All three buttons use inline `onclick="..."` attributes. Inline event handlers require `unsafe-inline` in a Content-Security-Policy `script-src` directive, which negates the primary XSS protection that CSP offers. If a strict CSP is ever applied to this page, these handlers will silently stop working.
**Action:** Remove inline `onclick` attributes and wire events with `addEventListener` in the JS initialisation block, matching the pattern already used for autocomplete setup in `DOMContentLoaded`.

### Textarea content is user-controlled and reaches innerHTML downstream
**Severity:** Medium
**Lines:** 810–820
The `#decklist-input` textarea accepts free-form user text. Although the textarea itself is safe, the value is later parsed and rendered back into the DOM by `importDecklist()` / `renderDeckList()`. If any rendering path uses `innerHTML` with unescaped card names (which the codebase does in `renderBattlefield()`, `renderDeckList()`, etc.), a crafted card-name string like `"><img src=x onerror=alert(1)>` could execute. This is not a vulnerability in this HTML segment itself, but the textarea is the entry point.
**Action:** Confirm that all downstream rendering paths pass card names through `escapeHtml()` before inserting into `innerHTML`. The utility exists at line 2141 — enforce its use consistently.

### No secrets or sensitive data in this segment
**Severity:** N/A
**Lines:** 796–829
No API keys, tokens, or credentials are embedded in this markup. The `?secret=` URL param is handled elsewhere (JS section 2, line 1039).

## Summary
No direct XSS or injection vector exists within this HTML segment itself. The two medium findings are architectural entry-point concerns: inline `onclick` handlers block a future strict CSP, and the decklist textarea is the user-controlled source whose value must be consistently escaped before any `innerHTML` insertion downstream. Both are worth fixing before adding a CSP header.
