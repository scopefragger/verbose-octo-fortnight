# Architecture Review — js-card-focus-panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectBFCard` and `selectHandCard` duplicate panel population logic
**Severity:** Medium
**Lines:** 1935–1942, 1972–1981
Both `selectBFCard` and `selectHandCard` contain identical code to populate the focus panel image, name, mana cost, type line, and oracle text. The only difference is the action buttons rendered at the bottom. This is ~10 lines of duplicated DOM manipulation.
**Action:** Extract the shared panel population into a helper function `populateFocusPanel(card)`, then call it from both `selectBFCard` and `selectHandCard`, with each function only responsible for generating its own action buttons.

### Panel visibility management is distributed across three functions
**Severity:** Low
**Lines:** 1954, 1961, 1993
The focus panel's `visible` class is added in `selectBFCard` (line 1954), removed in `closeFocusPanel` (line 1961), and added again in `selectHandCard` (line 1993). Panel show/hide is a UI state concern that could be centralised.
**Action:** Create a `showFocusPanel()` / `hideFocusPanel()` pair and call them from the respective functions.

### Game logic (`canAfford`) computed in panel selection
**Severity:** Low
**Lines:** 1974
`selectHandCard` computes `canAfford(card.mana_cost)` to determine button styling. This is game logic embedded in a UI selection function.
**Action:** Pre-compute affordability and store it alongside hand cards, or pass it as a computed value, so the panel selection function only handles display.

## Summary
The most significant architectural issue is the duplication of panel population code between `selectBFCard` and `selectHandCard`. Extracting a shared helper would reduce maintenance burden and the risk of the two code paths diverging.
