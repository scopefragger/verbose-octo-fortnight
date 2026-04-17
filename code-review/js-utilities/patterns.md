# Patterns Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` and `escapeQuotes` are named for mechanism, not context
**Severity:** Low
**Lines:** 2142, 2145
The function names describe *what* they escape (HTML characters; quotes) rather than *where* the output is safe to use. This has led to misuse throughout the file: `escapeHtml` is used for JSON-in-onclick (wrong tool), and `escapeQuotes` is used for JS-string-in-onclick (correct tool, but incomplete as noted in Security).
**Action:** Consider renaming: `escapeHtml` → `escapeForHtml` (or `escapeHtmlContent`), `escapeQuotes` → `escapeForJsString`. Add a one-line comment after each function indicating its safe usage context.

### `showToast` duration `3000` is a magic number
**Severity:** Low
**Lines:** 2155
The toast display duration of `3000` milliseconds is hard-coded with no named constant.
**Action:** Extract to a constant: `const TOAST_DURATION_MS = 3000;` and reference it in the `setTimeout` call.

### Toast CSS classes `'toast show'` and `'toast'` are magic strings
**Severity:** Low
**Lines:** 2153, 2155
The CSS class transitions `'toast show'`, `'toast show error'`, and `'toast'` are assembled as string concatenations. If a CSS class name changes, all three variations must be found and updated.
**Action:** Define constants: `const TOAST_CLASS = 'toast'; const TOAST_ACTIVE_CLASS = 'toast show'; const TOAST_ERROR_CLASS = 'toast show error';` — or use `classList.add/remove` for individual class tokens, which is less brittle.

### `formatManaCostShort` truncates to 10 characters with no ellipsis
**Severity:** Low
**Lines:** 1644
`manaCost.replace(...).slice(0, 10)` silently truncates the mana cost display to 10 characters. A cost like `{2}{W}{W}{U}{U}` becomes `2WWUU` (5 chars, fine), but a complex cost could be truncated mid-symbol without any visual indication to the user.
**Action:** Add a suffix if truncated: `const s = ...; return s.length > 10 ? s.slice(0, 9) + '…' : s;`. Or document that the limit is intentional and no indication is needed.

### Chain of `.replace()` calls in `escapeHtml` — order-dependent but correct
**Severity:** Low
**Lines:** 2143
The `&` replacement must come first (before `<` and `>`) to avoid double-escaping, since the `<` replacement produces `&lt;` which contains `&`. The current order (`&` first) is correct, but without a comment, a future maintainer might reorder the replacements and introduce a double-escaping bug.
**Action:** Add a comment: `// '&' must be replaced first to avoid double-escaping`.

### No shared `getCardImageUrl` helper — pattern duplicated six-plus times
**Severity:** Medium
**Lines:** 2141–2156 (absence)
The most frequently duplicated expression in the file is the card image URL resolver:
`card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal`
The Utilities section is the natural home for this helper but it does not exist here.
**Action:** Add `getCardImageUrl(card, size = 'normal')` to this section (see Architecture review for the implementation).

## Summary
The utility functions are minimal and broadly correct. The main pattern concerns are the absent `"` escaping in `escapeHtml` (a security-significant pattern gap, detailed in the Security review), the missing `getCardImageUrl` helper that would eliminate significant duplication, and several magic strings/numbers that should be named constants. These are all straightforward to fix with high impact.
