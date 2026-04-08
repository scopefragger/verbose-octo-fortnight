# Patterns Review — Toast Element
Lines: 1029 | File: public/mtg-commander.html

## Findings

### No ARIA live region — toast is invisible to screen readers
**Severity:** Medium
**Lines:** 1029
The toast `<div>` has no `role="status"` or `aria-live="polite"` attribute. Notifications injected via `textContent` changes are not announced to assistive technology unless the element is marked as a live region. Other interactive elements in the file (modals, buttons) likewise lack ARIA attributes, so this is a systemic gap rather than an isolated oversight.
**Action:** Add `role="status" aria-live="polite"` to the toast element: `<div class="toast" id="toast" role="status" aria-live="polite"></div>`. This brings it in line with WCAG 4.1.3 (Status Messages, Level AA) and does not affect visual behaviour.

### Magic number for toast timeout duration
**Severity:** Low
**Lines:** 2155
The auto-dismiss timeout `3000` ms is a bare magic number with no named constant or comment.
**Action:** Extract to a named constant: `const TOAST_DURATION_MS = 3000;` declared alongside `toastTimer`. This makes it easy to tune globally and self-documents intent.

### Inline background colour in CSS deviates from variable system
**Severity:** Low
**Lines:** 474
The toast CSS uses the raw hex value `#1a2a3a` for `background` rather than a CSS custom property. Other elements use `var(--bg)`, `var(--panel)`, or similar tokens. This makes the toast background harder to retheme and inconsistent with the rest of the design system.
**Action:** Define `--panel` or a suitable existing variable for this colour and replace `background: #1a2a3a` with `background: var(--panel)` (or the appropriate token after verifying the CSS variables section).

### z-index magic number
**Severity:** Low
**Lines:** 480
`z-index: 200` is a bare number. Modals elsewhere in the file use `z-index: 1000` and similar. Without a documented stacking order, these values can drift and cause layering bugs.
**Action:** Document stacking levels in a comment block in the CSS variables section, or replace bare values with CSS custom properties (e.g. `--z-toast: 200; --z-modal: 1000;`).

## Summary
The toast element is clean and minimal but has four pattern-level issues: missing ARIA live region (medium severity), a magic timeout number, a raw hex background colour that bypasses the CSS variable system, and an undocumented z-index. None of these affect current functionality, but the ARIA gap is the most impactful to address.
