# Architecture Review — Play Area
Lines: 559–565 | File: public/mtg-commander.html

## Findings

### Toggle pattern split across CSS and JavaScript
**Severity:** Low
**Lines:** 562, 565
The show/hide mechanic for the play area is implemented via a CSS `.active` class toggle (`display: none` → `display: flex`). The responsibility for adding/removing `.active` lives in JavaScript (`setMode()`, CSS segment 13 per SEGMENTS.MD). This is a conventional and widely-accepted pattern, but because the entire application is a single-file HTML document the coupling is implicit — nothing in the stylesheet signals which JS function owns the toggle, and nothing in `setMode()` points back to this CSS contract. A future developer renaming either the class or the function has no cross-reference to follow.
**Action:** A short comment on line 560 (e.g., `/* toggled by setMode() in JS */`) and a reciprocal comment at the JS call site would make the coupling explicit without restructuring anything.

## Summary
The architecture of these lines is sound and idiomatic. The only concern is implicit coupling between the `.active` CSS toggle and its JavaScript owner in a single-file codebase where there is no module boundary or naming convention to surface the relationship.
