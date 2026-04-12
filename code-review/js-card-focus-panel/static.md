# Static Code Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Repeated `getElementById` calls on the same elements
**Severity:** Low
**Lines:** 1937–1942, 1976–1981
Both `selectBFCard()` and `selectHandCard()` call `document.getElementById` for `focus-img`, `focus-name`, `focus-mana`, `focus-type`, and `focus-oracle` individually. Each call triggers a DOM lookup with no null guard.
**Action:** Cache these elements at init time (or at the top of each function into local variables) and add a guard in case the panel element is missing from the DOM.

### `playDisabledStyle` and `playTitle` are misleading variable names
**Severity:** Low
**Lines:** 1984–1985
`playDisabledStyle` holds an opacity string but does not actually disable the button — the button is still fully clickable when mana is insufficient. The variable name implies it sets a `disabled` attribute, which it does not.
**Action:** Rename to `playOpacityStyle` to reflect its actual effect, or replace the inline style with a `disabled` attribute and `pointer-events: none` CSS to properly prevent the action.

### No guard on `playHand[idx]` array bounds
**Severity:** Low
**Lines:** 1966
`selectHandCard(idx)` guards with `if (!card) return` which handles out-of-bounds and undefined. However, negative indices are not guarded — `playHand[-1]` returns `undefined` in JS so it is caught, but negative idx values should be considered invalid.
**Action:** Add `if (idx < 0 || idx >= playHand.length) return;` before the lookup for clarity and robustness.

### `closeFocusPanel()` calls `renderBattlefield()` unconditionally
**Severity:** Low
**Lines:** 1958–1963
`closeFocusPanel()` always calls `renderBattlefield()`. If called when not in play mode (e.g. from a hand-card action while in a different view), this may trigger an unnecessary or incorrect render.
**Action:** Guard the `renderBattlefield()` call, or confirm that it is safe to call in all states.

## Summary
The section is functionally straightforward with good null guards on card lookups. The main static concerns are repeated uncached DOM lookups, a misleadingly named variable that doesn't properly disable a button, and unconditional `renderBattlefield()` calls. No crashes or undefined-variable risks were identified.
