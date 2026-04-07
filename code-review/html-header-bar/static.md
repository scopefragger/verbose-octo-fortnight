# Static Review — Header Bar
Lines: 776–783 | File: public/mtg-commander.html

## Findings

### `deck-status` element is populated implicitly with no null guard at call sites
**Severity:** Low
**Lines:** 778
The `#deck-status` div is left empty in markup — its content is set entirely by JavaScript elsewhere. If the populating code references it before the DOM is ready, or if the element is ever renamed, there is no fallback text and the element silently renders blank. A placeholder such as "No deck loaded" would make the absent-deck state explicit and catch a missing-element reference earlier.
**Action:** Add a default text node (e.g., "No deck loaded") as the element's initial inner content so the empty-on-load state is intentional rather than accidental, and search call sites for a null guard on `getElementById('deck-status')`.

### `active` class hard-coded on `#mode-prepare` at page load
**Severity:** Low
**Lines:** 780
The `Prepare` button carries `class="mode-btn active"` as a static attribute. The initial active mode is therefore encoded in two places: this HTML attribute and the implicit assumption inside `setMode()` that prepare is the default. If the default mode ever changes, this attribute must be updated separately.
**Action:** Either strip `active` from the HTML and let an init call to `setMode('prepare')` on `DOMContentLoaded` own the initial state, or add a comment noting the HTML attribute is the canonical default.

## Summary
The segment has no undefined references — all IDs targeted by `setMode()` are present. The main static concerns are the silent empty state of `#deck-status` and a duplicated "prepare is default" assumption split across the HTML attribute and JavaScript logic.
