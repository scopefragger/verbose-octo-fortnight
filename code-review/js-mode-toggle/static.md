# Static Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `playLibrary` used before declaration
**Severity:** Medium
**Lines:** 1540
`playLibrary` is referenced on line 1540 inside `setMode()`, but it is declared with `let` on line 1548 — after this function definition. In a standard JavaScript module this would be a `ReferenceError` at call time if `setMode('play')` were invoked before the variable declaration is initialised (temporal dead zone for `let`). Because all of this is in one `<script>` block that executes top-to-bottom, `setMode` is not called until user interaction, so the variable will be initialised by then. However the ordering is confusing and fragile.
**Action:** Move the `playLibrary` (and related play-state variables) declaration block to before `setMode()`, or at minimum add a comment explaining the forward dependency.

### `toggleSidebar` only removes the class, never adds it
**Severity:** Low
**Lines:** 1543–1545
`toggleSidebar()` always calls `classList.remove('sidebar-collapsed')`. There is no way to re-collapse the sidebar via this function — it is expand-only. The function name implies a two-way toggle.
**Action:** Rename to `expandSidebar()` or implement true toggle logic with `classList.toggle('sidebar-collapsed')`.

### No null guard on `document.querySelector('.layout')`
**Severity:** Low
**Lines:** 1539, 1544
Both `setMode` and `toggleSidebar` call `document.querySelector('.layout')` without checking for `null`. If the element is ever missing (e.g., during testing or partial page load), this throws a `TypeError`.
**Action:** Add a null guard or use `?.classList`.

## Summary
The segment is small and mostly correct, but `playLibrary` is referenced before its declaration, `toggleSidebar` is misnamed (expand-only), and two querySelector calls lack null guards.
