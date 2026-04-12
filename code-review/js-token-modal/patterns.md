# Patterns Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Serialising a whole object into an `onclick` string is an anti-pattern
**Severity:** High
**Lines:** 2029
Passing `JSON.stringify(t)` as an inline `onclick` argument is a recognised anti-pattern in modern JS. It is fragile (breaks on special chars), insecure (as detailed in the Security review), and unreadable. Every other interactive button in this file that triggers mutations uses simple function calls with scalar IDs or no arguments at all (e.g., `onclick="ctxAction('tap')"`).
**Action:** Refactor to use `data-*` attributes and `addEventListener` as shown in the Security review. This aligns with the rest of the codebase's approach of keeping complex data in memory and referencing it by index or ID.

### ✈ emoji used as a visual flying indicator — no accessible alternative
**Severity:** Low
**Lines:** 2028
`const fly = t.keywords?.includes('Flying') ? ' ✈' : '';` appends a raw ✈ character to the button label. Screen readers will announce "airplane" rather than "Flying", and the indicator carries no `aria-label` or `title`.
**Action:** Wrap the emoji in a `<span aria-hidden="true" title="Flying">✈</span>` so screen readers skip the decorative character while sighted users still see the indicator.

### `t.power != null` guard inconsistent with the rest of the token data access
**Severity:** Low
**Lines:** 2027
The nullish check `t.power != null` uses loose inequality (catches both `null` and `undefined`). The rest of the file tends to use strict equality (`=== null`) or optional chaining. While the behaviour is correct here, mixing loose and strict null checks reduces readability.
**Action:** Standardise on `t.power !== null && t.power !== undefined` or use optional chaining / nullish coalescing consistently: `const pt = t.power != null ? \` \${t.power}/\${t.toughness}\` : '';` is acceptable, but add a comment if this loose check is intentional.

### Hard-coded `'Flying'` keyword string
**Severity:** Low
**Lines:** 2028
The string `'Flying'` is referenced directly. If the keyword representation in `COMMON_TOKENS` ever changes casing or spelling (e.g., from a future API), this silently stops working.
**Action:** Define a constant (e.g., `const KW_FLYING = 'Flying';`) near `COMMON_TOKENS` and reference it here. Alternatively, add a comment noting the expected format.

### No section comment for `closeTokenModal`
**Severity:** Low
**Lines:** 2034
`showTokenModal()` is clearly grouped under `// === TOKEN MODAL ===`, but `closeTokenModal()` appears immediately after with no comment. This is consistent with the rest of the file's style, so no change is strictly needed, but adding a brief comment (`// closes on overlay click`) would clarify the guard logic for future readers.
**Action:** Optional — add a one-line comment above or inside `closeTokenModal` describing the click-outside-to-close pattern.

## Summary
The dominant pattern issue is the use of `JSON.stringify` inside an `onclick` attribute, which goes against the grain of both this codebase's conventions and general best practices. The remaining findings are minor readability and accessibility concerns. Refactoring the preset buttons to use `data-token-index` and event listeners would resolve the most significant pattern violation.
