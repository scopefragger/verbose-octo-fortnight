# Code & Pattern Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### Magic string `'play'` repeated across the codebase
**Severity:** Low
**Lines:** 1533
The mode identifier `'play'` is a plain string literal with no constant backing it. Any typo at a call site (e.g., `setMode('Play')`) silently falls back to prepare mode with no error.
**Action:** Define `const MODE_PLAY = 'play'` and `const MODE_PREPARE = 'prepare'` at the top of the script and reference them wherever `setMode` is called.

### Inline style override rather than CSS class
**Severity:** Low
**Lines:** 1536–1537
`stats-panel` and `hand-panel` are hidden/shown via `element.style.display = isPlay ? 'none' : ''`. This mixes inline style logic into JavaScript rather than using a CSS class (e.g., `.hidden`). Resetting to `''` relies on the browser default rather than an explicit value.
**Action:** Add a utility CSS class `.panel-hidden { display: none !important; }` and use `classList.toggle('panel-hidden', isPlay)` instead.

### `toggleSidebar` is effectively dead (one-way)
**Severity:** Low
**Lines:** 1543–1545
As noted in the static review, `toggleSidebar` only removes the class. The function body contains a single line that never adds the class back, making the "toggle" framing misleading in code review and documentation.
**Action:** Fix the implementation or rename it for clarity.

## Summary
The section is clean and brief. The main pattern concerns are magic mode strings, inline style manipulation instead of CSS class toggling, and the misleading `toggleSidebar` name. All three are low-effort fixes that would improve consistency with the rest of the file.
