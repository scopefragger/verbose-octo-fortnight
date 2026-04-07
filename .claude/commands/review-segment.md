# Review Next Code Segment

Review the next unprocessed segment from `SEGMENTS.MD`, perform a full code review, produce an action plan, save it to `/code-review/`, and remove the processed row from `SEGMENTS.MD`.

## Steps

### 1 — Find the next segment row

Read `SEGMENTS.MD`. Skip the header lines (the `#`, `File:`, `---`, `##`, and table header rows). Find the **first data row** — a table row that starts with `| <number>` — in the first table that still has rows. This is the target segment.

Extract from that row:
- **section_name** — the section name (second column), converted to a safe folder name: lowercase, spaces replaced with hyphens, special chars stripped. Prefix with the block type (css, html, or js) based on which table it appears in. Example: `js-play-core`, `css-reset-and-variables`, `html-header-bar`.
- **lines** — the line range (third column), e.g. `1664–1841`
- **description** — the description (fourth column)

### 2 — Read the code

Read those lines from `public/mtg-commander.html` using the extracted line range.

### 3 — Perform the review

Analyse the code across four lenses:

**A. Static Code Review**
- Undefined variables or functions referenced but not declared
- Dead code (unreachable branches, unused variables)
- Off-by-one errors, incorrect array indexing
- Missing null/undefined guards where they matter
- Inconsistent naming conventions

**B. Security Review**
- XSS risks — unescaped user/API data injected into innerHTML
- Injection risks in API calls
- Sensitive data exposure (secrets in JS, logged to console)
- Auth bypass risks in client-side logic

**C. Architecture Review**
- Responsibilities that don't belong in this section
- Tight coupling — functions reaching into state they shouldn't own
- Missing separation between render and mutation logic
- Duplication of logic found elsewhere in the file

**D. Code & Pattern Review**
- Magic numbers or strings that should be constants
- Inline styles or styles that duplicate existing CSS classes
- Overly complex conditionals that could be simplified
- Inconsistent patterns versus other similar sections
- Missing or misleading comments

### 4 — Write the action plan

Create the directory `code-review/<section_name>/` and write one markdown file per review lens:

- `code-review/<section_name>/static.md` — findings and recommended actions from Static review
- `code-review/<section_name>/security.md` — findings and recommended actions from Security review
- `code-review/<section_name>/architecture.md` — findings and recommended actions from Architecture review
- `code-review/<section_name>/patterns.md` — findings and recommended actions from Patterns review

Each file should use this structure:
```
# <Lens> Review — <Section Name>
Lines: <range> | File: public/mtg-commander.html

## Findings

### <Finding title>
**Severity:** Low / Medium / High
**Lines:** <specific line numbers if known>
<Description of the issue>
**Action:** <What should be done to fix or improve it>

...repeat for each finding...

## Summary
<1–3 sentence overall assessment>
```

If a lens has no findings, write a single line: `No issues found.`

### 5 — Remove the processed row from SEGMENTS.MD

Edit `SEGMENTS.MD` to delete the row for the segment just reviewed. Do not modify any other rows, headers, or sections. If deleting that row leaves a table with only its header row and no data rows, also remove that table's header row and the preceding `##` heading line.

### 6 — Report back

Tell the user:
- Which segment was reviewed
- How many findings were recorded across all four lenses
- The path to the saved files
- How many segments remain in `SEGMENTS.MD`
