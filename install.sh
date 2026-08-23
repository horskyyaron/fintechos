#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${FINTECH_REPO_URL:-https://github.com/horskyyaron/fintechos.git}"
INSTALL_DIR="${FINTECH_INSTALL_DIR:-$HOME/.local/share/fintech-brain}"
BRANCH="${FINTECH_BRANCH:-}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

clone_or_update() {
  if [ -d "$INSTALL_DIR/.git" ]; then
    printf 'Updating fintech-brain in %s...\n' "$INSTALL_DIR"
    git -C "$INSTALL_DIR" fetch --prune origin

    if [ -n "$BRANCH" ]; then
      git -C "$INSTALL_DIR" checkout "$BRANCH"
      git -C "$INSTALL_DIR" pull --ff-only origin "$BRANCH"
    else
      git -C "$INSTALL_DIR" pull --ff-only
    fi

    return
  fi

  if [ -e "$INSTALL_DIR" ]; then
    printf 'Install directory exists but is not a git repo: %s\n' "$INSTALL_DIR" >&2
    printf 'Set FINTECH_INSTALL_DIR to another path or remove the existing directory.\n' >&2
    exit 1
  fi

  printf 'Cloning fintech-brain into %s...\n' "$INSTALL_DIR"
  mkdir -p "$(dirname "$INSTALL_DIR")"

  if [ -n "$BRANCH" ]; then
    git clone --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
  else
    git clone "$REPO_URL" "$INSTALL_DIR"
  fi
}

require_command git
require_command node
require_command npm

clone_or_update

printf 'Running setup...\n'
"$INSTALL_DIR/setup.sh"
