# Patterns Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Embedding JSON in onclick attributes is an anti-pattern
**Severity:** High
**Lines:** 2029
Using `JSON.stringify(t)` to pass data through an onclick attribute is a well-known anti-pattern. It is fragile (special characters break the attribute), security-sensitive (requires careful escaping), and makes the HTML hard to read. The idiomatic alternative is to use data attributes or array indices.
**Action:** Replace `onclick="addToken(${escapeHtml(JSON.stringify(t))})"` with `onclick="addToken(COMMON_TOKENS[${i}])"` since `COMMON_TOKENS` is a global constant accessible from the onclick handler context.

### `t.keywords?.includes('Flying')` — only Flying is checked for preset indicators
**Severity:** Low
**Lines:** 2028
The preset button display only checks for the Flying keyword and represents it with ` ✈`. Other keywords (e.g. Deathtouch, Lifelink, Trample) that could be in `COMMON_TOKENS` are not displayed. Currently only Flying tokens exist in the preset array, but if new keywords are added, the indicator won't update.
**Action:** Either display all keywords as abbreviated indicators, or expand the keyword check to cover other common keywords. Add a comment noting the limitation: `// Only Flying is shown in preset button labels`.

### `const pt = t.power != null ? ... : ''` — unused variable
**Severity:** Low
**Lines:** 2027
`pt` (the power/toughness string) is computed but never used in the rendered button label — only `t.name` and `fly` appear. The variable is dead code.
**Action:** Remove `pt` or incorporate it into the button label display (e.g. show `1/1 Soldier (1/1)` with the stat appended, though `t.name` already encodes this for current tokens).

### Hardcoded string `'hidden'` for modal class toggle
**Severity:** Low
**Lines:** 2031, 2036
The class name `'hidden'` is used as a magic string to toggle modal visibility. This pattern is used consistently across the file but is worth noting — if the class name changes in CSS, all JS toggle calls must be updated.
**Action:** Accept the current pattern (consistent with rest of file). Consider a CSS custom property or a named constant if maintaining multiple modal components becomes error-prone.

## Summary
The dominant pattern issue is the embedded-JSON-in-onclick anti-pattern, which is also the root cause of the functional bug identified in the static review. The dead `pt` variable should be removed. All other pattern issues are minor.
