# Code & Pattern Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` chained replaces are less efficient than a single regex
**Severity:** Low
**Lines:** 2143
`String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')` performs three sequential regex replacements on the string. A single regex with a character class and a replacer function would be marginally more efficient for large strings.
**Action:** Low priority optimization. For the string sizes in this app, no change needed.

### `escapeQuotes` replaces `"` with `&quot;` but this is only safe in HTML attribute context
**Severity:** Medium
**Lines:** 2146
The `&quot;` substitution makes sense in an HTML attribute context but is misleading. If the output of `escapeQuotes` is used in a pure JS string context (not HTML), the entity `&quot;` would appear literally in the string rather than as a double quote. Callers must understand the distinction.
**Action:** Rename to `escapeForHtmlAttr` and document its specific intended context. Better yet, eliminate its use in favor of data attributes (see security review).

### `showToast` magic number `3000` for auto-dismiss delay
**Severity:** Low
**Lines:** 2155
`setTimeout(() => ..., 3000)` uses a hardcoded 3-second delay.
**Action:** Define `const TOAST_DURATION_MS = 3000;` for clarity.

### `formatManaCostShort` is defined in the play-state block (line 1642) not here
**Severity:** Low
**Lines:** 2141–2156 (segment boundary)
The segment description lists `formatManaCostShort` as a utility but it appears earlier in the file at line 1642. This is a file organization inconsistency.
**Action:** Move `formatManaCostShort` to this utilities section to co-locate all pure string/format helpers.

## Summary
The most impactful pattern finding is the misleading name of `escapeQuotes` — its `&quot;` substitution only makes sense in an HTML context, which should be documented or eliminated. The magic timeout number and `formatManaCostShort` misplacement are minor cleanup items.
