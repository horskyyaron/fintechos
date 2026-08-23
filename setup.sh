#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FINTECH_BIN="$ROOT_DIR/bin/fintech.js"
LOCAL_BIN_DIR="$HOME/.local/bin"
LOCAL_FINTECH_BIN="$LOCAL_BIN_DIR/fintech"
COMPLETION_DIR="$HOME/.config/fintech-brain/completions"
MARKER_START="# >>> fintech-brain initialize >>>"
MARKER_END="# <<< fintech-brain initialize <<<"
MISE_BIN="$HOME/.local/bin/mise"
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

has_command() {
  command -v "$1" >/dev/null 2>&1
}

curl_version() {
  local version
  version="$(curl --version)"
  printf '%s' "${version%%$'\n'*}"
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

prompt_continue() {
  if [ ! -t 0 ] || [ "${FINTECH_YES:-}" = "1" ]; then
    return
  fi

  printf '%s Continue? [Y/n] ' "$(color 33 '?')"
  read -r answer

  case "$answer" in
    ""|y|Y|yes|YES)
      return
      ;;
    *)
      error 'Setup cancelled.'
      exit 1
      ;;
  esac
}

prompt_install() {
  if [ ! -t 0 ] || [ "${FINTECH_YES:-}" = "1" ]; then
    return
  fi

  printf '%s %s [Y/n] ' "$(color 33 '?')" "$*"
  read -r answer

  case "$answer" in
    ""|y|Y|yes|YES)
      return
      ;;
    *)
      error 'Setup cancelled.'
      exit 1
      ;;
  esac
}

install_homebrew() {
  if has_command brew; then
    success 'Homebrew is available'
    return
  fi

  if ! has_command curl; then
    error 'curl is required to install Homebrew.'
    error 'Install curl manually, then rerun ./setup.sh.'
    exit 1
  fi

  section 'Installing Homebrew'
  info 'Homebrew is required to install missing system dependencies.'
  prompt_install 'Install Homebrew now?'

  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  if [ -x /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [ -x /usr/local/bin/brew ]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi

  if ! has_command brew; then
    error 'Homebrew installation finished, but brew is not available on PATH.'
    error 'Restart your shell and rerun ./setup.sh.'
    exit 1
  fi

  success 'Homebrew installed'
}

install_with_homebrew() {
  install_homebrew

  for dependency in "$@"; do
    if has_command "$dependency"; then
      success "$dependency is available"
      continue
    fi

    section "Installing $dependency"
    prompt_install "Install $dependency with Homebrew?"
    brew install "$dependency"
  done
}

install_mise() {
  if has_command mise; then
    success 'mise is available'
    return
  fi

  if [ -x "$MISE_BIN" ]; then
    export PATH="$HOME/.local/bin:$PATH"
    success 'mise is available'
    return
  fi

  section 'Installing mise'
  info 'mise is required to install missing tool dependencies.'

  if ! has_command curl; then
    error 'curl is required to install mise.'
    exit 1
  fi

  curl https://mise.run | sh
  export PATH="$HOME/.local/bin:$PATH"

  if ! has_command mise; then
    error 'mise installation finished, but mise is still not available on PATH.'
    error 'Restart your shell and rerun ./setup.sh, or add ~/.local/bin to PATH.'
    exit 1
  fi

  success 'mise installed'
}

install_tool_dependencies() {
  install_mise

  section 'Installing tool dependencies with mise'
  mise trust "$ROOT_DIR/mise.toml"
  mise install
  eval "$(mise activate bash)"
}

check_dependencies() {
  section 'Checking dependencies'

  if ! has_command git || ! has_command curl; then
    info 'git and/or curl are missing.'
    install_with_homebrew git curl
  fi

  require_command git
  require_command curl

  if has_command node && has_command npm; then
    success "git: $(git --version)"
    success "curl: $(curl_version)"
    success "node: $(node --version)"
    success "npm: $(npm --version)"
    prompt_continue
    return
  fi

  info 'node and/or npm are missing. They will be installed through mise.'
  install_tool_dependencies

  if ! has_command node || ! has_command npm; then
    error 'node/npm are still unavailable after mise install.'
    exit 1
  fi

  success "git: $(git --version)"
  success "curl: $(curl_version)"
  success "node: $(node --version)"
  success "npm: $(npm --version)"
  prompt_continue
}

append_once() {
  local file="$1"
  local content="$2"
  local replacement

  touch "$file"
  replacement="$(printf '\n%s\n%s\n%s\n' "$MARKER_START" "$content" "$MARKER_END")"

  if grep -Fq "$MARKER_START" "$file"; then
    awk -v start="$MARKER_START" -v end="$MARKER_END" -v replacement="$replacement" '
      $0 == start { print replacement; skipping = 1; next }
      $0 == end { skipping = 0; next }
      !skipping { print }
    ' "$file" > "$file.tmp"
    mv "$file.tmp" "$file"
    success "Updated shell config: $file"
    return
  fi

  printf '%s' "$replacement" >> "$file"

  success "Updated shell config: $file"
}

install_completion() {
  mkdir -p "$COMPLETION_DIR"

  "$FINTECH_BIN" completion zsh > "$COMPLETION_DIR/_fintech"
  append_once "$HOME/.zshrc" "export PATH=\"$LOCAL_BIN_DIR:\$PATH\"\nfpath=(\"$COMPLETION_DIR\" \$fpath)\nautoload -Uz compinit\ncompinit"
  success 'Installed zsh completion. Restart shell or run: source ~/.zshrc'

  "$FINTECH_BIN" completion bash > "$COMPLETION_DIR/fintech.bash"
  append_once "$HOME/.bashrc" "export PATH=\"$LOCAL_BIN_DIR:\$PATH\"\n[ -f \"$COMPLETION_DIR/fintech.bash\" ] && source \"$COMPLETION_DIR/fintech.bash\""
  success 'Installed bash completion. Restart shell or run: source ~/.bashrc'
}

install_fintech_command() {
  mkdir -p "$LOCAL_BIN_DIR"

  cat > "$LOCAL_FINTECH_BIN" <<EOF
#!/usr/bin/env bash
exec "$FINTECH_BIN" "\$@"
EOF

  chmod +x "$LOCAL_FINTECH_BIN"
  success "Installed fintech command: $LOCAL_FINTECH_BIN"

  case ":$PATH:" in
    *":$LOCAL_BIN_DIR:"*)
      return
      ;;
    *)
      info "$LOCAL_BIN_DIR is not on PATH in this shell. Restart your shell after setup."
      ;;
  esac
}

check_dependencies

section 'Installing dependencies'
npm install

section 'Building CLI'
npm run build

section 'Installing fintech command'
install_fintech_command

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
