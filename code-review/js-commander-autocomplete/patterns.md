# Code & Pattern Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Magic number `8` for result limit appears three times
**Severity:** Low
**Lines:** 2104, 2108, 2070
The limit of 8 autocomplete results is used as a magic number on lines 2104 (`.slice(0, 8)`) and 2108 (`.slice(0, 8)`) and implicitly controls the dropdown size. Line 2070 uses `q.length < 2` as the minimum query length.
**Action:** Define `const AC_MAX_RESULTS = 8` and `const AC_MIN_QUERY_LEN = 2` at the top of the autocomplete section and reference them throughout.

### Magic number `200` for debounce delay
**Severity:** Low
**Lines:** 2071
`setTimeout(() => fetchSuggestions(...), 200)` — 200ms debounce is hard-coded.
**Action:** Define `const AC_DEBOUNCE_MS = 200` as a named constant.

### `hideDropdown` sets `innerHTML = ''` which loses any scroll position
**Severity:** Low
**Lines:** 2137
`dropdown.innerHTML = ''` is called on hide, which destroys all dropdown content. This is fine for a dismiss, but means the content cannot be restored without a re-fetch if the dropdown is re-shown (e.g., on focus). This is not a current issue but could affect UX if "show on focus" is added.
**Action:** Acceptable for current usage. Add a comment noting that `innerHTML = ''` is intentional cleanup, not just hiding.

### `selectCommander` does not validate that the selected card is actually a valid commander
**Severity:** Low
**Lines:** 2128–2133
The function accepts any name from the autocomplete and sets it as the commander input value without checking if the card is a legal commander (has the "Legendary Creature" or "can be your commander" designation). Validation at selection time would improve UX.
**Action:** Check `card.type_line.includes('Legendary')` or the Scryfall `legalities.commander` field in the preview data already fetched, and show a warning if the selected card is not a legal commander.

### Empty catch block swallows fetch errors
**Severity:** Low
**Lines:** 2125
`} catch { hideDropdown(dropdown, state); }` — all errors from fetch or JSON parsing are silently swallowed. Network errors, Scryfall API changes, and rate-limit responses are all handled the same way (hide dropdown).
**Action:** At minimum, log the error: `} catch (err) { console.error('Autocomplete fetch failed:', err); hideDropdown(dropdown, state); }`.

## Summary
The autocomplete section has several magic numbers that should be extracted to constants, an empty catch block that hides errors, and no commander-legality validation. The overall pattern is consistent and readable; the magic numbers and silent error handling are the most impactful improvements.
