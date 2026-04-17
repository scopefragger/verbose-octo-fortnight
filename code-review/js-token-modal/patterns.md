# Patterns Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Unused `pt` variable makes intent unclear
**Severity:** Medium
**Lines:** 2027
`const pt = t.power != null ? ` ${t.power}/${t.toughness}` : '';` is computed but never used. This is likely a regression where the power/toughness display was removed from the button label but the variable was left behind. It makes the code misleading — readers assume `pt` is used somewhere.
**Action:** Either include `pt` in the button label or delete the variable.

### `map((t, i) => ...)` — unused index parameter `i`
**Severity:** Low
**Lines:** 2026
The `.map()` callback signature includes `i` (the index) which is never referenced inside the callback body. Unused parameters add noise and can mislead readers into thinking the index matters.
**Action:** Remove the unused `i` parameter: `.map(t => ...)`.

### `onclick` wired with inline JSON instead of `data-` attribute + delegated listener
**Severity:** Medium
**Lines:** 2029
The inline `onclick="addToken(${escapeHtml(JSON.stringify(t))})"` pattern is inconsistent with best practices for dynamic list items. The same concern was flagged in the Token Definitions review. The `data-` attribute approach (`data-token-index="${i}"` + a delegated click listener calling `addToken(COMMON_TOKENS[index])`) would be cleaner, more maintainable, and sidestep the escaping issue entirely.
**Action:** Refactor to use `data-token-index` attributes and a delegated listener on `#token-presets`.

### Modal visibility controlled with `.hidden` class — consistent with rest of codebase
**Severity:** Low
**Lines:** 2031, 2036
The token modal uses `classList.add/remove('hidden')` for visibility, which is the correct and consistent pattern. This is a positive finding — no action needed.

### `closeTokenModal` named as an event handler but performs a conditional guard internally
**Severity:** Low
**Lines:** 2034
The function name `closeTokenModal` implies it always closes the modal. In reality it conditionally closes only if the click target is the overlay backdrop. A name like `handleTokenModalOverlayClick` would better reflect the behaviour, while a separate `hideTokenModal()` (recommended in Architecture) would carry the "always closes" semantic.
**Action:** Rename to `onTokenModalOverlayClick` or similar, and extract a `hideTokenModal()` for use as a direct programmatic close.

### Flying indicator uses an emoji plane (`✈`) rather than MTG-appropriate symbol
**Severity:** Low
**Lines:** 2028
The flying keyword is represented as `✈` (airplane emoji). MTG uses a stylised wing symbol which is not in Unicode, so an emoji is a reasonable substitute, but the choice of ✈ (commercial airliner) is incongruous with the game aesthetic. The card focus panel uses the same emoji at line 2028 — at least it is consistent.
**Action:** Low priority cosmetic note. Consider using a text abbreviation (e.g. `(Fly)`) or a custom SVG icon if visual consistency is important.

## Summary
The most impactful pattern issue is the combination of the unused `pt` variable and the inline `onclick` JSON pattern, both of which point to incomplete or regressed implementation. The unused `i` parameter is a trivial cleanup. Visibility toggling and the general structure are consistent with the rest of the codebase.
