# Architecture Review — Hand Simulator Panel
Lines: 876–895 | File: public/mtg-commander.html

## Findings

### Visibility state owned by both HTML attributes and JS logic
**Severity:** Medium
**Lines:** 881–883, 891
Initial `style="display:none"` is set directly in markup for three buttons and for `critique-box`. This splits the "what is shown" contract between the HTML source and the JS functions that toggle visibility. If a developer adds a new code path that skips the toggle, elements may be stuck in their HTML-default state. In a single-file app this coupling is tolerable but it creates two sources of truth.
**Action:** Consider initialising all dynamic-visibility elements to their hidden state exclusively in JS (the `drawHand()` reset path), removing inline `style="display:none"` from markup. This consolidates visibility logic in one place.

### Critique UI tightly coupled to a specific AI provider
**Severity:** Low
**Lines:** 892
The label "🧠 AI Critique" and the button text "🧠 Critique" (line 883) are provider-agnostic in copy, but the JS layer calls Groq directly (per SEGMENTS.MD JS section 10). The HTML makes no provision for a loading spinner, a retry control, or a provider-swap affordance. Changing the critique backend would require touching both the HTML label area and the JS call.
**Action:** Low priority for a single-file app. If critique providers may change, extract the critique sub-panel into a reusable template or component pattern and pass provider identity via a data attribute.

### Hand grid initialised with placeholder content in markup
**Severity:** Low
**Lines:** 885–890
The `hand-grid` div contains a hard-coded empty-state `<div class="empty-hand">` in HTML. JS must either leave this alone or replace it on `drawHand()`. This is a mild coupling — the JS renderer must know to clear this specific child structure. A cleaner pattern would be an empty `<div id="hand-grid"></div>` with the empty-state rendered entirely by `renderHand()`.
**Action:** Move the empty-state HTML into the JS `renderHand()` function so the empty/populated states are managed in one place.

## Summary
The panel's architecture reflects the single-file app context and is pragmatic for its scope. The main concern is split ownership of visibility state between inline HTML styles and JS toggles, which adds a subtle maintenance hazard. The hard-coded empty-state in the hand grid and the tight Groq coupling are low-severity for the current scale.
