# Architecture Review — Card Focus Panel
Lines: 660–695 | File: public/mtg-commander.html

## Findings

### Button variant styles defined locally rather than extending a shared system
**Severity:** Low
**Lines:** 683–692
`.focus-btn`, `.focus-btn.primary`, and `.focus-btn.danger` define their own button surface — padding, border-radius, border, font-size, hover transitions — independently of any shared button base class used elsewhere in the file (e.g. the play-controls buttons at lines 567–580). This creates a parallel button system with duplicated structural declarations.
**Action:** Extract a `.btn-base` (or similar) rule covering padding, border-radius, cursor, and transition, and have `.focus-btn` extend it. Modifier classes (`.primary`, `.danger`) should only carry colour overrides.

### Panel visibility managed purely via CSS class toggle
**Severity:** Low
**Lines:** 668–669, 672
`transform: translateY(100%)` / `.visible { transform: translateY(0) }` is a clean pattern, but the `z-index: 20` value is set here in CSS without a documented layer ordering. If the context menu (`z-index` on `.card-ctx-menu` at line 647) or other absolute-positioned children change, stacking conflicts may arise silently.
**Action:** Document z-index layers in a comment block or a dedicated `:root` token (e.g. `--z-focus-panel: 20; --z-ctx-menu: 30;`) so the stacking order is explicit and centrally managed.

## Summary
The CSS is well-contained for its role, but button styles are duplicated across the file rather than built on a shared foundation. Z-index values are scattered magic numbers; centralising them as tokens or a comment layer map would prevent stacking surprises as the UI grows.
