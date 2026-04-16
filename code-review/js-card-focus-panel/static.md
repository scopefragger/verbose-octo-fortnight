# Static Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectedHandIdx` referenced in `closeFocusPanel` but never declared in this section
**Severity:** Medium
**Lines:** 1960
`closeFocusPanel()` sets `selectedHandIdx = null`, implying a global variable. If `selectedHandIdx` is not initialised elsewhere before `closeFocusPanel` is called, this creates an implicit global. Its initialisation site is not visible in this segment.
**Action:** Confirm `selectedHandIdx` is explicitly declared (e.g. `let selectedHandIdx = null;`) in the play-state block. Add an initialisation if missing.

### `selectBFCard` uses `selectedBFId` without a null-initialisation guard
**Severity:** Low
**Lines:** 1931
`if (selectedBFId === id)` assumes `selectedBFId` is already declared. This is the same issue flagged in the Render Play Area section. The `typeof` guard used in `bfCardHTML` is absent here — making the two access patterns inconsistent.
**Action:** Initialise `selectedBFId = null` at the play-state declaration site and remove any `typeof` guards elsewhere.

### `idx` used directly in `onclick` without bounds or type validation
**Severity:** Low
**Lines:** 1988, 1989
`idx` is an array index from `playHand[idx]`. It is embedded directly into `onclick="playHandCardFromFocus(${idx})"` and `onclick="discardFromHand(${idx});closeFocusPanel()"`. If `idx` were ever non-numeric (e.g. `NaN` or a negative number from a corrupted call), the functions receiving it would silently operate on `undefined`.
**Action:** Assert `typeof idx === 'number' && idx >= 0 && idx < playHand.length` at the top of `selectHandCard`, and use `Number(idx)` in the template to be explicit.

### Duplicate DOM queries for the same elements in `selectBFCard` and `selectHandCard`
**Severity:** Low
**Lines:** 1937–1942, 1976–1981
Both functions independently call `getElementById` for the same five focus-panel elements (`focus-img`, `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`). This is repeated boilerplate.
**Action:** Extract a `populateFocusPanel({ img, name, mana_cost, type_line, oracle_text })` helper that performs the five DOM writes, and call it from both functions.

### `focus-img` src set to empty string when no image
**Severity:** Low
**Lines:** 1935, 1937–1938, 1972, 1976–1977
When `img` is `''`, `focus-img.src` is set to `''` and then hidden via `style.display = 'none'`. Setting `src=""` still triggers a network request for the page's base URL in some browsers.
**Action:** Only set `focus-img.src` when `img` is non-empty; alternatively set it to a transparent data URI as a safe fallback.

## Summary
The section has consistent logic across `selectBFCard` and `selectHandCard` but duplicates five DOM queries and the img-handling pattern in both functions. The reliance on undeclared global variables (`selectedBFId`, `selectedHandIdx`) without explicit initialisations is the most structurally risky issue.
