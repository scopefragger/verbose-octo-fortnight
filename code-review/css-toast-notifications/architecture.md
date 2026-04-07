# Architecture Review — Toast Notifications
Lines: 469–486 | File: public/mtg-commander.html

## Findings

### Single toast element — concurrent notifications are silently dropped
**Severity:** Medium
**Lines:** 469–486 (CSS); JS at lines 2149–2155
The design supports only one `#toast` element. If `showToast()` is called while a toast is already visible, `clearTimeout` cancels the previous auto-dismiss and the new message replaces the old one immediately. The previous message is lost without the user ever reading it. This is an architectural constraint baked into the single-element approach.
**Action:** For the current feature scope this may be acceptable, but if multiple async operations can overlap (e.g., save + import in quick succession), consider a small FIFO queue or stacking approach. At minimum, document the single-slot limitation in a comment near `showToast()`.

### State transition is class-string manipulation, not a data model
**Severity:** Low
**Lines:** 485–486 (CSS); JS at line 2153
The show/error states are managed by directly constructing and assigning a full `className` string (`'toast show' + (isError ? ' error' : '')`). This tightly couples the JS logic to the exact CSS class names and ordering. If a third variant (e.g., `warning`) is added, the JS string construction becomes fragile.
**Action:** Use `classList` methods (`el.classList.add`, `.remove`, `.toggle`) in `showToast()` to decouple state management from string concatenation. The CSS class names themselves do not need to change.

## Summary
The CSS is architecturally minimal and appropriate for a single-file app. The primary concern is the single-slot toast pattern, which silently drops overlapping notifications. The class-string manipulation in the companion JS is a minor coupling smell that `classList` would resolve cleanly.
