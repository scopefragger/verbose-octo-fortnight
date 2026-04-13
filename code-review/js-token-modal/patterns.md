# Code & Pattern Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Unused variable `i` in `COMMON_TOKENS.map((t, i) => ...)`
**Severity:** Low
**Lines:** 2026
The map index `i` is captured but, in the current broken implementation, not meaningfully used (it's not passed to `addToken`). Once the fix is applied (passing the index instead of the object), `i` becomes the primary argument.
**Action:** After fixing to use index-based lookup, ensure `i` is used: `onclick="addToken(${i})"`.

### Flying indicator uses an airplane emoji as a keyword marker
**Severity:** Low
**Lines:** 2028
`const fly = t.keywords?.includes('Flying') ? ' ✈' : '';` uses `✈` (airplane emoji) as a visual indicator for Flying. This is a cute shorthand but semantically unusual and may not be obvious to all users.
**Action:** No functional issue. If official MTG symbols or a consistent icon library are ever added, update this.

### `COMMON_TOKENS.map` callback is unnamed
**Severity:** Low
**Lines:** 2026–2030
The map callback is an anonymous arrow function. For debugging purposes (stack traces), named functions are slightly preferable for complex renders.
**Action:** Not a high priority for a single-file app. No change required.

### Modal show/hide uses `.classList.remove('hidden')` inconsistently
**Severity:** Low
**Lines:** 2031, 2036
`showTokenModal` removes the `hidden` class to show, and `closeTokenModal` adds it back. This is correct, but other show/hide patterns in this file also use `style.display = 'block/none'`. The inconsistency is minor.
**Action:** Pick one pattern and apply it consistently. Prefer the CSS class approach as it is used here.

## Summary
Minor pattern issues. The most impactful is the unused `i` variable that will become critical once the onclick fix is applied. The flying emoji is a stylistic quirk, not a bug.
