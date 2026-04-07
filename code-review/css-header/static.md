# Static Code Review — Header
Lines: 37–65 | File: public/mtg-commander.html

## Findings

### Hardcoded RGBA values duplicate CSS variables
**Severity:** Low
**Lines:** 39–40
`rgba(201,168,76,0.15)` and `rgba(201,168,76,0.3)` are manual expansions of `--gold` (#c9a84c). Similarly `rgba(74,144,217,0.1)` expands `--blue`. If those variables change, the header gradient won't follow.
**Action:** Use `color-mix()` or document as a known exception. At minimum add a comment: `/* --gold at 15% / --blue at 10% */`.

### `-webkit-background-clip` without standard property
**Severity:** Low
**Lines:** 61
Only the `-webkit-` prefixed form of `background-clip: text` is present. The unprefixed `background-clip: text` should also be included for standards compliance and future-proofing.
**Action:** Add `background-clip: text;` alongside `-webkit-background-clip: text;`.

### `-webkit-text-fill-color` without fallback
**Severity:** Low
**Lines:** 62, 65
`-webkit-text-fill-color: transparent` has no `color: transparent` fallback. In non-WebKit browsers the gradient clip won't render and the text will show in the inherited colour without the gradient effect, which may be acceptable, but should be intentional.
**Action:** Add `color: transparent;` as a fallback before the `-webkit-` rule, or document the intentional browser support scope.

## Summary
Mostly clean. Three low-severity issues around hardcoded colour values that bypass CSS variables, and missing standard (non-prefixed) counterparts to webkit-specific properties.
