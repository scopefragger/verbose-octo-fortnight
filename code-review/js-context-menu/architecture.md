# Architecture Review — js-context-menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Global click listener attached as module-level side effect
**Severity:** Low
**Lines:** 2019–2021
```js
document.addEventListener('click', () => { ... });
```
This listener is attached at parse/evaluation time, not inside `DOMContentLoaded`. While the element (`card-ctx-menu`) is in the HTML and will exist by the time any click fires, the pattern is inconsistent with the rest of the file where event setup is deferred to `DOMContentLoaded`. A module-level side effect is also harder to remove or conditionalize later.
**Action:** Move into the `DOMContentLoaded` handler (or the existing `init` section) for consistency.

### `ctxTarget` global couples menu state to action dispatch
**Severity:** Low
**Lines:** 1999, 2010
`ctxTarget` is set in `showCtxMenu` and read in `ctxAction`. This works because context menu interactions are synchronous and single-threaded, but it's an implicit shared-state dependency. If any code resets `ctxTarget` between show and action (e.g., a competing click), the action is silently swallowed.
**Action:** No immediate change required for a single-file app, but note that `ctxTarget` must never be mutated between `showCtxMenu` and `ctxAction` calls.

## Summary
Small, well-contained section. The only architecture concern is the module-level event listener, which breaks the `DOMContentLoaded`-deferred initialization pattern used elsewhere.
