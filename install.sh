#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

REPO_URL="${FINTECH_REPO_URL:-https://github.com/horskyyaron/fintechos.git}"
INSTALL_DIR="${FINTECH_INSTALL_DIR:-$HOME/.local/share/fintech-brain}"
BRANCH="${FINTECH_BRANCH:-}"
USE_COLOR=0

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  USE_COLOR=1
fi

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "Missing required command: $1"
    exit 1
  fi
}

color() {
  local code="$1"
  shift

  if [ "$USE_COLOR" = "1" ]; then
    printf '\033[%sm%s\033[0m' "$code" "$*"
  else
    printf '%s' "$*"
  fi
}

section() {
  printf '\n%s %s\n' "$(color 36 '==>')" "$(color 1 "$*")"
}

info() {
  printf '%s %s\n' "$(color 34 '-->')" "$*"
}

success() {
  printf '%s %s\n' "$(color 32 'ok')" "$*"
}

error() {
  printf '%s %s\n' "$(color 31 'error:')" "$*" >&2
}

print_config() {
  section 'Fintech Brain installer'
  info "Repo: $REPO_URL"
  info "Install dir: $INSTALL_DIR"

  if [ -n "$BRANCH" ]; then
    info "Branch: $BRANCH"
  fi
}

# -----------------------------------------------------------------------------
# Validation
# -----------------------------------------------------------------------------

check_requirements() {
  section 'Checking requirements'
  require_command git
  success 'git is available'
}

# -----------------------------------------------------------------------------
# Repository Install / Update
# -----------------------------------------------------------------------------

install_or_update_repo() {
  if [ -d "$INSTALL_DIR/.git" ]; then
    update_repo
    return
  fi

  if [ -e "$INSTALL_DIR" ]; then
    error "Install directory exists but is not a git repo: $INSTALL_DIR"
    error 'Set FINTECH_INSTALL_DIR to another path or remove the existing directory.'
    exit 1
  fi

  clone_repo
}

clone_repo() {
  section 'Cloning repository'
  info "Target: $INSTALL_DIR"
  mkdir -p "$(dirname "$INSTALL_DIR")"

  if [ -n "$BRANCH" ]; then
    git clone --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
  else
    git clone "$REPO_URL" "$INSTALL_DIR"
  fi

  success 'Repository cloned'
}

update_repo() {
  section 'Updating repository'
  info "Target: $INSTALL_DIR"
  git -C "$INSTALL_DIR" fetch --prune origin

  if [ -n "$BRANCH" ]; then
    git -C "$INSTALL_DIR" checkout "$BRANCH"
    git -C "$INSTALL_DIR" pull --ff-only origin "$BRANCH"
  else
    git -C "$INSTALL_DIR" pull --ff-only
  fi

  success 'Repository updated'
}

# -----------------------------------------------------------------------------
# Setup
# -----------------------------------------------------------------------------

run_setup() {
  section 'Running setup'
  "$INSTALL_DIR/setup.sh"
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

main() {
  print_config
  check_requirements
  install_or_update_repo
  run_setup
  section 'Done'
  success 'Fintech Brain is installed. Run: fintech doctor'
}

main
