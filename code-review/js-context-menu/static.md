# Static Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxTarget` not cleared when menu is dismissed via document click
**Severity:** Low
**Lines:** 2019–2021
The global click listener hides the menu but does not reset `ctxTarget` to `null`. If a subsequent event somehow triggers `ctxAction()` without reopening the menu first, it would act on the stale `ctxTarget`. The guard `if (!ctxTarget) return;` in `ctxAction()` would not protect against this since `ctxTarget` is still set.
**Action:** Add `ctxTarget = null;` inside the document click handler alongside the `display = 'none'` call.

### Magic numbers for menu edge-offset calculation
**Severity:** Low
**Lines:** 2002–2003
`window.innerWidth - 160` and `window.innerHeight - 180` are hard-coded pixel offsets that approximate the menu dimensions. If the menu height/width changes via CSS, these values become wrong silently.
**Action:** Replace with `window.innerWidth - menu.offsetWidth` and `window.innerHeight - menu.offsetHeight` to dynamically read the rendered menu size. Alternatively, define named constants.

### `ctxAction` uses sequential `if` statements instead of a dispatch map
**Severity:** Low
**Lines:** 2011–2015
Five `if` statements are used to dispatch actions. If a new action is added, this list grows. There is no `else` branch or default handler for unrecognised action strings.
**Action:** Use a lookup map or `switch` statement for clarity and to make it easier to add new actions. Add a warning/log for unrecognised action values.

### `document.getElementById('card-ctx-menu')` called three times across this small section
**Severity:** Low
**Lines:** 2000, 2009, 2020
The same element is looked up three times without caching. While performance is negligible, caching a module-level reference (`const ctxMenu = document.getElementById('card-ctx-menu');`) would be cleaner.
**Action:** Cache the menu element in a module-level variable at initialisation time.

## Summary
The context menu logic is straightforward and functional. The main concerns are the stale `ctxTarget` after document-click dismissal and the magic numbers for positioning. These are low-severity but easy to fix.
