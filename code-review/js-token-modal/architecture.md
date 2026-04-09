# Architecture Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Token object passed by serialization through onclick — tightly couples template to data shape
**Severity:** Medium
**Lines:** 2029
Passing the entire token object serialized through an `onclick` attribute creates tight coupling between the HTML template and the `addToken` function's expected input shape. If the token object's structure changes, the serialized string in the onclick must also change. Using an index-based lookup (e.g. `addToken(${i})` + `COMMON_TOKENS[i]`) would be more robust.
**Action:** Replace object serialization with an index: `onclick="addToken(${i})"` and update `addToken` to receive and look up the index from `COMMON_TOKENS`.

### Modal open/close state managed through CSS class only
**Severity:** Low
**Lines:** 2031, 2036
The token modal uses `.classList.remove('hidden')` to open and `.classList.add('hidden')` to close. This is consistent with the graveyard viewer pattern. No JS variable tracks whether the modal is open.
**Action:** No action required; this is the consistent pattern in this file.

## Summary
The token modal section is small and its main architectural issue is the object-serialization-through-onclick anti-pattern, which creates a fragile coupling between the data shape and the HTML template. Switching to an index-based approach would eliminate both this coupling and the related security issue.
