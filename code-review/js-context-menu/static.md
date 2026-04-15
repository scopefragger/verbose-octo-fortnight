# Static Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Global `click` listener added at module parse time with no teardown
**Severity:** Low
**Lines:** 2019–2021
`document.addEventListener('click', ...)` is registered once at script load time. This is fine since the HTML is a single-page app, but if the page were ever navigated (SPA routing) or if event listeners were managed with lifecycle hooks, this would be a leak. There is also no corresponding `removeEventListener`, so the listener cannot be cleaned up.
**Action:** No immediate action needed for a static single-page app. Add a comment noting the intentional top-level registration.

### `ctxAction` uses a series of `if` statements rather than a dispatch table
**Severity:** Low
**Lines:** 2011–2015
Five separate `if (action === '...')` checks are used in sequence. While correct, this pattern does not short-circuit (all conditions are evaluated even after a match) and is harder to extend than a dispatch table or `switch`.
**Action:** Replace with a `switch(action)` statement or an action dispatch object: `const actions = { tap: tapCard, hand: returnToHand, top: putOnTop, grave: sendToGrave, exile: sendToExile }; if (actions[action]) actions[action](ctxTarget);`. This short-circuits and is more extensible.

### Overflow clipping of context menu uses hardcoded offsets
**Severity:** Low
**Lines:** 2002–2003
`window.innerWidth - 160` and `window.innerHeight - 180` are magic numbers that assume the context menu is exactly 160×180 pixels. If the menu size changes, these must be updated manually.
**Action:** Read the menu dimensions dynamically: `const rect = menu.getBoundingClientRect(); const x = Math.min(e.clientX, window.innerWidth - rect.width); const y = Math.min(e.clientY, window.innerHeight - rect.height);`. Note this requires the menu to be visible before computing its size (set `visibility:hidden; display:block` first).

### `ctxTarget` is not reset when the context menu is closed by the global click listener
**Severity:** Medium
**Lines:** 2019–2021
The global click listener hides the menu (line 2009 approach) but does not reset `ctxTarget`. If `ctxAction` is called later by some path that doesn't reset `ctxTarget` (e.g. a bug or race), it would act on a stale target. However, the only call site of `ctxAction` does reset it at line 2016, so this is a minor risk.
**Action:** In the global click listener, also set `ctxTarget = null;` to make the invariant explicit: `document.addEventListener('click', () => { document.getElementById('card-ctx-menu').style.display = 'none'; ctxTarget = null; });`.

## Summary
The context menu logic is simple and correct. The most notable issues are the hardcoded menu dimension offsets and the stale `ctxTarget` not being cleared by the global dismiss listener. The series of `if` statements should be a `switch` or dispatch object for extensibility.
