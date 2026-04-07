# Security Review — Toast Notifications
Lines: 469–486 | File: public/mtg-commander.html

## Findings

### Toast message set via `textContent`, not `innerHTML` — safe
**Severity:** Low (informational)
**Lines:** 469–486 (CSS); see JS counterpart at line 2152
The companion `showToast()` function (line 2152) assigns the message using `el.textContent = msg`, which means user-controlled or API-sourced strings cannot inject HTML or execute scripts through the toast. This is the correct pattern and should be preserved if the function is ever refactored.
**Action:** No change needed; note in any future refactor that switching to `innerHTML` here would introduce XSS risk.

## Summary
No security issues in the CSS block itself. The associated JavaScript correctly uses `textContent` to populate the toast, preventing any XSS vector through this surface.
