# Code & Pattern Review — Import Tab
Lines: 145–256 | File: public/mtg-commander.html

## Findings

### Magic number z-index on autocomplete dropdown
**Severity:** Low
**Lines:** 188
`.ac-dropdown` sets `z-index: 50` with no comment or named variable explaining its relation to other stacking contexts. If modals, toasts, or context menus elsewhere in the file also define numeric z-index values, ordering conflicts may emerge invisibly.
**Action:** Centralise z-index values as CSS custom properties (e.g. `--z-dropdown: 50; --z-modal: 100; --z-toast: 200`) in the `:root` block so the layering hierarchy is explicit and auditable.

### `names.slice(0, 8)` applied redundantly — `names` was already sliced to 8
**Severity:** Low
**Lines:** 2104, 2108
`const names = (json.data || []).slice(0, 8)` limits the list to 8 items; then `names.slice(0, 8)` is called again on line 2108 when mapping for `Promise.all`. The second slice is a no-op and signals either a copy-paste artefact or an intent to limit the preview fetches to fewer than the name list (which is not actually done).
**Action:** Remove the redundant `.slice(0, 8)` on line 2108 and add a brief comment if the intent was to limit preview fetches independently of the name count.

### Inconsistent button reset: `btn.innerHTML` set on loading, `btn.textContent` on completion
**Severity:** Low
**Lines:** 1154, 1157, 1166
The import button label is set via `btn.innerHTML = '<span class="loading-spinner"></span> Loading…'` during loading, then reset via `btn.textContent = 'Load Deck'` on both success and error paths. Mixing `innerHTML` and `textContent` for the same element is inconsistent. While safe here (the loading spinner is a hardcoded string), it establishes a pattern where a future developer may use `innerHTML` in the completion path with unsafe data.
**Action:** Use `innerHTML` consistently for the loading state (since it contains markup) and `innerHTML` for the reset state too, using a constant (e.g. `const LOAD_BTN_LABEL = 'Load Deck'`), or refactor to a CSS class toggle that shows/hides a spinner sibling element.

### `font-family: 'Courier New', monospace` inline in CSS instead of a variable
**Severity:** Low
**Lines:** 215
The decklist textarea uses a hardcoded monospace font stack. If the app ever needs to update its monospace font (e.g. to match a design system), this is the only place it is specified and has no named token.
**Action:** Define `--font-mono: 'Courier New', monospace` in the `:root` block and reference it here.

### Debounce delay of `200ms` is a magic number
**Severity:** Low
**Lines:** 2071
The autocomplete input debounce uses `setTimeout(..., 200)` with no named constant or comment. `200` is a reasonable value but unnamed magic numbers accumulate.
**Action:** Declare `const AC_DEBOUNCE_MS = 200;` near the `acState` declaration and use the constant in the `setTimeout` call.

### `.import-hint` font-size `0.72rem` is inconsistent with other small text values
**Severity:** Low
**Lines:** 223
Other small-text classes in this segment use `0.7rem` (`.ac-item-type`, line 205), `0.78rem` (`.btn-sm`, line 245), and `0.8rem` (`.decklist-textarea`, line 216). The hint text at `0.72rem` sits between defined steps and appears to be an arbitrary intermediate value.
**Action:** Align to the nearest defined step (`0.7rem`) or define a `--font-xs` variable used consistently across all extra-small text.

## Summary
The CSS in this segment is readable and consistent in structure, but accumulates several small-scale code-smell issues: a redundant array slice, mixed `innerHTML`/`textContent` on the same element, scattered magic numbers (z-index, debounce delay, font sizes), and a lone hardcoded font stack. None are individually serious, but addressing them as a group would meaningfully reduce future maintenance friction.
