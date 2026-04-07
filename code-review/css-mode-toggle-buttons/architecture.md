# Architecture Review — Mode Toggle Buttons
Lines: 550–557 | File: public/mtg-commander.html

## Findings

### Active-state managed by JavaScript class, not a CSS `:checked` or focus mechanism
**Severity:** Low
**Lines:** 551–557
The `.active` class on `.mode-btn` is toggled imperatively by `setMode()` in JavaScript (lines 1531–1545). For a two-state toggle this works fine, but it creates a coupling between the CSS contract (`.active`) and the JS logic — any rename of the class in CSS silently breaks the toggle without a compile-time error. There is no ARIA role (`role="tab"` / `aria-selected`, or `role="switch"`) on the HTML buttons (lines 779–781), so the active state is also invisible to assistive technology.
**Action:** Add `aria-pressed` or `aria-selected` attributes managed by `setMode()` alongside the class toggle, so active state is communicated semantically. Optionally document the `.active` contract in a comment so the CSS–JS coupling is explicit.

### Toggle button styles duplicated with other pill-button patterns
**Severity:** Low
**Lines:** 552–557
The pill-button shape (`border-radius: 20px`, `border: 1px solid var(--card-border)`, `color: var(--text-dim)`, hover-to-gold) is repeated across several other button groups in the stylesheet (e.g. `.header-back`, `.deck-tab`). There is no shared base class for this recurring affordance.
**Action:** Consider a shared `.pill-btn` base class to reduce duplication and keep hover/active behavior consistent as the UI grows.

## Summary
The segment is well-scoped CSS with no major architectural problems. Two low-severity issues: JS–CSS coupling on the `.active` class name without any accessibility attribute to accompany it, and mild visual duplication of the pill-button pattern across the stylesheet.
