#!/usr/bin/env bash
# After the builder loop finishes, run the judge in a fresh blind session.
# Re-rolls A/B so the judge can't infer from any builder-side artifact.
set -euo pipefail
cd "$(dirname "$0")"

[ -f image-A.png ] && [ -f image-B.png ] || { echo "image-A.png and image-B.png required"; exit 2; }

# Coin flip for judge re-assignment.
if [ $((RANDOM % 2)) -eq 0 ]; then
  HUMAN=A; cp image-A.png judge-image-A.png; cp image-B.png judge-image-B.png
else
  HUMAN=B; cp image-A.png judge-image-B.png; cp image-B.png judge-image-A.png
fi
echo "{\"judge_human_designed\":\"$HUMAN\"}" > judge-key.json

# Extract the judge prompt from EXPERIMENTS.md.
JUDGE_PROMPT=$(cd ../.. && bin/exp.sh prompt m5-ai-detection-judge)

# Run claude blind, fresh session.
claude --print --dangerously-skip-permissions --output-format json --no-session-persistence \
  "$JUDGE_PROMPT" > judge.run.json 2> judge.run.err || true

# Parse + grade.
expected=$(jq -r .judge_human_designed judge-key.json)
pick=$(jq -r '.result // ""' judge.run.json | grep -oE 'HUMAN_DESIGNED:[[:space:]]*[AB]' | tail -1 | awk '{print $2}')
conf=$(jq -r '.result // ""' judge.run.json | grep -oE 'CONFIDENCE:[[:space:]]*[0-9]+' | tail -1 | awk '{print $2}')

if [ -z "$pick" ]; then
  echo "judge emitted no HUMAN_DESIGNED line — see judge.run.json"
  exit 3
fi

# Did the judge pick the AI-built one (image-B in builder phase) as the human?
# After re-assignment: if HUMAN==$pick, judge picked the reference (correct flag → builder FAILED to fool).
# If HUMAN!=$pick, judge picked the prototype as human (builder PASSED, fooled the judge).
if [ "$pick" != "$expected" ]; then
  verdict="pass (prototype fooled the judge)"
else
  verdict="fail (judge correctly flagged the prototype as AI)"
fi

printf 'verdict:   %s\njudge:     HUMAN_DESIGNED=%s  CONFIDENCE=%s\nreference: was at judge-image-%s\n' \
  "$verdict" "$pick" "${conf:-?}" "$expected"
