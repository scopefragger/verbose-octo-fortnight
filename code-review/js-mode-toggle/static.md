# Static Review — js-mode-toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `toggleSidebar` does not toggle — it only shows
**Severity:** Medium
**Lines:** 1543–1545
The function is named `toggleSidebar` but only calls `classList.remove('sidebar-collapsed')`, meaning it can only *open* the sidebar, never close it. A true toggle would call `classList.toggle('sidebar-collapsed')`. Any caller expecting bidirectional toggling will be silently wrong.
**Action:** Rename to `showSidebar()` / `openSidebar()` to match actual behaviour, or implement a real toggle with `classList.toggle`.

### No validation on `mode` parameter
**Severity:** Low
**Lines:** 1532–1533
`setMode(mode)` computes `isPlay = mode === 'play'` — any string other than `'play'` silently acts as prepare mode, including typos like `setMode('prepare ')`. There is no guard or warning.
**Action:** Add an early guard: `if (mode !== 'play' && mode !== 'prepare') return;` (or use a constant/enum).

### Global variables `playLibrary` and `deckLoaded` assumed to exist
**Severity:** Low
**Lines:** 1540
`playLibrary.length` and `deckLoaded` are referenced but not declared in this section — they live in the play-state block. If either is undefined at call time (e.g., if `setMode` is invoked before the play-state section initialises), this will throw a ReferenceError.
**Action:** Confirm both variables are hoisted at the top of the script before any possible call to `setMode`, or add a defensive `typeof` guard.

## Summary
Small section with one real behavioural bug: `toggleSidebar` is misnamed and only opens the sidebar. The rest of the findings are minor defensive-programming gaps.
