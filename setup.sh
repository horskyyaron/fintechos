#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FINTECH_BIN="$ROOT_DIR/bin/fintech.js"
COMPLETION_DIR="$HOME/.config/fintech-brain/completions"
MARKER_START="# >>> fintech-brain initialize >>>"
MARKER_END="# <<< fintech-brain initialize <<<"
USE_COLOR=0

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  USE_COLOR=1
fi

cd "$ROOT_DIR"

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

append_once() {
  local file="$1"
  local content="$2"

  touch "$file"

  if grep -Fq "$MARKER_START" "$file"; then
    info "Shell config already contains fintech block: $file"
    return
  fi

  {
    printf '\n%s\n' "$MARKER_START"
    printf '%s\n' "$content"
    printf '%s\n' "$MARKER_END"
  } >> "$file"

  success "Updated shell config: $file"
}

install_completion() {
  mkdir -p "$COMPLETION_DIR"

  "$FINTECH_BIN" completion zsh > "$COMPLETION_DIR/_fintech"
  append_once "$HOME/.zshrc" "fpath=(\"$COMPLETION_DIR\" \$fpath)\nautoload -Uz compinit\ncompinit"
  success 'Installed zsh completion. Restart shell or run: source ~/.zshrc'

  "$FINTECH_BIN" completion bash > "$COMPLETION_DIR/fintech.bash"
  append_once "$HOME/.bashrc" "[ -f \"$COMPLETION_DIR/fintech.bash\" ] && source \"$COMPLETION_DIR/fintech.bash\""
  success 'Installed bash completion. Restart shell or run: source ~/.bashrc'
}

require_command node
require_command npm
require_command git

section 'Installing dependencies'
npm install

section 'Building CLI'
npm run build

section 'Linking fintech command'
npm link

section 'Running fintech setup'
SETUP_ARGS=()

if [ "${FINTECH_SETUP_RESET:-}" = "1" ]; then
  SETUP_ARGS+=("--reset")
fi

if [ -n "${FINTECH_NAME:-}" ]; then
  SETUP_ARGS+=("--name" "$FINTECH_NAME")
fi

if [ -n "${FINTECH_EMAIL:-}" ]; then
  SETUP_ARGS+=("--email" "$FINTECH_EMAIL")
fi

if [ -n "${FINTECH_AGENTS:-}" ]; then
  SETUP_ARGS+=("--agents" "$FINTECH_AGENTS")
fi

"$FINTECH_BIN" setup "${SETUP_ARGS[@]}"

section 'Installing shell completion'
install_completion

section 'Setup finished'
success 'Verify with: fintech doctor'
