# Architecture Review — Card Context Menu
Lines: 647–658 | File: public/mtg-commander.html

## Findings
### Context menu is a floating fixed element styled in CSS but positioned by JavaScript
**Severity:** Low
**Lines:** 649–651
`position: fixed` is correctly used for a viewport-anchored context menu. However, the actual `top`/`left` coordinates are set at runtime by JavaScript (see JS Section 19, lines 1996–2021). The CSS half of the positioning contract (fixed, z-index, min-width) is here, while the dynamic half lives elsewhere. This split is the natural consequence of the single-file architecture, but it means a developer must consult two distant sections to reason about menu placement.
**Action:** Add a short comment in the CSS block noting that `top`/`left` are set programmatically by `showCtxMenu()`, so the split is intentional and expected.

### `.danger` variant is a bare modifier with no namespace
**Severity:** Low
**Lines:** 658
`.ctx-item.danger` is a functional variant class but uses a generic, unprefixed name. In a single-file app this is low risk, but if styles are ever extracted or shared, `.danger` could collide with other components.
**Action:** Rename to `.ctx-item--danger` (BEM modifier) or `.ctx-danger` to keep the namespace local to the context menu component.

## Summary
The CSS is appropriately isolated for what it styles. The main architectural note is the intentional split of `position: fixed` (CSS) and `top`/`left` (JS), which should be documented with a comment. The bare `.danger` modifier class is a minor naming-scope issue.
