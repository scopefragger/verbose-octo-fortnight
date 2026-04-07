# Security Review — Hand Simulator Panel
Lines: 876–895 | File: public/mtg-commander.html

## Findings

### `critique-text` div is a potential XSS sink
**Severity:** High
**Lines:** 893
`<div id="critique-text">` is the element into which `critiqueHand()` writes the Groq LLM response. If that function uses `innerHTML` (rather than `textContent` or a safe renderer) to inject the AI-generated text, any HTML/script in the model response would execute in the page context. LLM outputs are attacker-controllable via prompt injection — a crafted deck name or card name passed to the model could embed `<script>` or event-handler payloads.
**Action:** Verify that `critiqueHand()` writes only via `textContent` or passes output through `escapeHtml()` (which exists at JS line ~2141) before assigning to `innerHTML`. If markdown rendering is needed, use a sanitised renderer (e.g., DOMPurify + marked).

### Inline `onclick` handlers with no input validation surface
**Severity:** Low
**Lines:** 880–883
`onclick="drawHand()"`, `onclick="mulligan()"`, etc. call global functions directly. While this is not exploitable in isolation, it means any global-scope pollution (e.g., from a CDN script or browser extension) could shadow these names. There are no secrets or data passed through the attributes themselves, so the direct injection risk is low.
**Action:** Low priority — consider migrating to `addEventListener` bindings in the JS init block, consistent with the rest of the application's event model.

## Summary
The primary security concern is the `critique-text` div: if the JS layer writes LLM output via `innerHTML` rather than `textContent`/`escapeHtml()`, this is a real XSS vector via prompt injection. The inline `onclick` attributes are a minor hygiene issue with no direct exploit path. No secrets are present in this HTML fragment.
