# Static Review — js-token-modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Dead variable `pt`
**Severity:** Medium
**Lines:** 2027, 2029
`const pt = t.power != null ? \` ${t.power}/${t.toughness}\` : '';` is assigned but never used. The button label on line 2029 only includes `t.name` and `fly`, never `pt`. The P/T stat is silently omitted from the button.
**Action:** Either use `pt` in the button label (e.g., `${t.name}${pt}${fly}`) so players can distinguish token sizes, or remove the variable.

### `closeTokenModal` does not close when called from a button inside the modal
**Severity:** Medium
**Lines:** 2034–2037
```js
if (e.target === document.getElementById('token-modal')) { ... }
```
The function only closes when `e.target` is the modal backdrop itself. If a "Close" button inside the modal calls `closeTokenModal(event)`, the target would be the button (not the modal), and the modal would not close. Verify whether the HTML close button calls this function or a different one.
**Action:** If the close button uses this function, change the check to `e.target.closest('#token-modal') && !e.target.closest('.token-modal-content')`, or provide a parameterless `forceCloseTokenModal()` for button use.

## Summary
Two functional issues: a dead `pt` variable that silently drops P/T from button labels, and `closeTokenModal`'s `e.target` check that may prevent button-triggered closure depending on the HTML wiring.
