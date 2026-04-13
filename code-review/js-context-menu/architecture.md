# Architecture Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxTarget` is used as shared mutable state between `showCtxMenu` and `ctxAction`
**Severity:** Medium
**Lines:** 1999, 2010
The context menu communicates the target card ID to the action handler via a module-level `ctxTarget` variable. This creates temporal coupling: `showCtxMenu` must be called before `ctxAction`. If the menu is ever shown programmatically without going through `showCtxMenu`, `ctxAction` will act on whatever `ctxTarget` happens to hold.
**Action:** Pass the target ID directly to `ctxAction` (e.g., store it in a `data-id` attribute on the menu element) rather than using shared mutable state.

### Global `document.addEventListener('click')` registered at module parse time
**Severity:** Low
**Lines:** 2019–2021
The global click dismissal listener is registered unconditionally when the script runs. This means it's always active, even when no context menu is shown — a minor memory/performance concern and a pattern that is hard to remove later.
**Action:** For the current scale this is fine. Alternatively, register the listener only when the menu is shown and remove it after dismissal (a "transient listener" pattern).

### `ctxAction` uses a chain of `if` statements instead of a dispatch map
**Severity:** Low
**Lines:** 2011–2015
Five sequential `if` statements check the action string. This is readable but less extensible than a dispatch map.
**Action:** Replace with a lookup: `const actions = { tap: tapCard, hand: returnToHand, top: putOnTop, grave: sendToGrave, exile: sendToExile }; actions[action]?.(ctxTarget);`

## Summary
The main architectural concern is using a module-level variable for inter-function communication. A data attribute on the menu element would be a cleaner, more self-contained approach. The if-chain action dispatch is also worth converting to a lookup map.
