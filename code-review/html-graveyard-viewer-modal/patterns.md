# Code & Pattern Review — Graveyard Viewer Modal
Lines: 1001–1010 | File: public/mtg-commander.html

## Findings

### Inline styles should use CSS classes
**Severity:** Low
**Lines:** 1003, 1005, 1006
The code uses inline `style` attributes:
- Line 1003: `style="position:relative;max-width:540px"`
- Line 1005: `style="padding:16px"`
- Line 1006: `style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--gold);margin-bottom:10px"`

These styles duplicate existing CSS patterns and make the HTML verbose. Compare line 1014 for `card-modal`, which also uses inline styles for the same pattern.

**Action:** Extract inline styles to named CSS classes. For example:
```css
.grave-viewer-header {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--gold);
  margin-bottom: 10px;
}
```
Then simplify line 1006 to: `<div class="grave-viewer-header" id="grave-viewer-title">Graveyard</div>`

### Inconsistent modal layout pattern
**Severity:** Low
**Lines:** 1003, 1005
The modal structure differs slightly from `card-modal` (lines 1013–1016):
- This modal: `<div class="modal" style="..."><button class="modal-close" .../><div style="padding:16px"><...></div></div>`
- Card modal: `<div class="modal" style="..."><button class="modal-close" .../><div class="modal-inner"><...></div></div>`

The card modal uses a `modal-inner` class for padding, while the graveyard modal uses inline `style="padding:16px"`.

**Action:** Use the same `modal-inner` class structure for consistency. This also makes future style updates easier.

### Missing comment on onclick event flow
**Severity:** Low
**Lines:** 1002, 1003
The event handling pattern (overlay click closes, inner click stops propagation) is correct but not documented with a comment.

**Action:** Add a brief comment explaining the event handling strategy:
```html
<!-- Close on overlay click, but stop propagation on inner modal to prevent accidental closes -->
```

### Magic padding value
**Severity:** Very Low
**Lines:** 1005, 1006
The padding value `16px` and margin `10px` are inlined without semantic naming.

**Action:** Consider defining padding and margin constants in CSS if they are reused (e.g., `--modal-padding: 16px`). This is minor for a single-page tool.

## Summary
The code follows reasonable patterns but has minor consistency issues with inline styles and modal structure. Recommend extracting CSS classes and using the same `modal-inner` pattern as other modals in the file for maintainability.
