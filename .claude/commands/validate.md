# Run Pre-Implementation Validator Protocol

Run the CEO-triaged validator panel for a proposed task. The CEO agent first reads the task and selects which expert personas are needed. Only those personas run independent reviews, discuss until all reach resolution, then synthesis produces the Final Agreed Plan with any STOP/WAIT flags.

## Steps

### 0 — CEO Triage

Read the CEO persona file and all five persona files in parallel:
- `validators/personas/ceo.md`
- `validators/personas/cecile.md`
- `validators/personas/enriqua.md`
- `validators/personas/mike.md`
- `validators/personas/bob.md`
- `validators/personas/dan.md`

Hold all six contents in context.

Spawn one Haiku agent (description="CEO — triage") with this prompt:

```
<full contents of ceo.md>

Each reviewer's domain summary:
- cecile: security, auth, data protection, cross-family leakage, children's data, secrets
- enriqua: UX, bot response clarity, discoverability, error messages, family-facing flows
- mike: architecture, service layer patterns, route consistency, error handling, maintainability
- bob: product scope, real user need, MVP sizing, whether a family member asked for this
- dan: schema design, migrations, indexes, data lifecycle, derived vs stored

TASK TO REVIEW:
$ARGUMENTS
```

Parse the JSON response. Extract the `selected` array and the `reasoning` object.

Display the CEO triage decision to the user as a table before proceeding:

```
## CEO Triage — Personas selected for: $ARGUMENTS

| Persona | Role | Decision | Reason |
|---|---|---|---|
| Cecile | BISO | ✓ Included / — Excluded | <reasoning.cecile> |
| Enriqua | UX Expert | ✓ Included / — Excluded | <reasoning.enriqua> |
| Mike | Staff Engineer | ✓ Included / — Excluded | <reasoning.mike> |
| Bob | Director of Product | ✓ Included / — Excluded | <reasoning.bob> |
| Dan | Data Engineer | ✓ Included / — Excluded | <reasoning.dan> |
```

Then continue with only the personas in `selected`.

### 1 — Read selected persona files

You already have all persona files in context from Step 0. Identify the persona files for the selected personas only. These are the only ones used in subsequent steps.

The task to review is: $ARGUMENTS

### 2 — Round 1: Independent reviews (parallel Haiku agents, selected personas only)

Spawn one Haiku agent per selected persona in a **single message** (parallel tool calls). Each agent receives the full text of their persona file followed by the task description. Use model="haiku" for all agents.

Prompt for each agent:
```
<full contents of their persona file>

TASK TO REVIEW:
$ARGUMENTS
```

Agent descriptions follow the pattern: `"<Name> — <Role> review"` (e.g. `"Cecile — BISO review"`).

Collect all responses. Label them R1-<Name> for each selected persona.

### 3 — Discussion loop (parallel rounds, continue until complete)

Run discussion rounds in a loop. Each round spawns one Haiku agent per **selected** persona in a **single message** (parallel tool calls).

Build the full discussion history by appending each completed round to the prior accumulated history.

Prompt structure for each agent in each discussion round:
```
<full contents of their persona file>

TASK TO REVIEW:
$ARGUMENTS

--- ROUND 1 INDEPENDENT REVIEWS ---
[<Name> — <Role>]: <R1-Name>
... (one entry per selected persona)

--- ROUND 2 DISCUSSION ---       ← append each completed round here in order
[<Name> — <Role>]: <R2-Name>
... (one entry per selected persona)

... (continue appending rounds as they complete)

---
You have read the full discussion above. In under 250 words: raise any NEW concerns triggered by what you just read, respond directly to concerns that fall in your domain, or state "No further concerns from [your role] perspective" if you have nothing to add. Do not repeat concerns already raised.
```

Label each round's responses RN-<Name> (N = round number: 2, 3, 4…).

**Termination:** After each round, check all selected personas' responses. If ALL selected personas have said "No further concerns from [role] perspective" (or clearly equivalent), exit the loop. Otherwise run another round with the full accumulated history appended.

### 4 — Synthesis (single Haiku agent)

Once the discussion loop is complete, spawn one final Haiku agent with a neutral facilitator prompt. Include ALL rounds' outputs in full — Round 1 independent reviews plus every discussion round in chronological order. List only the personas that participated.

Prompt:
```
You are a neutral synthesis facilitator. An expert panel has reviewed a proposed task for a Node.js family assistant app and discussed it until reaching resolution. The panel was selected by a CEO triage step — only the relevant experts participated. All outputs are below.

TASK REVIEWED: $ARGUMENTS

PANEL MEMBERS: <comma-separated list of selected persona names and roles>

--- ROUND 1 INDEPENDENT REVIEWS ---
[<Name> — <Role>]: <R1-Name>
... (one entry per selected persona)

--- ROUND 2 DISCUSSION ---
[<Name> — <Role>]: <R2-Name>
...

... (all subsequent rounds appended in order)

---
Produce a synthesis under 400 words with exactly three sections:

**1. TOP CROSS-CUTTING CONCERNS**
The concerns that two or more personas agreed must be addressed (or the single most critical concern if only one persona participated). Number them. Be concrete — name the specific risk, not a category.

**2. RECOMMENDED IMPLEMENTATION APPROACH**
A concrete, actionable approach that resolves the tensions identified. Describe what to build, in what order, and what constraints to respect.

**3. STOP/WAIT FLAGS**
Issues that MUST be resolved before any code is written. If none, write exactly: "None — safe to proceed."
```

### 5 — Present results to the user

Present the validator output in this order:

1. The CEO triage table was already printed in Step 0.

2. Print the heading: `## Validator Protocol — Results for: $ARGUMENTS`

3. Print a summary table of each **selected** persona's Round 1 recommendation. Extract the GO / CONDITIONAL GO / STOP verdict from each R1 response:

   | Persona | Role | R1 Verdict |
   |---|---|---|
   | <selected personas only> | ... | ... |

4. Note how many discussion rounds were needed before all selected personas reached resolution.

5. Print the full synthesis output under the heading `## Final Agreed Plan`.

6. If the **STOP/WAIT FLAGS** section contains anything other than "None — safe to proceed", print a prominent warning block:

   > **STOP — Do not write any code until the following is resolved:**
   > `<flags verbatim from synthesis>`

   Then tell the user: "The validator has raised STOP/WAIT flags. Resolve the items above before requesting any implementation. Once resolved, re-run `/validate` with the updated task description."

7. If there are no STOP/WAIT flags, tell the user: "No blocking issues. The Final Agreed Plan above should guide the implementation approach."
