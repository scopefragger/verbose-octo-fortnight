# Patterns Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Menu visibility toggled via `style.display` instead of CSS class
**Severity:** Low
**Lines:** 2001, 2009, 2020
The context menu is shown/hidden by directly setting `style.display`. The rest of the UI uses CSS class toggling (e.g., `.visible` class on the focus panel). This inconsistency makes it harder to add transitions or theming.
**Action:** Replace `style.display = 'block'` / `style.display = 'none'` with a CSS class toggle (e.g., `.visible`) to match the pattern used elsewhere in the file.

### Position calculation uses string concatenation with `'px'` suffix
**Severity:** Low
**Lines:** 2004–2005
`x + 'px'` and `y + 'px'` are correct JavaScript for setting pixel styles, but the project could benefit from a utility like `px(n)` or template literals (`\`${x}px\``) for consistency. This is a very minor stylistic observation.
**Action:** No urgent change. Use template literals (`\`${x}px\``) for minor consistency with the rest of the template-literal-heavy codebase.

### Sequential `if` statements without `else if` or early return
**Severity:** Low
**Lines:** 2011–2015
Using separate `if` checks (rather than `else if`) means all five conditions are evaluated for every call, even after a match is found. For five short conditions this is negligible, but it is inconsistent with typical dispatch patterns.
**Action:** Use `else if` or a `switch` statement so evaluation stops at the first match.

## Summary
The context menu section is clean and compact. The main pattern inconsistency is using `style.display` instead of CSS class toggling as used elsewhere in the file. All other findings are minor stylistic preferences.
