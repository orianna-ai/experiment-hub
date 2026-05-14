#!/usr/bin/env bash
# exp — spin up, serve, and snapshot visual-design experiments.
# See EXPERIMENTS.md for the experiment registry.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXPERIMENTS_MD="$ROOT/EXPERIMENTS.md"
GROUNDINGS_REL="../../grounding/twenty"
SCRATCH_PORT="${SCRATCH_PORT:-5199}"
VIEWPORT="${VIEWPORT:-1440,900}"

die() { echo "error: $*" >&2; exit 1; }

# write_state <experiment-dir> <state> — one of not-started|running|finished|failed
write_state() {
  local dir=$1 state=$2 ts; ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  jq -n --arg state "$state" --arg ts "$ts" \
    '{state: $state, updated_at: $ts}' > "$dir/state.json"
}

# Pull the `> /goal ...` quote block under `### \`<id>\``. Joins consecutive `>` lines.
# Empty quote lines (paragraph breaks) collapse to a single space.
extract_prompt() {
  local id=$1
  awk -v id="$id" '
    $0 ~ "^### `"id"`$" { found=1; next }
    found && /^> / {
      line=$0; sub(/^> /, "", line); gsub(/`/, "", line);
      out = out ? out " " line : line;
      next
    }
    found && /^>$/ { next }
    found && out { print out; exit }
  ' "$EXPERIMENTS_MD"
}

allocate_port() {
  local max
  max=$(grep -h '^PORT=' "$ROOT"/experiment/*/.env 2>/dev/null \
        | awk -F= '{print $2}' | sort -n | tail -1)
  echo $(( ${max:-5199} + 1 ))
}

working_copy_dir() {
  local dir=$1
  find "$dir" -maxdepth 1 -type d -name 'cp_of_*' | head -1
}

screenshot() {
  local url=$1 out=$2
  npx --yes playwright screenshot --viewport-size="$VIEWPORT" --wait-for-timeout=1500 "$url" "$out"
}

serve_bg() {
  local app_dir=$1 port=$2 pidfile=$3
  # Refuse to spawn if the port is already occupied — otherwise our vite would silently
  # fail (--strictPort) and curl would happily get answers from whatever was already
  # bound, corrupting screenshots taken against $port.
  if lsof -ti :"$port" >/dev/null 2>&1; then
    die "port $port already in use — refusing to spawn (would race with existing server)"
  fi
  ( cd "$app_dir" && [ -d node_modules ] || pnpm install )
  ( cd "$app_dir" && pnpm exec vite --port "$port" --strictPort >/tmp/exp-$port.log 2>&1 & echo $! > "$pidfile" )
  # Wait for the server, *and* verify the PID we spawned owns the port.
  local spawned_pid; spawned_pid=$(cat "$pidfile" 2>/dev/null)
  for _ in $(seq 1 80); do
    sleep 0.25
    if curl -sf "http://localhost:$port/" >/dev/null; then
      local owner; owner=$(lsof -ti :"$port" 2>/dev/null)
      # Match if the owner pid is the one we spawned OR a descendant of it.
      if [ -n "$owner" ] && { [ "$owner" = "$spawned_pid" ] || pgrep -P "$spawned_pid" 2>/dev/null | grep -qx "$owner"; }; then
        return 0
      fi
    fi
  done
  die "dev server on $port never came up cleanly — see /tmp/exp-$port.log"
}

stop_bg() {
  local pidfile=$1
  [ -f "$pidfile" ] || return 0
  kill "$(cat "$pidfile")" 2>/dev/null || true
  rm -f "$pidfile"
}

cmd_new() {
  local id=${1:-} origin=${2:-}
  [ -n "$id" ] && [ -n "$origin" ] || die "usage: exp new <experiment-id> <origin>"
  [ -d "$ROOT/origin/$origin" ] || die "origin not found: $ROOT/origin/$origin"

  local name="${id}-${origin}"
  local dir="$ROOT/experiment/$name"
  [ -e "$dir" ] && die "experiment dir already exists: $dir"

  local prompt
  prompt=$(extract_prompt "$id")
  [ -n "$prompt" ] || die "no prompt found for id '$id' in EXPERIMENTS.md"

  local port
  port=$(allocate_port)

  mkdir -p "$dir/screenshots"
  echo "PORT=$port" > "$dir/.env"
  cp -R "$ROOT/origin/$origin" "$dir/cp_of_$origin"

  # Reuse cached before.png if origin has one (avoids re-serving origin per run).
  local cached="$ROOT/origin/$origin/.cached-before.png"
  [ -f "$cached" ] && cp "$cached" "$dir/screenshots/before.png"

  prompt="${prompt//<URL>/http://localhost:$port/}"
  prompt="${prompt//<GROUNDINGS>/$GROUNDINGS_REL}"
  printf '%s\n' "$prompt" > "$dir/prompt.md"

  cat > "$dir/findings.md" <<EOF
# $id · $origin

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement
TBD

## Cost
- wall time:
- tokens:

## How Claude achieved it
TBD

## Prompt
\`\`\`
$prompt
\`\`\`
EOF

  write_state "$dir" "not-started"
  echo "created $dir (port $port)"
  echo
  echo "next:"
  echo "  bin/exp.sh before $name     # snapshot origin"
  echo "  bin/exp.sh serve  $name     # run dev server on $port"
  echo "  # paste $dir/prompt.md into Claude (point it at $dir/cp_of_$origin)"
  echo "  bin/exp.sh after  $name     # snapshot working copy"
}

cmd_before() {
  local name=${1:-}; [ -n "$name" ] || die "usage: exp before <name>"
  local dir="$ROOT/experiment/$name"
  local wc; wc=$(working_copy_dir "$dir") || die "no cp_of_* in $dir"
  local origin; origin=$(basename "$wc" | sed 's/^cp_of_//')
  local pidfile="/tmp/exp-before-$$.pid"

  serve_bg "$ROOT/origin/$origin" "$SCRATCH_PORT" "$pidfile"
  trap "stop_bg $pidfile" EXIT
  screenshot "http://localhost:$SCRATCH_PORT/" "$dir/screenshots/before.png"
  stop_bg "$pidfile"; trap - EXIT
  echo "wrote $dir/screenshots/before.png"
}

cmd_after() {
  local name=${1:-}; [ -n "$name" ] || die "usage: exp after <name>"
  local dir="$ROOT/experiment/$name"
  # shellcheck disable=SC1091
  source "$dir/.env"
  curl -sf "http://localhost:$PORT/" >/dev/null \
    || die "nothing serving on $PORT — run: bin/exp.sh serve $name"
  screenshot "http://localhost:$PORT/" "$dir/screenshots/after.png"
  echo "wrote $dir/screenshots/after.png"
}

cmd_serve() {
  local name=${1:-}; [ -n "$name" ] || die "usage: exp serve <name>"
  local dir="$ROOT/experiment/$name"
  local wc; wc=$(working_copy_dir "$dir") || die "no cp_of_* in $dir"
  # shellcheck disable=SC1091
  source "$dir/.env"
  ( cd "$wc" && [ -d node_modules ] || pnpm install )
  cd "$wc"
  exec pnpm exec vite --port "$PORT" --strictPort
}

cmd_prompt() {
  local id=${1:-}; [ -n "$id" ] || die "usage: exp prompt <experiment-id>"
  extract_prompt "$id"
}

cmd_ids() {
  awk '/^### `m[0-9].*`$/ { gsub(/[`#]/,""); gsub(/^ +| +$/,""); print }' "$EXPERIMENTS_MD"
}

cmd_run() {
  local id=${1:-} origin=${2:-}
  [ -n "$id" ] && [ -n "$origin" ] || die "usage: exp run <experiment-id> <origin>"
  command -v claude >/dev/null || die "claude CLI not on PATH"
  command -v jq >/dev/null || die "jq not on PATH"

  local name="${id}-${origin}"
  local dir="$ROOT/experiment/$name"
  if [ ! -d "$dir" ]; then
    cmd_new "$id" "$origin"
  fi
  if [ ! -f "$dir/screenshots/before.png" ]; then
    cmd_before "$name"
  fi

  # shellcheck disable=SC1091
  source "$dir/.env"

  # Background-serve the working copy.
  local pidfile="$dir/.serve.pid"
  ( cd "$dir/cp_of_$origin" && [ -d node_modules ] || pnpm install )
  ( cd "$dir/cp_of_$origin" && pnpm exec vite --port "$PORT" --strictPort >"$dir/.serve.log" 2>&1 & echo $! > "$pidfile" )
  trap '[ -f "$pidfile" ] && kill "$(cat "$pidfile")" 2>/dev/null; rm -f "$pidfile"' EXIT
  for _ in $(seq 1 80); do
    sleep 0.25
    curl -sf "http://localhost:$PORT/" >/dev/null && break
  done
  curl -sf "http://localhost:$PORT/" >/dev/null || die "working-copy server didn't come up — see $dir/.serve.log"

  # Run claude headlessly. cwd = experiment dir so the agent sees prompt.md / findings.md / cp_of_*/ siblings.
  local blind=0
  [[ "$id" == m3-* ]] && blind=1

  local preamble
  if [ "$blind" = 1 ]; then
    preamble="You are running an unattended BLIND experiment.

- The prototype is rendered live at the URL in the prompt below — inspect it interactively in the browser. The dev server reflects the working-copy source, but you should NOT read or modify that source.
- Do NOT read the working-copy source at ./cp_of_$origin/.
- Do NOT read the reference codebase under ../../grounding/.
- When you finish, write your analysis to ./findings.md by filling in the 'Goal achievement' and 'How Claude achieved it' sections. Leave the Screenshots, Cost, and Prompt sections alone — the harness fills those in.

Prompt:
"
  else
    preamble="You are running an unattended experiment.

- The prototype source to edit lives in ./cp_of_$origin/ (the dev server is already running at the URL in the prompt below — edits hot-reload).
- Read-only reference codebase: ../../grounding/twenty/.
- When you finish, fill in the 'Goal achievement' and 'How Claude achieved it' sections of ./findings.md. Leave the Screenshots, Cost, and Prompt sections alone — the harness fills those in.

Prompt:
"
  fi
  local full_prompt; full_prompt="${preamble}$(cat "$dir/prompt.md")"

  write_state "$dir" "running"
  local start_ts; start_ts=$(date +%s)
  local exit_code=0
  if [ "$blind" = 1 ]; then
    ( cd "$dir" && claude --print \
        --dangerously-skip-permissions \
        --output-format json \
        --no-session-persistence \
        ${EXP_MODEL:+--model "$EXP_MODEL"} \
        ${EXP_BUDGET_USD:+--max-budget-usd "$EXP_BUDGET_USD"} \
        "$full_prompt" \
      > "$dir/.run.json" 2>"$dir/.run.err" ) || exit_code=$?
  else
    ( cd "$dir" && claude --print \
        --dangerously-skip-permissions \
        --add-dir "cp_of_$origin" \
        --add-dir "$ROOT/grounding/twenty" \
        --output-format json \
        --no-session-persistence \
        ${EXP_MODEL:+--model "$EXP_MODEL"} \
        ${EXP_BUDGET_USD:+--max-budget-usd "$EXP_BUDGET_USD"} \
        "$full_prompt" \
      > "$dir/.run.json" 2>"$dir/.run.err" ) || exit_code=$?
  fi
  local end_ts; end_ts=$(date +%s)
  local duration=$((end_ts - start_ts))

  cmd_after "$name" || true
  kill "$(cat "$pidfile")" 2>/dev/null || true
  rm -f "$pidfile"
  trap - EXIT

  write_cost "$dir" "$duration"

  local is_error="true"
  if [ -s "$dir/.run.json" ]; then
    is_error=$(jq -r '.is_error // false' "$dir/.run.json" 2>/dev/null || echo true)
  fi
  if [ $exit_code -eq 0 ] && [ "$is_error" = "false" ]; then
    write_state "$dir" "finished"
  else
    write_state "$dir" "failed"
  fi

  echo
  echo "done: $dir"
  local mins=$((duration / 60)) secs=$((duration % 60))
  local cost_usd; cost_usd=$(jq -r '.cost_usd // 0' "$dir/cost.json" 2>/dev/null || echo 0)
  local turns; turns=$(jq -r '.turns // 0' "$dir/cost.json" 2>/dev/null || echo 0)
  echo "  duration: ${mins}m ${secs}s · turns: $turns · \$${cost_usd}"
  echo "  screenshots: $dir/screenshots/{before,after}.png"
  echo "  raw run output: $dir/.run.json"
}

# Derive cost.json from .run.json + duration, and patch the Cost section of findings.md.
write_cost() {
  local dir=$1 duration=$2
  [ -f "$dir/.run.json" ] || { echo "no $dir/.run.json — skipping cost write" >&2; return 0; }

  local cost_usd in_t cache_c cache_r out_t turns
  cost_usd=$(jq -r '.cost_usd // .total_cost_usd // 0' "$dir/.run.json")
  in_t=$(jq -r '.usage.input_tokens // 0' "$dir/.run.json")
  cache_c=$(jq -r '.usage.cache_creation_input_tokens // 0' "$dir/.run.json")
  cache_r=$(jq -r '.usage.cache_read_input_tokens // 0' "$dir/.run.json")
  out_t=$(jq -r '.usage.output_tokens // 0' "$dir/.run.json")
  turns=$(jq -r '.num_turns // 0' "$dir/.run.json")

  jq -n \
    --argjson wall_ms "$((duration * 1000))" \
    --argjson turns "$turns" \
    --argjson cost_usd "$cost_usd" \
    --argjson in_t "$in_t" --argjson cache_c "$cache_c" \
    --argjson cache_r "$cache_r" --argjson out_t "$out_t" '
    {wall_ms: $wall_ms, turns: $turns, cost_usd: $cost_usd,
     tokens: {input: $in_t, cache_creation: $cache_c, cache_read: $cache_r, output: $out_t,
              total: ($in_t + $cache_c + $cache_r + $out_t)}}' \
    > "$dir/cost.json"

  local mins=$((duration / 60)) secs=$((duration % 60))
  python3 - "$dir/findings.md" "$mins" "$secs" "$turns" "$in_t" "$cache_c" "$cache_r" "$out_t" "$cost_usd" <<'PY'
import re, sys, pathlib
p, mins, secs, turns, in_t, cache_c, cache_r, out_t, cost_usd = sys.argv[1:10]
text = pathlib.Path(p).read_text()
block = (f"## Cost\n- wall time: {mins}m {secs}s\n- turns: {turns}\n"
         f"- tokens (input / cache-create / cache-read / output): "
         f"{in_t} / {cache_c} / {cache_r} / {out_t}\n- $ estimate: ${cost_usd}\n")
text = re.sub(r"## Cost\n(?:.*\n)+?(?=## )", block + "\n", text, count=1)
pathlib.Path(p).write_text(text)
PY
}

cmd_prep() {
  local origin=${1:-}
  [ -n "$origin" ] || die "usage: exp prep <origin>"
  local origin_dir="$ROOT/origin/$origin"
  [ -d "$origin_dir" ] || die "origin not found: $origin_dir"
  local cache="$origin_dir/.cached-before.png"

  ( cd "$origin_dir" && [ -d node_modules ] || pnpm install )
  local pidfile="/tmp/exp-prep-$$.pid"
  serve_bg "$origin_dir" "$SCRATCH_PORT" "$pidfile"
  trap 'stop_bg '"$pidfile" EXIT
  screenshot "http://localhost:$SCRATCH_PORT/" "$cache"
  stop_bg "$pidfile"; trap - EXIT
  echo "cached $cache"
}

cmd_state() {
  local name=${1:-} new_state=${2:-}
  [ -n "$name" ] && [ -n "$new_state" ] || die "usage: exp state <name> <not-started|running|finished|failed>"
  case "$new_state" in not-started|running|finished|failed) ;; *) die "invalid state: $new_state" ;; esac
  local dir="$ROOT/experiment/$name"
  [ -d "$dir" ] || die "no such experiment: $name"
  write_state "$dir" "$new_state"
  echo "wrote $dir/state.json ($new_state)"
}

