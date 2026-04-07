# Patterns Review — Sidebar Import Pane
Lines: 796–829 | File: public/mtg-commander.html

## Findings

### Inline `style` on Save button
**Severity:** Low
**Lines:** 827
`style="margin-left:auto"` is applied directly to the Save button to push it to the right of the action row. This is the only inline style in the segment. The codebase otherwise uses CSS classes exclusively, so this is an inconsistency that makes the layout rule invisible to any stylesheet audit or theming pass.
**Action:** Extract to a CSS class (e.g., `.btn-push-right { margin-left: auto; }`) and apply it as a class attribute, keeping all layout logic in the stylesheet.

### Multi-line placeholder text in textarea
**Severity:** Low
**Lines:** 810–820
The `placeholder` attribute spans ten lines of the source file using literal newlines. While browsers render this correctly, it makes the HTML harder to scan and diff — a 10-line attribute value is visually indistinguishable from surrounding markup at a glance. There is also no standard way to comment or maintain it separately.
**Action:** This is acceptable for a single-file app. If the file grows harder to maintain, consider moving the placeholder string to a JS constant and setting it via `document.getElementById('decklist-input').placeholder = PLACEHOLDER_TEXT`.

### `import-hint` hint text is a raw `<div>` with no semantic role
**Severity:** Low
**Lines:** 821
The import hint ("One card per line…") is a plain `<div>`. Assistive technologies may not associate it with the textarea above it. Using `<p>` or adding `role="note"` / `aria-describedby` on the textarea would improve accessibility and convey semantics more clearly.
**Action:** Replace `<div class="import-hint">` with `<p class="import-hint" id="decklist-hint">` and add `aria-describedby="decklist-hint"` to the `#decklist-input` textarea.

### No `aria-label` or `<label>` elements for any input
**Severity:** Medium
**Lines:** 798, 802, 806, 810
None of the four inputs (`#deck-name`, `#commander-input`, `#partner-input`, `#decklist-input`) have associated `<label>` elements or `aria-label` attributes. Placeholders disappear on input and are not a substitute for labels. Screen readers will announce these fields with no useful name.
**Action:** Add `<label for="...">` elements (visually hidden with a CSS utility class if the design requires no visible labels) or `aria-label` attributes for each input.

## Summary
The segment has one inline style inconsistency and a missing accessible-label pattern affecting all four inputs — the medium severity finding. The multi-line placeholder and the semantic div are minor readability and accessibility refinements. None of these affect runtime behaviour, but the missing labels are worth addressing for accessibility compliance.
