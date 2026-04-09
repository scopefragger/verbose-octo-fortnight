# Patterns Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Unused variable `pt` computed but never interpolated
**Severity:** Low
**Lines:** 2027
`const pt = t.power != null ? \` ${t.power}/${t.toughness}\` : '';` is computed but the variable `pt` is never used in the button label template. The button only shows `${t.name}${fly}`. This is dead code.
**Action:** Either use `pt` in the button label (e.g. `${t.name}${pt}${fly}`) or remove the unused variable.

### Flying indicator uses airplane emoji as a keyword shorthand
**Severity:** Low
**Lines:** 2028
`const fly = t.keywords?.includes('Flying') ? ' ✈' : '';` uses a plane emoji as a flying indicator. This is a creative shorthand but not self-documenting. A text label like `' (Flying)'` or a dedicated CSS class with an icon would be more accessible.
**Action:** Consider `' [Flying]'` or an accessible icon with `aria-label="Flying"` instead of a bare emoji.

### Button label omits power/toughness for creature tokens
**Severity:** Low
**Lines:** 2027–2029
As noted above, `pt` is computed but not used. Token preset buttons for creature tokens would be more informative with their P/T shown (e.g. "1/1 Soldier" is already in the name, but custom tokens would benefit). Given that the token name already encodes P/T (e.g. `'1/1 Soldier'`), this is not critical.
**Action:** No action required given current naming convention, but remove the unused `pt` variable.

## Summary
The token modal patterns section has one clear dead code issue (`pt` computed but unused) and a minor accessibility concern with emoji used as keywords. The overall pattern (preset buttons rendered from a constant array) is clean and consistent.
