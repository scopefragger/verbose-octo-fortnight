# Static Code Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `playLibrary` declared after it is referenced
**Severity:** Medium
**Lines:** 1540, 1548
`setMode()` references `playLibrary` at line 1540, but `playLibrary` is declared at line 1548 in the PLAY STATE block. In JavaScript this works because `let` variables are hoisted to the top of their enclosing block (but not initialised), so at call-time the variable exists. However, this ordering makes the code fragile: any future refactoring that moves the declaration below a function boundary could produce a `ReferenceError`. It also makes the control-flow harder to reason about at a glance.
**Action:** Move the `playLibrary` (and related play-state) declarations above `setMode()`, or consolidate all state variables at the top of the script block.

### `toggleSidebar` does not toggle — it only removes the class
**Severity:** Medium
**Lines:** 1543–1545
The function name `toggleSidebar` implies a two-way toggle, but the implementation only calls `classList.remove('sidebar-collapsed')`. A user clicking the toggle button a second time would expect it to close the sidebar again, but nothing would happen. The button is shown only when the sidebar is already collapsed (via the CSS rule `.sidebar-collapsed .sidebar-toggle { display: flex }`), which hides the functional gap at runtime, but the function's name is still misleading.
**Action:** Either rename the function to `showSidebar` to match its actual behaviour, or implement a true toggle using `classList.toggle('sidebar-collapsed')`.

### `setMode('prepare')` leaves sidebar visible — no explicit show
**Severity:** Low
**Lines:** 1532–1541
Switching back from play to prepare mode removes the `sidebar-collapsed` class (line 1539 sets it `false`). This is correct, but there is no explicit confirmation that the sidebar is in a clean state if some other code path collapsed it. Currently there is no other collapser, but the coupling is implicit.
**Action:** Low priority. Consider adding a comment noting the class invariant so future developers understand the side-effect.

## Summary
The segment is small and largely correct. The main static concern is the forward-reference to `playLibrary` (which works at runtime due to hoisting but is fragile), and a misleadingly-named `toggleSidebar` function that only performs half of a toggle. No undefined references, dead code, or off-by-one issues exist.
