# Static Review — Hand Simulator Panel
Lines: 876–895 | File: public/mtg-commander.html

## Findings

### Button visibility managed entirely by JS with no initial ARIA state
**Severity:** Low
**Lines:** 881–883
The three secondary buttons (`mulligan-btn`, `keep-btn`, `critique-btn`) use `style="display:none"` as their initial state but carry no `aria-hidden="true"` or `aria-disabled` attribute. Screen readers may announce them as present-but-invisible before JS runs. The matching JS functions (`mulligan()`, `keepHand()`, `critiqueHand()`) are expected to exist in the global scope — if any is missing or misspelled the button silently does nothing (no `data-` binding, no null guard in the markup).
**Action:** Add `aria-hidden="true"` to each hidden button. Consider adding a `disabled` attribute as a structural default so the element is semantically inactive before JS initialises it.

### `critique-text` element has no loading/empty-state guard in markup
**Severity:** Low
**Lines:** 893
`<div id="critique-text">` is always rendered empty. If `critiqueHand()` fails or is interrupted the div stays blank inside a visible purple box (since the box is toggled open by JS before the response arrives). There is no placeholder or error-state indicator in the HTML.
**Action:** Add a visually-hidden default message (e.g., "Loading…") that JS can replace, or ensure the critique box is only shown after a successful response is confirmed.

### `mulligan-count` span has no accessible label
**Severity:** Low
**Lines:** 879
`<span class="mulligan-count" id="mulligan-info"></span>` is empty until JS writes into it. It has no `aria-live` region attribute, so dynamic updates to mulligan count are invisible to screen-reader users.
**Action:** Add `aria-live="polite"` to the span so assistive technology announces changes.

## Summary
The markup is structurally sound and IDs are unique and consistently named. The main static concerns are accessibility gaps: hidden buttons lack ARIA attributes, the dynamic mulligan counter has no live-region announcement, and the critique output box has no fallback state for failed or in-flight API calls.
