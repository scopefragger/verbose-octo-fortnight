# Code & Pattern Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### Magic string `'play'` used in comparisons
**Severity:** Low
**Lines:** 1533, 1540
The mode value `'play'` is a magic string. If a third mode were added, or if `'play'` were renamed, the condition `mode === 'play'` and the `setMode('play')` call sites would need to be found and updated manually.
**Action:** Define a `MODES` constant (`const MODES = { PREPARE: 'prepare', PLAY: 'play' };`) and reference `MODES.PLAY` throughout.

### Inline style mutation mixed with classList manipulation
**Severity:** Low
**Lines:** 1536–1537
Two elements use `style.display` toggling while others use `classList.toggle`. Mixing these two approaches for visibility creates inconsistency — `display` style overrides will conflict with CSS-class-driven visibility if the CSS is ever refactored.
**Action:** Replace `style.display` assignments with CSS class toggling (e.g., a `hidden` class) for consistency.

## Summary
The segment is concise but uses magic strings and inconsistent visibility-toggling patterns (style.display vs classList). These are minor issues with low immediate impact.
