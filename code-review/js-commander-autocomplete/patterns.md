# Patterns Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Debounce delay `200` ms is a magic number
**Severity:** Low
**Lines:** 2071
`setTimeout(() => fetchSuggestions(...), 200)` uses a bare `200` ms debounce delay with no named constant or comment explaining the choice.
**Action:** Define `const AC_DEBOUNCE_MS = 200;` and use it here. Add a comment noting that shorter delays increase Scryfall API load.

### Result cap `8` appears twice — redundant and unexplained
**Severity:** Low
**Lines:** 2104, 2108
`(json.data || []).slice(0, 8)` and then `names.slice(0, 8)` both cap at 8 items. The number `8` is not explained.
**Action:** Define `const AC_MAX_RESULTS = 8;` and use it in both places. Remove the redundant second slice (see static.md).

### Minimum query length `2` is a magic number
**Severity:** Low
**Lines:** 2070
`if (q.length < 2)` is a threshold with no named constant or comment. Changing this value requires knowing all the places it appears.
**Action:** Define `const AC_MIN_QUERY_LEN = 2;` and use it here.

### `type_line` split and trim inline in the template map
**Severity:** Low
**Lines:** 2117
`card?.type_line?.split('—')[0]?.trim() || ''` is a multi-step transformation embedded inline in the map callback. This pattern appears in multiple render maps across the file.
**Action:** Extract a utility function: `function cardTypeLine(card) { return card?.type_line?.split('—')[0]?.trim() || ''; }`. This reuse would also benefit other sections that perform the same extraction.

### `catch { hideDropdown(...) }` swallows all errors silently
**Severity:** Low
**Lines:** 2125
The catch block for `fetchSuggestions` calls `hideDropdown` but does not log the error. Network failures, JSON parse errors, and programming bugs all result in the same silent dropdown dismissal.
**Action:** Log the error before hiding: `catch (err) { console.warn('fetchSuggestions error:', err); hideDropdown(dropdown, state); }`.

### `alt=""` on preview images — accessibility gap
**Severity:** Low
**Lines:** 2119
Preview card images use `alt=""` (empty alt), which marks them as decorative. However, for a card selection UI, the card name is meaningful context for screen reader users.
**Action:** Use `alt="${escapeHtml(name)}"` on the preview image so screen readers announce the card name alongside the image.

### ArrowDown/ArrowUp active-class toggling iterates the full list on every keypress
**Severity:** Low
**Lines:** 2080, 2084
`items.forEach((el, i) => el.classList.toggle('active', i === state.index))` iterates all items on every arrow key press to update the active state. For 8 items this is negligible, but the pattern is O(n) rather than the O(1) alternative of tracking and toggling only the previous and next elements.
**Action:** Acceptable for the current item count; add a comment noting the simplification. If the result cap ever increases significantly, revisit.

## Summary
The section has several related magic numbers (debounce delay, max results, min query length) that should each be named constants. The error swallowing in `fetchSuggestions` is a diagnostic issue. The `type_line` transformation should be extracted into a shared utility to reduce duplication across the file.
