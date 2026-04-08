# Architecture Review — Card Detail Modal
Lines: 1013–1026 | File: public/mtg-commander.html

## Findings

### Modal serves both Prepare-mode and Play-mode without distinction
**Severity:** Low
**Lines:** 1013–1026
The single `#card-modal` element is shared by all three call sites: the deck list (line 1310), the hand simulator (line 1424), and the graveyard viewer (line 2047). This is a reasonable reuse of a simple overlay. However, it means the modal carries no context about which mode it was opened from, making it impossible to add mode-specific actions (e.g., "Play this card" from the hand view) without refactoring the shared structure.
**Action:** No immediate action required. If mode-specific modal actions are added in the future, consider a context parameter or separate modal variants.

### `closeModal()` logic lives in JS while open/close for graveyard viewer and token modal live inline in HTML
**Severity:** Low
**Lines:** 1013 vs. 1002, 968
The card modal delegates close logic to `closeModal()` (a JS function), but the graveyard viewer (`#grave-viewer`, line 1002) and token modal (`#token-modal`, line 968) perform the same overlay-click-to-close logic entirely with inline `onclick` strings. This creates three different patterns for the same behaviour across three modals.
**Action:** Unify modal dismiss logic into a single `dismissModal(id)` utility function and replace all three inline handlers with calls to it. This reduces the risk of one modal's dismiss behaviour being fixed while others are forgotten.

### Toast element is unrelated to the card modal section
**Severity:** Low
**Lines:** 1029
The `#toast` element is placed immediately after the card modal in the HTML, suggesting they are co-located by proximity rather than by logical relationship. The toast is a global UI component used by many functions across the file.
**Action:** Consider moving the toast element to a dedicated "global UI components" comment block, or at minimum add a comment clarifying it is a standalone global element. This is a cosmetic/documentation concern only.

## Summary
The card modal HTML is simple and its reuse across modes is intentional. The main architectural concern is inconsistent modal dismiss patterns across the three modal elements — the card modal uses a JS function, while the others use raw inline classList manipulation. Unifying these into a shared `dismissModal()` helper would improve consistency and reduce future maintenance risk.
