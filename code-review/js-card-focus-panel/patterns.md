# Patterns Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Inline `style` attribute for disabled state rather than a CSS class
**Severity:** Low
**Lines:** 1984, 1987
The affordability-disabled state is applied as `style="${playDisabledStyle}"` where `playDisabledStyle` is either `''` or `'opacity:0.5;'`. This is an inline style for a state that should be expressed as a CSS class (e.g. `.focus-btn.unaffordable { opacity: 0.5; }`).
**Action:** Replace `playDisabledStyle` with a conditional CSS class: `class="focus-btn primary${affordable ? '' : ' unaffordable'}"` and define `.focus-btn.unaffordable { opacity: 0.5; cursor: not-allowed; }` in the stylesheet.

### `playTitle` attribute construction via template literal is fragile
**Severity:** Low
**Lines:** 1985, 1987
`playTitle` is conditionally set to the string `title="Not enough mana"` and then interpolated into the button tag. This pattern — building partial HTML attribute strings and splicing them into templates — is fragile. If `playTitle` were ever dynamic, it would need careful escaping.
**Action:** Set the `title` attribute via JavaScript after `innerHTML` is assigned: `el.querySelector('.focus-btn.primary').title = affordable ? '' : 'Not enough mana';`. This separates HTML structure from attribute setting.

### Emoji literals in button labels
**Severity:** Low
**Lines:** 1947–1951, 1989–1990
Button labels use emoji characters directly in the source (`↷`, `↩`, `⬆`, `🪦`, `✨`, `▶`). This is fine for a personal/family app but can cause rendering issues on some platforms and makes the code harder to read for maintainers unfamiliar with the emoji.
**Action:** Consider using text labels with CSS styling, or at minimum add a comment identifying the intended emoji for each symbol.

### `isTapped ? '⟳ Untap' : '↷ Tap'` — ternary in innerHTML template
**Severity:** Low
**Lines:** 1947
The tapped/untapped label logic is inline in the template literal. For a slightly more complex tap button (e.g. adding a CSS class), this would become unwieldy.
**Action:** Extract the button label to a variable before the template: `const tapLabel = isTapped ? '⟳ Untap' : '↷ Tap';` — this is already done by the surrounding `isTapped` variable but the label itself is inline. No immediate action needed.

## Summary
The focus panel patterns are generally consistent with the rest of the file. The main improvements would be replacing the inline `opacity:0.5` disabled style with a CSS class, and using post-render attribute assignment for the `title` attribute instead of template literal attribute construction.
