# Static Review — Main Layout Wrapper
Lines: 785–965 | File: public/mtg-commander.html

## Findings

### Inline `onclick` references to undeclared (in-scope) functions
**Severity:** Low
**Lines:** 790–791, 823, 826, 827, 834–835, 880–883, 899, 904, 906, 915–919, 923, 944, 952–953
All interactive elements wire behavior via `onclick="functionName()"` string attributes. If any referenced function (`switchTab`, `importDecklist`, `clearDeck`, `saveDeck`, `drawHand`, `mulligan`, `keepHand`, `critiqueHand`, `toggleSidebar`, `changeLife`, `untapAll`, `gameDrawCard`, `showTokenModal`, `endTurn`, `startGame`, `closeFocusPanel`, `showGraveViewer`) is renamed or not yet defined when the HTML is parsed, the call fails silently at runtime with no static tooling warning.
**Action:** Consider consolidating event listeners in a single `DOMContentLoaded` block so missing references surface as explicit errors, and so a linter/TypeScript can validate names.

### `id="focus-img"` — `src=""` initial value
**Severity:** Low
**Lines:** 936
The `<img>` is rendered with `src=""`, which triggers a network request to the page's own URL in some browsers (a blank/relative GET). The `alt=""` is also empty, which is fine for a decorative/dynamic image but should be confirmed intentional.
**Action:** Use `src="data:,"` or omit `src` entirely until populated by JS; set a meaningful `alt` default like `alt="Card image"`.

### Hardcoded starting life total in markup
**Severity:** Low
**Lines:** 905
`<div class="life-val" id="life-counter">40</div>` bakes the starting life total (40) into the HTML. If `startGame()` resets it at runtime this is harmless, but if the JS logic ever changes the default to a different value (e.g. for Brawl) the HTML default and JS default can drift.
**Action:** Initialize to an empty string or `—` in HTML; let `startGame()` always set the displayed value on first render.

### `id="mulligan-info"` `<span>` has no initial text
**Severity:** Low
**Lines:** 879
The mulligan count span starts empty and is only populated after `drawHand()` is called. This is fine, but there is no aria-live region or fallback text, so screen readers get no update when the count changes.
**Action:** Minor — add `aria-live="polite"` if accessibility is a goal.

## Summary
No showstopper static defects. The main recurring issue is heavy reliance on global `onclick` string attributes, which makes refactoring error-prone and invisible to static analysis. The `src=""` on the focus image is a minor browser hygiene issue. All referenced IDs appear to be unique and consistently named within this block.
