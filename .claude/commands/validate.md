# Run Pre-Implementation Validator Protocol

Run the 5-persona validator panel for a proposed task. Reads all persona files, runs independent reviews, then a looping discussion until all personas reach resolution, then synthesis. Presents the Final Agreed Plan with any STOP/WAIT flags.

## Steps

### 1 — Read all persona files

Read all five persona files in parallel:
- `validators/personas/cecile.md`
- `validators/personas/enriqua.md`
- `validators/personas/mike.md`
- `validators/personas/bob.md`
- `validators/personas/dan.md`

Hold all five contents in context — they will be interpolated into agent prompts in the steps below.

The task to review is: $ARGUMENTS

### 2 — Round 1: Independent reviews (5 parallel Haiku agents)

Spawn all five Haiku agents in a **single message** (parallel tool calls). Each agent receives the full text of their persona file followed by the task description. Use model="haiku" for all agents.

Prompt for each agent:
```
<full contents of their persona file>

TASK TO REVIEW:
$ARGUMENTS
```

Agents to spawn:
- description="Cecile — BISO review"
- description="Enriqua — UX review"
- description="Mike — Staff Engineer review"
- description="Bob — Director of Product review"
- description="Dan — Data Engineer review"

Collect all five responses. Label them R1-Cecile, R1-Enriqua, R1-Mike, R1-Bob, R1-Dan.

### 3 — Discussion loop (parallel rounds, continue until complete)

Run discussion rounds in a loop. Each round spawns all five Haiku agents in a **single message** (parallel tool calls).

Build the full discussion history by appending each completed round to the prior accumulated history.

Prompt structure for each agent in each discussion round:
```
<full contents of their persona file>

TASK TO REVIEW:
$ARGUMENTS

--- ROUND 1 INDEPENDENT REVIEWS ---
[Cecile — BISO]: <R1-Cecile>
[Enriqua — UX Expert]: <R1-Enriqua>
[Mike — Staff Engineer]: <R1-Mike>
[Bob — Director of Product]: <R1-Bob>
[Dan — Data Engineer]: <R1-Dan>

--- ROUND 2 DISCUSSION ---       ← append each completed round here in order
[Cecile — BISO]: <R2-Cecile>
[Enriqua — UX Expert]: <R2-Enriqua>
[Mike — Staff Engineer]: <R2-Mike>
[Bob — Director of Product]: <R2-Bob>
[Dan — Data Engineer]: <R2-Dan>

... (continue appending rounds as they complete)

---
You have read the full discussion above. In under 250 words: raise any NEW concerns triggered by what you just read, respond directly to concerns that fall in your domain, or state "No further concerns from [your role] perspective" if you have nothing to add. Do not repeat concerns already raised.
```

Label each round's responses RN-Cecile, RN-Enriqua, RN-Mike, RN-Bob, RN-Dan (N = round number: 2, 3, 4…).

**Termination:** After each round, check all five responses. If ALL five have said "No further concerns from [role] perspective" (or clearly equivalent), exit the loop. Otherwise run another round with the full accumulated history appended.

### 4 — Synthesis (single Haiku agent)

Once the discussion loop is complete, spawn one final Haiku agent with a neutral facilitator prompt. Include ALL rounds' outputs in full — Round 1 independent reviews plus every discussion round in chronological order.

Prompt:
```
You are a neutral synthesis facilitator. A 5-persona expert panel has reviewed a proposed task for a Node.js family assistant app and discussed it until reaching resolution. All outputs are below.

--- ROUND 1 INDEPENDENT REVIEWS ---
[Cecile — BISO]: <R1-Cecile>
[Enriqua — UX Expert]: <R1-Enriqua>
[Mike — Staff Engineer]: <R1-Mike>
[Bob — Director of Product]: <R1-Bob>
[Dan — Data Engineer]: <R1-Dan>

--- ROUND 2 DISCUSSION ---
[Cecile — BISO]: <R2-Cecile>
[Enriqua — UX Expert]: <R2-Enriqua>
[Mike — Staff Engineer]: <R2-Mike>
[Bob — Director of Product]: <R2-Bob>
[Dan — Data Engineer]: <R2-Dan>

... (all subsequent rounds appended in order)

---
Produce a synthesis under 400 words with exactly three sections:

**1. TOP 3 CROSS-CUTTING CONCERNS**
The three concerns that two or more personas agreed must be addressed. Number them. Be concrete — name the specific risk, not a category.

**2. RECOMMENDED IMPLEMENTATION APPROACH**
A concrete, actionable approach that resolves the tensions identified. Describe what to build, in what order, and what constraints to respect.

**3. STOP/WAIT FLAGS**
Issues that MUST be resolved before any code is written. If none, write exactly: "None — safe to proceed."
```

### 5 — Present results to the user

Present the validator output in this order:

1. Print the heading: `## Validator Protocol — Results for: $ARGUMENTS`

2. Print a summary table of each persona's Round 1 recommendation. Extract the GO / CONDITIONAL GO / STOP verdict from each R1 response:

   | Persona | Role | R1 Verdict |
   |---|---|---|
   | Cecile | BISO | ... |
   | Enriqua | UX Expert | ... |
   | Mike | Staff Engineer | ... |
   | Bob | Director of Product | ... |
   | Dan | Data Engineer | ... |

3. Note how many discussion rounds were needed before all personas reached resolution.

4. Print the full synthesis output under the heading `## Final Agreed Plan`.

5. If the **STOP/WAIT FLAGS** section contains anything other than "None — safe to proceed", print a prominent warning block:

   > **STOP — Do not write any code until the following is resolved:**
   > `<flags verbatim from synthesis>`

   Then tell the user: "The validator has raised STOP/WAIT flags. Resolve the items above before requesting any implementation. Once resolved, re-run `/validate` with the updated task description."

6. If there are no STOP/WAIT flags, tell the user: "No blocking issues. The Final Agreed Plan above should guide the implementation approach."
