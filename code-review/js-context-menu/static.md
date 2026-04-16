# Static Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxTarget` is an implicit global
**Severity:** Medium
**Lines:** 1999, 2010, 2016
`ctxTarget` is read and written without any `let`/`const`/`var` declaration visible in this section. If it is not declared at module scope, this creates an accidental global in non-strict mode or a ReferenceError in strict mode.
**Action:** Confirm `ctxTarget` is declared (e.g. `let ctxTarget = null;`) alongside the other play-state globals. If not, add the declaration there and add a comment cross-referencing it here.

### `menu` could be null — no null guard after `getElementById`
**Severity:** Low
**Lines:** 2000–2005
`document.getElementById('card-ctx-menu')` is called without checking the result. If the element is absent (e.g. during a future HTML refactor), subsequent property assignments (`style.display`, `style.left`, `style.top`) will throw a TypeError.
**Action:** Add a guard: `if (!menu) return;` immediately after the `getElementById` call.

### Global `click` listener never cleaned up
**Severity:** Low
**Lines:** 2019–2021
The `document.addEventListener('click', ...)` at line 2019 is registered at parse time and never removed. While this is intentional for a SPA, if the script is ever re-executed (e.g. during hot reload or testing), duplicate listeners accumulate.
**Action:** Store the handler in a named variable so it can be removed if needed: `const _hideCtxMenu = () => { ... }; document.addEventListener('click', _hideCtxMenu);`. Document the lifecycle assumption.

### `ctxAction` uses a chain of `if` statements instead of a dispatch table or `switch`
**Severity:** Low
**Lines:** 2011–2015
Five consecutive `if` statements each compare `action` to a string literal. Unlike `else if` or `switch`, all five conditions are evaluated even after a match is found.
**Action:** Replace with `if/else if` chain or a `switch` statement so evaluation stops on the first match. Alternatively use a dispatch object: `const actions = { tap: tapCard, hand: returnToHand, ... }; actions[action]?.(ctxTarget);`.

### Magic numbers for menu overflow clamp (160, 180)
**Severity:** Low
**Lines:** 2002–2003
`window.innerWidth - 160` and `window.innerHeight - 180` are hardcoded pixel offsets that approximate the menu's rendered dimensions. If the menu's CSS size changes, these values become stale silently.
**Action:** Compute the offsets dynamically from the menu element's actual size: `menu.offsetWidth` and `menu.offsetHeight`. If that is too expensive, at minimum define named constants: `const CTX_MENU_W = 160; const CTX_MENU_H = 180;`.

## Summary
The section is concise and functional but relies on an undeclared global (`ctxTarget`), uses hardcoded magic numbers for clamp offsets, and evaluates all five `if` branches unconditionally in `ctxAction`. The global click-dismiss listener is correct but should be named for maintainability.
