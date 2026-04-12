# Static Review — JS Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeQuotes` mixes encoding domains unsafely
**Severity:** Medium
**Lines:** 2145–2147
`escapeQuotes` simultaneously backslash-escapes single quotes (`\'`) and HTML-entity-encodes double quotes (`&quot;`). These two outputs belong to different contexts — backslash escaping is for JavaScript string literals, HTML entities are for HTML attribute values. Mixing them in one function means neither use-case is fully correct. Callers that embed the result inside a JS string in an `onclick` attribute (the primary use-case) get `&quot;` where they expect `"` or `\"`, and callers in a pure HTML context get unwanted backslashes.
**Action:** Split into two purpose-built helpers: `escapeForJsString(str)` (backslash-escape `'` and `"`) and rely on `escapeHtml` for HTML attribute output. Audit all call-sites and replace accordingly.

### `showToast` does not guard against a missing `#toast` element
**Severity:** Low
**Lines:** 2151–2155
`document.getElementById('toast')` can return `null` if the element is absent or the function is called before the DOM is ready. The subsequent `.textContent` and `.className` assignments would throw a `TypeError`, crashing silently with no feedback to the user.
**Action:** Add a null guard: `if (!el) return;` immediately after the `getElementById` call.

### `toastTimer` is a module-level mutable variable
**Severity:** Low
**Lines:** 2149**
`toastTimer` is declared with `let` at script scope, making it a global mutable side-effect that any other code could overwrite. While harmless today given the single-file structure, it is an accidental global and inconsistent with other state which is kept in more deliberate variables.
**Action:** Move `toastTimer` inside a closure or convert `showToast` into an IIFE that captures it: `const showToast = (() => { let timer; return (msg, isError) => { … }; })();`

### SEGMENTS.MD description mismatch — `formatManaCostShort` not in these lines
**Severity:** Low
**Lines:** 2141–2156
The SEGMENTS.MD description for this segment lists `formatManaCostShort()` as belonging here, but the function is actually defined at line 1642. The segment boundary is inaccurate.
**Action:** No code change needed. Update the segment description for documentation accuracy; any future refactor moving utilities together should also move `formatManaCostShort` here.

## Summary
The utility block is small and largely correct but `escapeQuotes` has a subtle mixed-encoding defect that compromises its safety in all call-sites. The toast helper is robust in practice but lacks a null guard. Both issues are straightforward to fix.
