#!/bin/bash
# Self-heal detector: injects a CLAUDE.md update reminder when the user asks
# about architecture, patterns, or design flows not yet documented.

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // ""' 2>/dev/null | tr '[:upper:]' '[:lower:]')

# Match questions that reveal undocumented knowledge gaps
if echo "$PROMPT" | grep -qE \
  "how does|how do i|how do we|what is the pattern|what pattern|what are the rules|what convention|what standard|architecture|design flow|walk me through|explain (the|how)|how (should|to) (add|create|build|implement|structure|handle|use)|what.s the (best|right|correct) way|where (do|does|should)|how (is|are) .* (structured|organized|handled|stored|called)"; then
  printf '%s' '{
    "hookSpecificOutput": {
      "hookEventName": "UserPromptSubmit",
      "additionalContext": "SELF-HEAL: The user asked something that may reveal a gap in CLAUDE.md. After answering, check if this information (pattern, rule, design decision, or architectural detail) is already covered in CLAUDE.md. If it is not, append or update the relevant section BEFORE finishing your response. Keep additions factual and concise — one or two sentences is enough."
    }
  }'
fi
