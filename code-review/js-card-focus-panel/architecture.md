# Architecture Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectBFCard` and `selectHandCard` duplicate panel-population logic
**Severity:** Medium
**Lines:** 1937–1942, 1976–1981
Both functions set the same five focus-panel DOM fields (`focus-img`, `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`) using identical logic. The only differences are the source (`bfc.card` vs `card`) and the action buttons rendered.
**Action:** Extract a shared `populateFocusPanel(card)` helper that sets the common fields, and call it from both functions. Each function then only appends its specific action buttons.

### Selection state mutation and DOM render are interleaved
**Severity:** Medium
**Lines:** 1933, 1969–1970
State mutations (`selectedBFId = id`, `selectedHandIdx = idx`, `selectedBFId = null`) are mixed directly with DOM manipulation. This makes it harder to understand the state transition in isolation and violates the render/mutate separation pattern.
**Action:** Separate the state update step from the DOM render step. Ideally, state changes happen first and a `renderFocusPanel()` function reads from state and produces DOM output.

### `closeFocusPanel()` owns both hand and battlefield selection state
**Severity:** Low
**Lines:** 1958–1963
`closeFocusPanel()` resets both `selectedBFId` and `selectedHandIdx`. This is a single function managing two orthogonal selection concerns. If the two selection types are ever decoupled, this function would need to split.
**Action:** Consider separate clear functions (`clearBFSelection()`, `clearHandSelection()`) invoked by `closeFocusPanel()`, or document clearly that it resets both states intentionally.

### `renderBattlefield()` called from focus panel selection/close
**Severity:** Low
**Lines:** 1955, 1962
`selectBFCard()` and `closeFocusPanel()` call `renderBattlefield()`. This means the focus panel is tightly coupled to the battlefield render. If the panel is shown for a hand card, the battlefield still re-renders unnecessarily.
**Action:** Only call `renderBattlefield()` when the battlefield state has actually changed (e.g. after `tapCard`). Remove the unconditional call from panel open/close, or conditionally guard it based on whether a battlefield card was involved.

## Summary
The section mixes state mutation and DOM rendering, and duplicates panel-population logic between two selection functions. Extracting a shared `populateFocusPanel()` helper and separating state mutation from rendering would improve clarity and maintainability significantly.
