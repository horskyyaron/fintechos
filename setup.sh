#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPLETION_DIR="$HOME/.config/fintech-brain/completions"
MARKER_START="# >>> fintech-brain initialize >>>"
MARKER_END="# <<< fintech-brain initialize <<<"

cd "$ROOT_DIR"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

append_once() {
  local file="$1"
  local content="$2"

  touch "$file"

  if grep -Fq "$MARKER_START" "$file"; then
    printf 'Shell config already contains fintech block: %s\n' "$file"
    return
  fi

  {
    printf '\n%s\n' "$MARKER_START"
    printf '%s\n' "$content"
    printf '%s\n' "$MARKER_END"
  } >> "$file"
}

install_completion() {
  mkdir -p "$COMPLETION_DIR"

  fintech completion zsh > "$COMPLETION_DIR/_fintech"
  append_once "$HOME/.zshrc" "fpath=(\"$COMPLETION_DIR\" \$fpath)\nautoload -Uz compinit\ncompinit"
  printf 'Installed zsh completion. Restart shell or run: source ~/.zshrc\n'

  fintech completion bash > "$COMPLETION_DIR/fintech.bash"
  append_once "$HOME/.bashrc" "[ -f \"$COMPLETION_DIR/fintech.bash\" ] && source \"$COMPLETION_DIR/fintech.bash\""
  printf 'Installed bash completion. Restart shell or run: source ~/.bashrc\n'
}

require_command node
require_command npm
require_command git

printf 'Installing dependencies...\n'
npm install

printf 'Building CLI...\n'
npm run build

printf 'Linking fintech command...\n'
npm link

printf 'Running fintech setup...\n'
fintech setup

printf 'Installing shell completion...\n'
install_completion

printf 'Setup finished. Verify with: fintech doctor\n'
