# Static Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `play-hand-count` element updated twice in same render cycle
**Severity:** Low
**Lines:** 1867, 1907
`renderPlayArea()` sets `play-hand-count` on line 1867, and then `renderPlayHand()` (called by `renderPlayArea()`) also sets it on line 1907. This is harmless redundancy but shows that the function at line 1907 does not have a clean single responsibility.
**Action:** Remove the `play-hand-count` update from `renderPlayArea()` (line 1867) since `renderPlayHand()` always handles it; or move it back to `renderPlayArea()` and remove it from `renderPlayHand()`.

### `bfc.card.power` and `bfc.card.toughness` may be unescaped numbers injected into HTML
**Severity:** Medium
**Lines:** 1898
`bfc.card.power` and `bfc.card.toughness` are interpolated directly into the HTML string without escaping. These values come from Scryfall API data and are typically numeric strings (e.g., `"2"`, `"*"`), but could theoretically include unexpected characters.
**Action:** Wrap both values with `escapeHtml()` for defensive correctness: `${escapeHtml(String(bfc.card.power))}/${escapeHtml(String(bfc.card.toughness))}`.

### `bfc.card.type_line` split result may be undefined
**Severity:** Low
**Lines:** 1899
`bfc.card.type_line?.split('—')[1]?.trim()` safely handles missing `type_line`, but the `—` character (em-dash) must exactly match the Scryfall API response. If the separator differs (e.g., a regular hyphen in some tokens), the fallback `'Token'` is silently used without any indication.
**Action:** Log or document that `—` is the expected Scryfall separator; add a comment for clarity.

### `typeof selectedBFId !== 'undefined'` guard is unnecessary
**Severity:** Low
**Lines:** 1887
`selectedBFId` is declared at the module level (line 1556) with `let selectedBFId = null;`, so it is always defined. The `typeof` guard is dead code.
**Action:** Simplify to `selectedBFId === bfc.id` without the `typeof` check.

### Inline cost display style string contains magic colour values
**Severity:** Low
**Lines:** 1920
The mana cost affordability indicator uses hard-coded hex colours (`#e8d870` for affordable, `#e05555` for not affordable) inside a template literal inline style. These are not referenced from CSS variables.
**Action:** Extract to CSS classes (e.g., `.cost-affordable` / `.cost-unaffordable`) or use `var(--color-gold)` / `var(--color-red)` if those variables exist.

## Summary
The section is generally functional and readable. The main concerns are a double-update of a DOM element, unescaped token stats from the API, and several minor code quality issues (dead guard, magic colour values). No logic bugs were found.
