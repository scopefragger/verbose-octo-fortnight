# Architecture Review — Header Bar
Lines: 776–783 | File: public/mtg-commander.html

## Findings

### Mode state is split across HTML (the `active` class) and JS (`setMode`)
**Severity:** Low
**Lines:** 780, 1531–1541
The initial active button state is encoded in the HTML attribute (`class="mode-btn active"`), while all subsequent state transitions live in `setMode()`. This means the source of truth for "which mode is active on load" is the HTML, not the JS — the two must stay manually in sync. `setMode()` directly manipulates `#mode-prepare` and `#mode-play` by ID, creating a tight coupling between the button markup and the function.
**Action:** Centralise initial mode state in JS: remove `active` from the HTML, add `setMode('prepare')` to the `DOMContentLoaded` handler. This makes JS the single source of truth for mode state.

### `onclick` attributes couple the header markup to a specific global function name
**Severity:** Low
**Lines:** 780–781
`onclick="setMode('prepare')"` and `onclick="setMode('play')"` hard-bind the buttons to the global function `setMode`. Renaming or modularising that function requires updating the HTML. In a single-file app this is a minor concern, but it is an avoidable coupling.
**Action:** Wire events in JS (`addEventListener`) rather than in HTML attributes, consistent with how other interactive elements in the file are wired.

## Summary
The header bar's architecture is appropriate for a single-file app. The two concerns — split mode state and `onclick`-based coupling — are minor and could be resolved by moving the initial `active` assignment and event binding entirely into the JS initialisation block.
