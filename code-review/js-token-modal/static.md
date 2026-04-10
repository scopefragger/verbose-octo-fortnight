# Static Code Review — js-token-modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `escapeHtml(JSON.stringify(t))` misused for onclick argument
**Severity:** High
**Lines:** 2029
`JSON.stringify(t)` serialises the token object to a JSON string, and then `escapeHtml()` is applied before embedding it into the `onclick` attribute. `escapeHtml` converts `"` to `&quot;`, `<` to `&lt;`, etc. — which are HTML entity encodings, not JavaScript string escaping. The browser will decode these entities back to characters when the attribute is parsed, so the onclick *may* work in some cases, but this is fragile and incorrect.

The correct approach is to escape the string for use in an HTML attribute AND as a JavaScript string argument. Passing a full object literal in an onclick attribute is generally error-prone.
**Action:** Store the token preset data by index rather than embedding the full object: `onclick="addTokenPreset(${i})"` and look up `COMMON_TOKENS[i]` inside `addTokenPreset()`.

### Unused variable `pt` in `showTokenModal`
**Severity:** Low
**Lines:** 2027
`const pt = t.power != null ? \` ${t.power}/${t.toughness}\` : '';` is computed but never used in the returned button HTML. It is dead code.
**Action:** Remove the unused `pt` variable, or use it in the button label if power/toughness display is desired.

### `closeTokenModal` requires click on the backdrop element specifically
**Severity:** Low
**Lines:** 2034–2037
The modal is only closed if the click target is exactly the modal overlay element itself. Clicks on child elements (e.g., the modal content area) do not bubble up as the same target. This means clicking the content area when you intend to close by clicking outside will not close the modal — which is actually the correct behavior. However, a user clicking on the backdrop padding area outside the content box may find the modal hard to close if the content box fills most of the overlay.
**Action:** Verify the overlay vs. content layout to ensure the click target check works correctly for the intended UX.

## Summary
The critical issue is the misuse of `escapeHtml` for JavaScript object serialisation in an onclick attribute. This is incorrect — `escapeHtml` is for HTML encoding, not JavaScript argument encoding. The unused `pt` variable is dead code.
