# Architecture Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectBFCard` and `selectHandCard` duplicate focus panel population logic
**Severity:** Medium
**Lines:** 1935–1942 (selectBFCard), 1972–1981 (selectHandCard)
Both functions repeat identical logic to populate the focus panel: getting the image, setting `src`/`display` on `focus-img`, setting `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`. This is ~8 lines duplicated across two functions.
**Action:** Extract a `populateFocusPanel(card)` helper that handles the common DOM population, then call it from both `selectBFCard` and `selectHandCard`.

### Focus panel state mutation mixed with DOM rendering
**Severity:** Low
**Lines:** 1933, 1959–1960, 1969–1970
State mutation (`selectedBFId`, `selectedHandIdx`) is interleaved with DOM updates within the same functions. While acceptable in a single-file vanilla JS app, it makes it harder to reason about state transitions.
**Action:** As a future improvement, group all state mutations at the top of each function before any DOM operations.

### `closeFocusPanel` triggers a `renderBattlefield()` call — coupling concern
**Severity:** Low
**Lines:** 1962
`closeFocusPanel()` calls `renderBattlefield()` to deselect the card highlight, tightly coupling the panel close logic to the battlefield render. If the selected card visual is managed via CSS and a re-render, this coupling is necessary; but it means closing the panel always causes a full battlefield re-render even when no state changed.
**Action:** Consider managing the selection highlight with a CSS class toggle on the specific card element rather than a full re-render, to avoid unnecessary DOM updates.

### `selectBFCard` calls `renderBattlefield()` at the end — potentially redundant
**Severity:** Low
**Lines:** 1955
`renderBattlefield()` is called at the end of `selectBFCard()` to update the selected card's visual state. This re-renders all cards just to add/remove a CSS class.
**Action:** Same as above — use a targeted CSS class toggle on the previously and newly selected card elements instead of a full re-render.

## Summary
The primary architectural issue is duplicated panel population logic in `selectBFCard` and `selectHandCard`. Extracting a shared `populateFocusPanel(card)` helper would reduce ~16 lines of duplication and make future changes to the panel easier. The re-render-on-select pattern is a minor inefficiency.
