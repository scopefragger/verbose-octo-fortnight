# Architecture Review — Loading Spinner
Lines: 488–498 | File: public/mtg-commander.html

## Findings

### Spinner styles are co-located with loading semantics but separated from usage sites
**Severity:** Low
**Lines:** 488–498
The `.loading-spinner` class is defined here in the CSS block, but the spinner element itself is rendered by JavaScript elsewhere in the file (likely inside `renderDeckList()` or `importDecklist()`). In a single-file app this is an accepted trade-off, but the CSS comment `/* === LOADING === */` implies this is intended as its own logical section. This is appropriate and consistent with the file's segment-based organisation — no structural change is needed, but it is worth noting the coupling: if the JS-side class name is ever changed, this CSS block becomes dead code with no compile-time signal.
**Action:** Ensure the class name `.loading-spinner` is used only from one place in JS, and add a brief comment near the JS usage referencing the CSS segment (e.g. `/* CSS: loading spinner, line 489 */`) to make the link explicit.

## Summary
The spinner is correctly isolated in its own CSS section and is small enough that its architecture is sound for a single-file app. The only architectural concern is the invisible coupling between the class name defined here and its JS usage site — a rename in either direction would silently orphan the other.
