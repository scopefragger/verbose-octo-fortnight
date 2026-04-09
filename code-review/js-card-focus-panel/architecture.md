# Architecture Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectBFCard` and `selectHandCard` duplicate panel-population logic
**Severity:** Medium
**Lines:** 1926–1994
Both `selectBFCard` and `selectHandCard` independently populate the focus panel: they both set `focus-img`, `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`, and toggle `card-focus-panel` visibility. The only difference is the action buttons. This is ~10 lines of duplicated DOM manipulation that must stay in sync if the panel's structure changes.
**Action:** Extract a `populateFocusPanel(card, actionsHTML)` helper that sets the common fields, then call it from both `selectBFCard` and `selectHandCard` with their respective action HTML.

### Focus panel state is split across DOM and JS variables
**Severity:** Low
**Lines:** 1926–1994
The "currently focused card" state is tracked through two JS variables (`selectedBFId`, `selectedHandIdx`) and through the `card-focus-panel.visible` CSS class. These three state indicators must remain consistent. If any one is set without the others, the UI will be inconsistent (e.g., panel visible but no selection variable set).
**Action:** Encapsulate focus panel state in a single object (e.g. `focusState = { type: null, id: null }`) with dedicated open/close functions.

### Action buttons are generated as innerHTML strings — mixes template and logic
**Severity:** Low
**Lines:** 1946–1952, 1986–1991
The action button HTML is built as a template string inside `selectBFCard` and `selectHandCard`. This mixes the rendering decision (which actions are available) with the HTML generation. If the button styles change, both functions must be updated.
**Action:** Extract action-set definitions as data (e.g. `bfActions`, `handActions`) and render them through a shared `renderFocusActions(actions)` helper.

## Summary
The card focus panel has significant logic duplication between `selectBFCard` and `selectHandCard`. Both functions independently populate the same DOM fields and would both need updating if the panel structure changes. A shared `populateFocusPanel` helper would eliminate this duplication.
