# Security Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxTarget` is set from `id` passed via `onclick` in generated HTML
**Severity:** Low
**Lines:** 1999
`ctxTarget = id` stores the ID passed to `showCtxMenu`. This ID originates from `bfc.id` in `bfCardHTML`, which uses `JSON.stringify(bfc.id)` for safe embedding. The stored value is an application-controlled UUID, not user input.
**Action:** No action needed. Confirm `bfc.id` remains an application-controlled value.

### Action strings passed to `ctxAction` come from HTML `onclick` attributes
**Severity:** Low
**Lines:** 2008
`ctxAction('tap')`, `ctxAction('hand')` etc. are hard-coded strings in the HTML. Since only specific string values trigger game actions and all other strings are silently ignored, there is no injection risk — an attacker would need to modify the HTML to change context menu behavior, which implies full DOM access.
**Action:** No action needed.

## Summary
No security issues. The context menu operates entirely on application-controlled data (UUIDs and hard-coded action strings) with no user-supplied data entering the system.
