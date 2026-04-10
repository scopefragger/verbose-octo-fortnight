# Code & Pattern Review — js-mode-toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### Magic string `'play'` and `'prepare'` used without constants
**Severity:** Low
**Lines:** 1532–1541
The mode strings `'play'` and `'prepare'` are magic strings used directly in comparisons. If these strings change or are referenced elsewhere, there is no single source of truth.
**Action:** Define `const MODE_PLAY = 'play'; const MODE_PREPARE = 'prepare';` at the top of the script and use those constants throughout.

### Inline `style.display` manipulation alongside class-based visibility
**Severity:** Low
**Lines:** 1536–1537
`stats-panel` and `hand-panel` are hidden via `style.display = isPlay ? 'none' : ''`, while other elements use `classList.toggle('active', ...)`. Mixing direct style manipulation with class toggling creates inconsistency — the display state of those two elements is not visible in the CSS classes and is harder to inspect or override.
**Action:** Add an `.hidden` CSS class and use `classList.toggle('hidden', isPlay)` for consistency with the pattern used for other elements.

### `toggleSidebar` naming is misleading
**Severity:** Low
**Lines:** 1543–1545
As noted in static review, the function name implies a toggle but behaviour is one-directional. This violates the principle of least surprise for anyone reading call sites.
**Action:** Rename to `openSidebar()` or implement a true toggle.

## Summary
The section is small and consistent with most of the surrounding code, but uses two different patterns for hiding elements (inline style vs. class toggle) and relies on undocumented magic strings for mode names.
