# Static Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `playLibrary` used before its declaration
**Severity:** Medium
**Lines:** 1540
`setMode()` references `playLibrary` (line 1540) but `playLibrary` is declared with `let` at line 1548 — seven lines later in the same script. Because `let` is not hoisted to a value, calling `setMode('play')` before the interpreter reaches line 1548 would throw a `ReferenceError`. In practice this only works because the function is not invoked until user interaction, but the ordering creates a fragile temporal dependency.
**Action:** Move the `playLibrary` (and companion play-state) declarations above `setMode()`, or move `setMode()` after all play-state variables are declared.

### `toggleSidebar()` only ever removes the class — it cannot re-collapse
**Severity:** Low
**Lines:** 1543–1545
The function is named `toggle…` but its body unconditionally calls `.classList.remove('sidebar-collapsed')`. It can never collapse the sidebar again. The button tooltip says "Show deck panel" (line 899), so the intent is expand-only, but the misleading name will confuse future maintainers.
**Action:** Rename to `showSidebar()` / `expandSidebar()` to accurately reflect the one-directional behaviour, or implement a real toggle using `.classList.toggle()`.

### `deckLoaded` used without null-guard on the surrounding element
**Severity:** Low
**Lines:** 1536–1538
`getElementById('stats-panel')` and similar calls are used without checking that the element exists. If the HTML is ever restructured and an ID is renamed or removed, the code will throw a `TypeError` silently hidden inside event handlers.
**Action:** Consider asserting element existence at startup (or at least in development/debug mode) rather than trusting IDs at call time.

## Summary
The segment is small and largely correct, but `playLibrary` is referenced before its `let` declaration, creating a temporal hazard. `toggleSidebar` is a naming mismatch (expand-only, not a real toggle) that will mislead future developers.
