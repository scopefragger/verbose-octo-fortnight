# Static Code Review — Card Detail Modal
Lines: 419–468 | File: public/mtg-commander.html

## Findings

### modal-close uses position:absolute but parent lacks position context in CSS
**Severity:** Medium
**Lines:** 467 (CSS), 1014 (HTML)
The `.modal-close` rule sets `position: absolute` with `top: 12px; right: 14px`, but the `.modal` CSS block (lines 451–458) does not declare `position: relative`. The position context is patched inline on the HTML element (`style="position:relative"`) rather than in the stylesheet, creating a mismatch between the CSS rule and the declared styles. If the inline style is ever removed, the close button will escape to the nearest positioned ancestor (the `modal-overlay`).
**Action:** Add `position: relative` to the `.modal` CSS rule and remove the inline `style` attribute from the HTML.

### .modal-img has no explicit height constraint
**Severity:** Low
**Lines:** 461
`width: 160px; flex-shrink: 0` is set but there is no `height` or `max-height` constraint. For cards with non-standard aspect ratios (tokens, art cards) this can cause layout overflow inside the flex container.
**Action:** Add `height: auto` (already implied) and optionally `max-height: 230px` to cap tall images.

### Orphaned lookup-bar styles precede the modal section boundary comment
**Severity:** Low
**Lines:** 419–437
The `.lookup-bar` and `.lookup-input` rules appear between lines 419–437, before the `/* === CARD DETAIL MODAL ===*/` comment at line 439. This is not a bug but indicates the section boundary comment is off — the "Card Detail Modal" block actually starts at line 440, not 419. The segment range assigned (419–468) includes unrelated lookup styles.
**Action:** Move the `/* === CARD LOOKUP === */` comment so the section boundary accurately reflects where each concern begins. No functional change needed.

## Summary
The primary static issue is that `.modal-close` relies on `position: absolute` with the position context supplied only via an inline style on the HTML element rather than in the stylesheet, which is fragile. The remaining findings are minor layout and comment-alignment issues.
