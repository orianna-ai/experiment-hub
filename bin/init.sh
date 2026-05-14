#!/usr/bin/env bash
# init — bootstrap the harness: clone grounding codebases and install deps.
#
# Idempotent. Safe to re-run. Run from anywhere:
#   bin/init.sh                # full bootstrap
#   bin/init.sh groundings     # only clone/update grounding codebases
#   bin/init.sh origins        # only install deps in origin/*
#   bin/init.sh experiments    # only install deps in experiment/*/cp_of_*

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ---- grounding codebase registry --------------------------------------------
# format: <dir-name> <git-url> <ref>
# <ref> is a commit, tag, or branch. Pin to a commit for reproducibility.
GROUNDINGS=(
  "twenty https://github.com/twentyhq/twenty.git 70a3b256802de62df1af30aa3cf5c63b8ca5d7dd"
)

# ---- helpers ----------------------------------------------------------------
log()  { printf '\033[1;36m>>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!!\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m!!\033[0m %s\n' "$*" >&2; exit 1; }

require() {
  command -v "$1" >/dev/null || die "missing prerequisite: $1"
}

check_prereqs() {
  log "checking prerequisites"
  require git
  require pnpm
  require jq
  require node
  command -v claude >/dev/null || warn "claude CLI not on PATH — needed for 'bin/exp.sh run'"
}

# ---- groundings -------------------------------------------------------------
clone_grounding() {
  local name=$1 url=$2 ref=$3
  local dest="$ROOT/grounding/$name"

  if [ -d "$dest/.git" ]; then
    local cur; cur=$(git -C "$dest" rev-parse HEAD)
    local target; target=$(git -C "$dest" rev-parse --verify "$ref^{commit}" 2>/dev/null || echo "")
    if [ -n "$target" ] && [ "$cur" = "$target" ]; then
      log "grounding/$name already at $ref"
      return 0
    fi
    log "grounding/$name exists — fetching $ref"
    git -C "$dest" fetch --depth 1 origin "$ref" 2>/dev/null \
      || git -C "$dest" fetch origin
    git -C "$dest" checkout --detach "$ref" \
      || die "could not checkout $ref in grounding/$name"
    return 0
  fi

  if [ -e "$dest" ]; then
    die "grounding/$name exists but is not a git repo — refusing to overwrite"
  fi

  mkdir -p "$ROOT/grounding"
  log "cloning $url -> grounding/$name"
  # Try a shallow fetch of the exact ref first; fall back to a full clone.
  if git clone --filter=blob:none --no-checkout "$url" "$dest"; then
    git -C "$dest" fetch --depth 1 origin "$ref" 2>/dev/null \
      || git -C "$dest" fetch origin
    git -C "$dest" checkout --detach "$ref" \
      || die "could not checkout $ref in grounding/$name"
  else
    die "git clone failed for $url"
  fi
}

do_groundings() {
  for row in "${GROUNDINGS[@]}"; do
    # shellcheck disable=SC2086
    set -- $row
    clone_grounding "$1" "$2" "$3"
  done
}

# ---- pnpm installs ----------------------------------------------------------
pnpm_install_if_needed() {
  local dir=$1
  [ -f "$dir/package.json" ] || return 0
  if [ -d "$dir/node_modules" ]; then
    log "skip (node_modules present): ${dir#$ROOT/}"
    return 0
  fi
  log "pnpm install: ${dir#$ROOT/}"
  ( cd "$dir" && pnpm install ) || warn "pnpm install failed in $dir"
}

do_origins() {
  for d in "$ROOT"/origin/*/; do
    [ -d "$d" ] || continue
    pnpm_install_if_needed "${d%/}"
  done
}

do_experiments() {
  shopt -s nullglob
  for wc in "$ROOT"/experiment/*/cp_of_*/; do
    pnpm_install_if_needed "${wc%/}"
  done
  shopt -u nullglob
}

# ---- dispatch ---------------------------------------------------------------
cmd=${1:-all}
case "$cmd" in
  all)
    check_prereqs
    do_groundings
    do_origins
    do_experiments
    log "init complete"
    ;;
  groundings) check_prereqs; do_groundings ;;
  origins)    check_prereqs; do_origins ;;
  experiments) check_prereqs; do_experiments ;;
  -h|--help|help)
    cat <<EOF
usage: bin/init.sh [all|groundings|origins|experiments]

  all          (default) clone groundings, install origin + experiment deps
  groundings   clone/update grounding/<name> repos pinned by bin/init
  origins      pnpm install in each origin/* missing node_modules
  experiments  pnpm install in each experiment/*/cp_of_* missing node_modules
EOF
    ;;
  *) die "unknown subcommand: $cmd (try 'bin/init.sh help')" ;;
esac
