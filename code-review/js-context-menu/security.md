# Security Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `action` parameter in `ctxAction` not validated against allowed values
**Severity:** Low
**Lines:** 2008–2016
`ctxAction(action)` accepts a string `action` and dispatches on it. The call sites are hardcoded HTML `onclick` attributes in the context menu HTML (e.g. `onclick="ctxAction('tap')"`), so in normal usage only known values are passed. However, since `ctxAction` is a global function, a malicious browser extension or injected script could call it with arbitrary action values. With the current `if` chain, unknown actions are silently ignored (no `else` branch), which is safe.
**Action:** No immediate change required. The current behavior of silently ignoring unknown actions is a safe default. Document this is intentional with a comment.

### `ctxTarget` is a global that could be manipulated by injected scripts
**Severity:** Low
**Lines:** 1999, 2016
`ctxTarget` stores the ID of the targeted battlefield card as a module-level global. This is accessible by any script on the page. For a personal/family app with no multi-user session this is an acceptable risk.
**Action:** No immediate change required. If the app ever adds multi-user support, consider encapsulating play state in a non-global object.

### No innerHTML usage in this section
**Severity:** Info
**Lines:** 1996–2021
This section does not inject any user data or API data into the DOM via innerHTML. All DOM manipulation is via `style.display`, `style.left`, `style.top` property assignments with numeric values computed from `e.clientX`/`e.clientY`. No XSS surface.
**Action:** No change required.

## Summary
No significant security issues. The context menu dispatches on hardcoded action strings from onclick attributes and uses no innerHTML. The global `ctxTarget` and `ctxAction` are globally scoped but acceptable for a single-user app.
