# Architecture Review — Play Area
Lines: 898–963 | File: public/mtg-commander.html

## Findings

### Complex event delegation logic in battlefield onclick
**Severity:** Medium
**Lines:** 923
The battlefield div contains nested zone containers (`.bf-zone`, `.bf-zone-cards`) and uses a complex inline onclick conditional to detect clicks on empty space vs. card elements. This mixes UI structure concerns with event handling logic.

**Action:** Extract to a named handler function `closeFocusOnBattlefieldBackground(e)` that reads cleaner and is easier to test. Consider using event delegation with `data-close-on-click` attributes instead of class name checks.

### Focus panel state management scattered across functions
**Severity:** Medium
**Lines:** 935–949, 1958–1963
The card-focus-panel is hidden/shown and its content dynamically set from multiple locations: `selectBFCard()`, `selectHandCard()`, `closeFocusPanel()`, and `showCtxMenu()`. The state (which card is selected) is tracked via global variables (`selectedBFId`, `selectedHandIdx`), making it hard to understand the full lifecycle.

**Action:** Consider a dedicated state object or module to manage focus panel visibility and content. Document the render flow (which functions call `renderBattlefield()` and update the focus panel).

### Lifecycle dependency on initialization
**Severity:** Low
**Lines:** 898–963
The play-area section assumes the game has been initialized (`playHand`, `playLibrary`, etc. are populated). If a user interacts with buttons before calling `startGame()`, the behavior is undefined.

**Action:** Add guards to all button handlers or disable the play-controls until `deckLoaded && startGame()` has been called. Currently `startGame()` checks `if (!deckLoaded)` but nothing prevents clicking other buttons.

### Repetition of mana pool display logic
**Severity:** Low
**Lines:** 910–913
The mana pool display is hardcoded in HTML with inline styles. The actual rendering happens elsewhere (`updateManaPoolDisplay()` or similar). This is a UI skeleton that gets hydrated by JavaScript.

**Action:** Consider documenting which JS functions populate each container in a comment block at the top of the play-area section (e.g., "Rendered by renderPlayArea()").

## Summary
The section's architecture is reasonable for a monolithic HTML file but shows signs of scattered state management. The event delegation pattern should be simplified, and initialization dependencies should be made explicit.
