# Patterns Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Hybrid mana silently collapsed to generic without comment
**Severity:** Low
**Lines:** 1588
`if (v.includes('/')) result.generic++;` handles hybrid mana symbols (e.g. `{W/U}`) by treating them as generic. This is a simplification that could mislead: hybrid mana can be paid with either colour. The lack of a comment leaves the intent ambiguous.
**Action:** Add a comment: `// Hybrid mana simplified to generic — player must judge colour manually`.

### Inline style strings duplicated across render output
**Severity:** Low
**Lines:** 1630
`style="color:${MANA_COLOR_STYLES[c]};font-weight:700"` is constructed inline in a `.map()`. The `font-weight:700` is a magic inline style that may conflict with or duplicate a CSS class.
**Action:** Define a CSS class (e.g. `.mana-pip`) that sets `font-weight: 700`, and apply it via `className` rather than an inline style, keeping colour as the only inline override.

### `MANA_COLOR_STYLES` object uses a slightly different key order than `MANA_COLORS` array
**Severity:** Low
**Lines:** 1560–1561
`MANA_COLORS = ['W','U','B','R','G','C']` and `MANA_COLOR_STYLES = { W, U, B, R, G, C }` are consistent, which is good. However, `spendMana`'s drain order `['C','G','R','B','U','W']` (line 1614) uses a reversed priority that is not explained.
**Action:** Add a comment explaining the drain order rationale (e.g. "drain colourless first, then least-flexible colours last").

### Empty mana pool uses an em-dash character in HTML
**Severity:** Low
**Lines:** 1626
`'<span style="color:var(--text-dim)">—</span>'` uses a literal em-dash. While this is fine in UTF-8, using the HTML entity `&mdash;` is more explicit and avoids encoding issues if the file's charset declaration changes.
**Action:** Replace `—` with `&mdash;` for robustness.

## Summary
This section follows reasonable patterns for a single-file vanilla JS app. The main pattern improvements are adding comments for non-obvious design decisions (hybrid mana, drain order) and replacing the inline `font-weight` style with a CSS class.
