#!/usr/bin/env bash
# run-m2 — run all m2 experiments against an origin in a fixed-size parallel pool.
# Usage: bin/run-m2.sh <origin> [POOL=6]
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ORIGIN=${1:?usage: run-m2 <origin>}
POOL=${POOL:-6}

ids=$("$ROOT/bin/exp.sh" ids | grep '^m2-')
total=$(echo "$ids" | wc -l | tr -d ' ')

echo ">> prep: capturing baseline screenshot for origin=$ORIGIN"
"$ROOT/bin/exp.sh" prep "$ORIGIN" >&2

echo ">> scaffold: $total experiments (sequential, avoids port-race)"
for id in $ids; do
  name="${id}-${ORIGIN}"
  if [ -d "$ROOT/experiment/$name" ]; then
    echo "   reusing $name"
  else
    "$ROOT/bin/exp.sh" new "$id" "$ORIGIN" >/dev/null
    echo "   scaffolded $name"
  fi
done

echo ">> run: pool=$POOL, $total experiments → expect ~$(( (total + POOL - 1) / POOL * 8 )) min"
# Each subprocess prints "done: <dir>" when finished.
echo "$ids" | xargs -I{} -P "$POOL" -n 1 "$ROOT/bin/exp.sh" run {} "$ORIGIN" 2>&1
echo ">> all done"
