# Architecture Review — Toast Element
Lines: 1029 | File: public/mtg-commander.html

## Findings

### Toast element and its controller are in separate segments
**Severity:** Low
**Lines:** 1029 (HTML element), 2149–2155 (showToast logic)
The `<div id="toast">` is defined in the HTML section and its controlling function `showToast()` (plus the `toastTimer` variable) lives in the Utilities section (lines 2149–2155). This is a sensible separation in a single-file app, but because the two pieces are far apart (~1100 lines), the relationship is invisible without searching. There is no comment on the HTML element pointing to `showToast()` or vice-versa.
**Action:** Add a brief comment on line 2149: `// Controlled by <div id="toast"> (line 1029)` to cross-reference. This is a documentation concern rather than a structural one — the coupling is intentional and appropriate.

### CSS, HTML, and JS for toast are spread across three segments but aligned by design
**Severity:** Low (informational)
**Lines:** 470–486 (CSS), 1029 (HTML), 2149–2155 (JS)
All three layers are consistent and cohesive. There is no logic leaking across layers. The architecture for this feature is correct.
**Action:** No change needed.

## Summary
The toast element follows a clean three-layer split (CSS/HTML/JS) that is appropriate for a single-file app. The only architectural note is that the cross-segment relationship between the HTML element and its JS controller is not documented inline, which should be addressed with a short comment.