cmd_cost() {
  local name=${1:-}; [ -n "$name" ] || die "usage: exp cost <name> [duration_seconds]"
  local dir="$ROOT/experiment/$name"
  [ -d "$dir" ] || die "no such experiment: $name"
  local duration=${2:-0}
  if [ "$duration" = 0 ] && [ -f "$dir/.run.json" ]; then
    duration=$(jq -r '(.duration_ms // 0) / 1000 | floor' "$dir/.run.json")
  fi
  write_cost "$dir" "$duration"
  echo "wrote $dir/cost.json"
}

case "${1:-}" in
  new)    shift; cmd_new "$@" ;;
  before) shift; cmd_before "$@" ;;
  after)  shift; cmd_after "$@" ;;
  serve)  shift; cmd_serve "$@" ;;
  prompt) shift; cmd_prompt "$@" ;;
  ids)    cmd_ids ;;
  run)    shift; cmd_run "$@" ;;
  prep)   shift; cmd_prep "$@" ;;
  cost)   shift; cmd_cost "$@" ;;
  state)  shift; cmd_state "$@" ;;
  ui)     shift; exec "$ROOT/bin/exp-ui.js" "$@" ;;
  *) cat >&2 <<EOF
usage:
  exp new    <id> <origin>   scaffold experiment/<id>-<origin>/
  exp before <name>          capture before.png from origin/
  exp serve  <name>          dev-serve the working copy (foreground)
  exp after  <name>          capture after.png from working copy
  exp prompt <id>            print the substituted prompt
  exp ids                    list all experiment ids
  exp run    <id> <origin>   full unattended pipeline (new → before → claude -p → after)
  exp cost   <name> [secs]   rebuild cost.json from .run.json (and patch findings.md)
  exp state  <name> <state>  set state (not-started|running|finished|failed)
  exp ui                     side-by-side comparison canvas (http://localhost:5050)

env vars for 'run':
  EXP_MODEL=opus|sonnet|haiku  model alias (default: claude's session default)
  EXP_BUDGET_USD=5             dollar cap for the agent run
EOF
     exit 1 ;;
esac
