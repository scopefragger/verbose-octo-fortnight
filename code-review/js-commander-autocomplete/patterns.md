# Patterns Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Magic number `200` for debounce delay and `8` for result count
**Severity:** Low
**Lines:** 2071, 2104, 2108
`200` (debounce delay in ms) and `8` (max autocomplete results) are embedded as bare numeric literals. Neither is given a name.
**Action:** Extract to named constants: `const AC_DEBOUNCE_MS = 200;` and `const AC_MAX_RESULTS = 8;`, placed above `acState`.

### `names.slice(0, 8)` duplicated — second slice on an already-sliced array
**Severity:** Low
**Lines:** 2104, 2108
`names` is declared as `(json.data || []).slice(0, 8)` at line 2104. Then at line 2108, `names.slice(0, 8).map(...)` slices the already-8-item-maximum array again. The second slice is a no-op and adds confusion about whether the intent was to limit to a smaller set here.
**Action:** Remove the redundant `.slice(0, 8)` from line 2108: `names.map(name => ...)`.

### `input.id` and `dropdown.id` passed through `onclick` string — roundabout pattern
**Severity:** Medium
**Lines:** 2118
The inline onclick string passes element IDs as string arguments to `selectCommander`, which then calls `getElementById` to look them up again. This is a consequence of needing a globally-named function for inline handlers. A delegated listener would eliminate the need to serialise element references as string IDs.
**Action:** Refactor to a delegated `click` listener on the `dropdown` element (already in closure scope), eliminating the inline onclick and the `selectCommander` global entirely.

### `acState` object keys are strings that must match `stateKey` parameter exactly
**Severity:** Low
**Lines:** 2057–2065, 2131
The string keys `'commander'` and `'partner'` must be consistent between the `acState` initialisation, the `setupAutocomplete` call sites, and the `selectCommander` ternary. There is no type safety or validation — a typo in any of three places silently creates a new `acState` key or uses `undefined` as state.
**Action:** At minimum, validate `stateKey` against `acState` keys at the start of `setupAutocomplete`: `if (!acState[stateKey]) { console.error('Unknown stateKey:', stateKey); return; }`. Ideally, eliminate `acState` as a global and use closures.

### `catch` block uses no variable name — valid ES2019 syntax but worth documenting
**Severity:** Low
**Lines:** 2125
`} catch { hideDropdown(dropdown, state); }` uses optional catch binding (no error parameter). This is valid ES2019+ syntax and modern browsers support it, but for consistency with the rest of the file's error patterns and to enable future logging, naming the caught error is preferable.
**Action:** Change to `} catch (err) { console.warn('Autocomplete error:', err); hideDropdown(dropdown, state); }`.

### `type_line` split uses em-dash — same convention as `bfCardHTML` but undocumented
**Severity:** Low
**Lines:** 2117
`card?.type_line?.split('—')[0]?.trim()` uses the em-dash character to extract the card supertype. This is the same Scryfall convention noted in the Render Play Area review. Without a comment, it appears like an ordinary hyphen might be the intent.
**Action:** Add a comment: `// Split on em dash (Scryfall type_line format) to get the supertype`.

## Summary
The pattern issues are predominantly low severity. The most impactful change would be replacing the inline `onclick` with a delegated listener, which simultaneously eliminates the roundabout element-ID serialisation, the global `selectCommander` function, and the `escapeQuotes` XSS risk in the onclick string. The magic number `200` and `8` should be named constants.
