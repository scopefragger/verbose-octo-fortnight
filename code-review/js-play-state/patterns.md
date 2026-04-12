# Patterns Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Inline style strings in `renderManaPool` instead of CSS classes
**Severity:** Low
**Lines:** 1626, 1630
The empty-state span uses `style="color:var(--text-dim)"` and each mana pip uses a dynamic `style="color:...; font-weight:700"`. The `font-weight:700` is a magic value. The `color:var(--text-dim)` duplicates whatever the CSS class for dimmed text would be. If the mana pip appearance needs to change (e.g. size, shadow) every inline style string must be updated.
**Action:** Define a `.mana-pip` CSS class for the shared pip styles (font-weight, maybe font-size). Apply the colour via a CSS custom property or a `data-color` attribute resolved in CSS. Reserve inline styles only for the dynamic colour value.

### `MANA_COLOR_STYLES` maps mana symbols to raw hex/named colours — disconnected from CSS variables
**Severity:** Low
**Lines:** 1561
The colour values (`#e8d870`, `#4a90d9`, etc.) are hard-coded as a JS object. The rest of the UI uses CSS custom properties (e.g. `var(--text-dim)` is referenced two lines later). If the colour theme changes, this object must be updated separately from the stylesheet.
**Action:** Either define `--mana-W`, `--mana-U`, etc. CSS custom properties in the stylesheet and read them with `getComputedStyle`, or at minimum centralise the colours in one place with a comment cross-referencing the CSS file's theme section.

### Generic cost drain order in `spendMana` is implicit
**Severity:** Low
**Lines:** 1614
The drain order `['C','G','R','B','U','W']` is a magic array with no comment explaining why that order was chosen (colorless first, then colours in reverse WUBRG). The order matters for game correctness (players generally prefer to drain the least-needed colours last).
**Action:** Extract the drain order as a named constant: `const GENERIC_DRAIN_ORDER = ['C','G','R','B','U','W'];` and add a brief comment: `// drain colorless first, then least-played-last heuristic`.

### `parseMana` treats hybrid mana as generic — undocumented approximation
**Severity:** Low
**Lines:** 1588
The comment `// hybrid — count as generic` is present but does not explain the implication (may over-count the generic requirement, may under-count colored available). A reader updating this function later may not realise the heuristic is intentional.
**Action:** Expand the comment: `// hybrid symbols (e.g. {W/U}) counted as generic — conservative approximation, may reject affordable costs`.

### `manaPool` initial value duplicates `MANA_COLORS` shape manually
**Severity:** Low
**Lines:** 1558
`manaPool` is initialized as `{ W:0, U:0, B:0, R:0, G:0, C:0 }` — a literal that mirrors the `MANA_COLORS` array. If a new mana type is ever added to `MANA_COLORS`, the `manaPool` literal must also be updated manually.
**Action:** Derive `manaPool` from `MANA_COLORS`: `const manaPool = Object.fromEntries(MANA_COLORS.map(c => [c, 0]));`. `clearManaPool` already uses `MANA_COLORS.forEach` so the pattern is consistent.

## Summary
The mana logic is clear and readable overall. The main patterns concerns are the disconnection between `MANA_COLOR_STYLES` and the CSS custom-property theme, the implicit drain-order array, and the derived-but-duplicated `manaPool` initialiser. None of these are blockers, but each one is a small maintenance trap that can be closed with minimal effort.
