# Static Code Review — Toast Element
Lines: 1029 | File: public/mtg-commander.html

## Findings

### Missing null guard in showToast()
**Severity:** Low
**Lines:** 2151
`document.getElementById('toast')` is called every time `showToast()` is invoked with no null guard. If the element were ever absent (e.g. removed by another script or a future refactor), the subsequent property assignments on line 2152–2153 would throw a TypeError and silence the notification silently. The element is declared once, globally in HTML, so the risk is low today but grows if the file is ever split.
**Action:** Cache the element reference at startup (e.g. `const toastEl = document.getElementById('toast');`) and add a guard: `if (!toastEl) return;` in `showToast()`.

### Module-scope timer variable
**Severity:** Low
**Lines:** 2149
`let toastTimer;` is declared at module (script) scope rather than being scoped to the function. It is only used by `showToast()`, so it pollutes the shared namespace unnecessarily.
**Action:** Move `let toastTimer;` inside the `showToast()` function body or convert it to a closure. Alternatively, cache the element reference at the top of the file next to the timer so both are co-located.

## Summary
The single `<div>` element itself is correct and minimal. The only static concerns relate to the companion `showToast()` function in the utilities section: a missing null guard on the element lookup and a module-scope timer variable that could be more tightly scoped.
