# Code & Pattern Review — js-token-definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Inconsistent whitespace padding in property values
**Severity:** Low
**Lines:** 1648–1661
Some token names are padded with trailing spaces for visual alignment (e.g., `'1/1 Soldier'   ` vs `'1/1 Goblin'`). While visually tidy, this relies on editor alignment that can break with reformatting and makes string comparisons fragile if the name includes trailing spaces.
**Action:** Remove trailing spaces from string values. Use consistent indentation in the object properties instead of value padding for alignment.

### Missing entries for common Commander tokens
**Severity:** Low
**Lines:** 1647–1662
Notable common Commander tokens are absent: `2/2 Knight (W)`, `1/1 Bird (W, Flying)`, `1/1 Elf Warrior (G)`, `3/3 Elephant (G)`, `1/1 Human (W)`. The list is a reasonable starting set but is not comprehensive.
**Action:** Consider expanding the list or documenting that it is intentionally a minimal preset. No code change required if the current scope is intentional.

### `colors: []` for artifact tokens is ambiguous
**Severity:** Low
**Lines:** 1658–1661
Artifact tokens use `colors: []` to indicate colorless. This is correct, but the empty array is not documented. A future maintainer might add a color by mistake, thinking it is an unset default.
**Action:** Add a brief comment on colorless artifact entries: `// colorless`.

## Summary
The token array is clean and readable. The main pattern issues are minor: trailing whitespace padding in string values and a small set of undocumented conventions (empty colors array, null power/toughness). A brief schema comment above the array would address most concerns.
