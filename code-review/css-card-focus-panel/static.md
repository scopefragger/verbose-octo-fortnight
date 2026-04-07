# Static Review — Card Focus Panel
Lines: 660–695 | File: public/mtg-commander.html

## Findings

### CSS custom property references assume global availability
**Severity:** Low
**Lines:** 664, 678, 679, 680, 684, 685, 688, 689, 691, 692, 693
Uses `var(--gold)`, `var(--text)`, `var(--text-dim)`, `var(--gold-light)`, `var(--card-border)`, `var(--red)` without any fallback values. If any of these custom properties are missing or misspelled in the `:root` declaration, the element will silently render with no value (typically transparent or inherited).
**Action:** Add fallback values to each `var()` call, e.g. `var(--gold, #c9a84c)`, or add a lint step to verify all referenced tokens are defined.

### `.card-focus-oracle` scroll container has no accessibility label
**Severity:** Low
**Lines:** 681
The scrollable oracle text box (`overflow-y: auto`) has no associated ARIA role or label in the CSS contract. Scrollable regions should be reachable by keyboard and labelled for screen readers.
**Action:** In the HTML that uses `.card-focus-oracle`, ensure `tabindex="0"` and `aria-label="Oracle text"` are present on the element.

## Summary
The section is well-scoped pure CSS with no dead rules and correct class naming. The only static concerns are the lack of `var()` fallbacks — a defensive gap that could cause silent rendering failures if a token is ever renamed — and a note that the scrollable oracle container needs complementary HTML attributes for accessibility.
