# Static Code Review — Import Tab
Lines: 145–256 | File: public/mtg-commander.html

## Findings

### Hardcoded hex color in `.ac-dropdown` not using CSS variable
**Severity:** Low
**Lines:** 185
The background of the autocomplete dropdown is set to the literal `#1a1530` rather than a CSS variable. Every other interactive element in this section references `var(--card)`, `var(--card-border)`, `var(--gold)`, etc. This hardcoded value will silently diverge if a theme variable is ever updated.
**Action:** Replace `background: #1a1530` with `background: var(--card)` (or introduce a `--dropdown-bg` variable) to keep colour management in one place.

### `escapeQuotes` does not guard against backticks or template literal injection
**Severity:** Medium
**Lines:** 2118, 2145–2146 (companion to CSS; the HTML it generates is directly relevant)
The `escapeQuotes` utility escapes single-quotes and double-quotes but does not escape backticks. The escaped values are inserted into an inline `onclick` attribute string built with double-quoted outer delimiters and single-quoted inner values. If a Scryfall card name ever contained a backtick (currently none do, but the function is used as a general guard), the escaping logic would not prevent it from breaking out of a template context. Additionally, the function converts `"` to `&quot;` — correct for HTML attribute values — but leaves `\` unescaped, so a name containing `\` followed by a `'` would produce `\\'` which collapses back to `\'` at parse time and leaves a stray `\`.
**Action:** Extend `escapeQuotes` to also replace `\` before replacing `'`, and consider escaping backticks. Better long-term: move the click handler to a `data-*` attribute and attach via `addEventListener` so no string escaping is needed in the onclick path at all.

### `deckLoaded` variable referenced in `importDecklist` but not declared in the reviewed segment
**Severity:** Low
**Lines:** 1161 (companion JS)
`deckLoaded = true` is set inside `importDecklist()` without a `const`/`let`/`var` declaration visible in this segment. If the variable is not declared in the global state block (lines 1032–1037), it becomes an implicit global. This is a missing-declaration risk that should be verified.
**Action:** Confirm `deckLoaded` is declared at the top-level state block; if not, add an explicit `let deckLoaded = false;` there.

## Summary
The segment is predominantly CSS and is largely well-structured. The main static issues are a lone hardcoded colour that bypasses the variable system, and a small but real gap in the `escapeQuotes` helper (backslash not escaped before single-quote) that the companion autocomplete JS relies on. The `deckLoaded` implicit-global risk is low but worth confirming.
