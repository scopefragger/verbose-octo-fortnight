# Architecture Review — JS Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### Utility functions are defined at end-of-file but used throughout
**Severity:** Low
**Lines:** 2141–2156
`escapeHtml`, `escapeQuotes`, and `showToast` are fundamental helpers called from line ~1151 onward, yet they are defined at the very bottom of the file (lines 2141–2156). This is only safe because `function` declarations are hoisted; non-hoisted forms (arrow functions assigned to `const`) would break. The placement creates a reading-order problem — reviewers and contributors encounter calls to these functions long before seeing their definitions.
**Action:** Move the utilities block to the top of the JavaScript section (just after any constants/state declarations) so the code reads in dependency order. This is a readability and maintainability improvement, not a functional bug.

### `showToast` owns both UI state mutation and timer lifecycle management
**Severity:** Low
**Lines:** 2149–2155
`showToast` manages the CSS class for display (`el.className`) and the auto-dismiss timer (`toastTimer`). This is appropriate for a tiny utility, but the timer lives in script-level scope rather than being encapsulated. If a future developer adds a second toast or a "dismiss early" capability, the global `toastTimer` will conflict.
**Action:** Encapsulate `toastTimer` within a closure around `showToast` (see static review). No immediate architectural harm, but worth doing alongside the static fix.

### `formatManaCostShort` is stranded in a different section
**Severity:** Low
**Lines:** 1642 (the function), 2141–2156 (the utilities section)
`formatManaCostShort` is a pure string-transformation utility — the same category as `escapeHtml` and `escapeQuotes` — but it lives in the play-simulator section at line 1642. This is an organisational inconsistency. Any refactor that moves utilities to a separate file or module will need to hunt down stranded helpers.
**Action:** Relocate `formatManaCostShort` to the utilities block at the end, or annotate its current location with a `// utility` comment so it is easy to find during future reorganisation.

## Summary
The utilities block is architecturally sound for a single-file app — the functions are pure, side-effect-free (except `showToast`'s controlled DOM mutation), and well-scoped. The main improvement is co-locating all utility functions and encapsulating the toast timer, both of which aid long-term maintainability.
