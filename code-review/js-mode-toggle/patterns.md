# Patterns Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### Magic string `'play'` compared without a constant
**Severity:** Low
**Lines:** 1532–1540
The string `'play'` is used as the canonical mode identifier and compared inline with `mode === 'play'`. If a second mode is ever added (e.g. `'spectate'`), all comparisons must be updated manually. A `MODE` constant object would make the comparison explicit and typo-safe.
**Action:** Define `const MODE = { PREPARE: 'prepare', PLAY: 'play' }` and replace string literals.

### Inline `style.display` assignment alongside class-based visibility
**Severity:** Low
**Lines:** 1536–1537
`stats-panel` and `hand-panel` visibility is toggled via `style.display`, while `play-area` and `.layout` use CSS class toggling (`classList.toggle`). This inconsistency mixes two visibility strategies. If a CSS rule later targets `display` for those panels, the inline style will take precedence and break it.
**Action:** Prefer class toggling (`classList.toggle('hidden', isPlay)`) over inline style assignment for consistency.

### No comment explaining the mode string contract
**Severity:** Low
**Lines:** 1531–1541
The function accepts any string for `mode` but only `'play'` has special behavior. Passing any other string silently produces "prepare" state. This implicit contract is not documented.
**Action:** Add a JSDoc comment: `@param {'prepare'|'play'} mode`.

## Summary
The mode toggle section uses inconsistent visibility strategies (inline `style.display` vs CSS class toggling) and relies on magic string comparisons. These are minor pattern issues that would benefit from a mode constant and uniform class-based visibility management.
