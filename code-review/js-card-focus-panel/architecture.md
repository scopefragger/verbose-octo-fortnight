# Architecture Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Focus panel population duplicated across `selectBFCard` and `selectHandCard`
**Severity:** Medium
**Lines:** 1935–1942, 1972–1981
Both functions perform the identical five-step DOM population sequence (img src, display, name, mana, type, oracle). This is a render concern duplicated in two places. Any future change (e.g. adding a new focus field) must be applied twice.
**Action:** Extract a `renderFocusCard({ img, name, mana_cost, type_line, oracle_text })` helper function. Both `selectBFCard` and `selectHandCard` should call it. This isolates the "render focus panel header" responsibility.

### Selection state mutation mixed with render logic
**Severity:** Medium
**Lines:** 1933, 1959–1960, 1969–1970
`selectBFCard` and `selectHandCard` both mutate global selection state (`selectedBFId`, `selectedHandIdx`) and immediately perform DOM updates. There is no separation between "update state" and "re-render from state". This makes it hard to, e.g., set selection state programmatically without triggering side-effects.
**Action:** Consider separating state mutation from rendering: a `setSelection(type, value)` function updates globals, then calls a `renderFocusPanel()` function that reads state and updates the DOM.

### `closeFocusPanel` calls `renderBattlefield()` but `selectHandCard` does not
**Severity:** Low
**Lines:** 1955, 1962, 1993
`selectBFCard` calls `renderBattlefield()` at line 1955 (to highlight the selected card). `closeFocusPanel` also calls it at line 1962. But `selectHandCard` does not call `renderBattlefield()` even though selecting a hand card might need to clear a previous battlefield highlight (`selectedBFId` is cleared at line 1970).
**Action:** Determine whether `selectHandCard` should also call `renderBattlefield()` to clear the selection highlight, and add it if so. Document the intent either way.

### `closeFocusPanel` is responsible for too many state resets
**Severity:** Low
**Lines:** 1958–1963
`closeFocusPanel` resets both `selectedBFId` and `selectedHandIdx` and then re-renders the battlefield. As more selection types are added, this function will grow into an unrelated catch-all. It also conflates UI closure with state management.
**Action:** Consider a `clearAllSelections()` helper that `closeFocusPanel` delegates to, so selection-clearing logic is reusable independently of panel visibility.

## Summary
The main architectural weakness is the duplication of focus-panel rendering logic between `selectBFCard` and `selectHandCard`, and the mixing of state mutation with DOM updates. Extracting a shared render helper and a state-mutation layer would make both functions shorter and easier to maintain. The asymmetry around `renderBattlefield` calls is a minor but real consistency gap.
