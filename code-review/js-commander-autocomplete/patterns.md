# Patterns Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Debounce implemented inline with `clearTimeout`/`setTimeout` — no shared debounce utility
**Severity:** Low
**Lines:** 2068, 2071
The 200ms debounce is implemented directly in the input handler. This is a common utility that could be extracted as `debounce(fn, ms)` for reuse (the hand simulator section likely has similar debounce logic).
**Action:** Extract a `debounce(fn, ms)` utility and use it here. Check if the hand simulator or other sections implement the same pattern that could be consolidated.

### Magic number `200` for debounce delay
**Severity:** Low
**Lines:** 2071
`setTimeout(..., 200)` uses a magic number for the debounce delay. Should be a named constant.
**Action:** Define `const AC_DEBOUNCE_MS = 200;` at the top of the section or alongside `acState`.

### Magic number `2` for minimum query length
**Severity:** Low
**Lines:** 2070
`if (q.length < 2)` uses a magic number for the minimum characters before triggering autocomplete. Scryfall's autocomplete endpoint works best with 2+ characters, but this should be documented.
**Action:** Define `const AC_MIN_QUERY_LEN = 2;` as a named constant with a comment: `// Scryfall autocomplete requires at least 2 characters`.

### Magic number `8` for maximum suggestions
**Severity:** Low
**Lines:** 2104, 2108
`.slice(0, 8)` appears twice. The maximum number of autocomplete suggestions should be a named constant.
**Action:** Define `const AC_MAX_SUGGESTIONS = 8;` and use it in both slice calls.

### `escapeQuotes` used for onclick arguments instead of `JSON.stringify`
**Severity:** Medium
**Lines:** 2118
This is also flagged as a security issue. From a patterns perspective, `escapeQuotes` is the wrong tool for embedding strings in JS function call arguments within onclick attributes. The canonical pattern in this file for safe argument embedding is `JSON.stringify(value)`.
**Action:** Replace `escapeQuotes(name)` and similar with `JSON.stringify(name)` for consistency with the `bfCardHTML` approach (which uses `JSON.stringify(bfc.id)`).

### `hideDropdown` clears `innerHTML` on every hide — could cause layout reflow
**Severity:** Low
**Lines:** 2137
`dropdown.innerHTML = ''` on hide triggers a DOM reflow. For a small dropdown this is negligible. However, if the dropdown contains images being fetched, clearing innerHTML also cancels those image loads.
**Action:** No immediate change required. Acceptable for current scale.

## Summary
Multiple magic numbers should be extracted as named constants (`AC_DEBOUNCE_MS`, `AC_MIN_QUERY_LEN`, `AC_MAX_SUGGESTIONS`). The `escapeQuotes` pattern for onclick argument embedding is inconsistent with the `JSON.stringify` pattern used elsewhere. A shared `debounce` utility would reduce duplication.
