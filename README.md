# Fintech Brain

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/horskyyaron/fintechos/master/install.sh | bash
```

This clones the repo into `~/.local/share/fintech-brain`, installs the `fintech` CLI, runs `fintech setup`, and installs shell completion.

The installer checks for `git` and `curl` first. If either is missing, it checks for Homebrew, prompts to install Homebrew when needed, and then installs the missing dependency with Homebrew.

During setup, if `node` or `npm` are missing, the installer installs `mise` and uses it to install the required Node version.

## Optional Overrides

Install the repo into a different folder instead of `~/.local/share/fintech-brain`:

```bash
FINTECH_INSTALL_DIR="$HOME/Projects/fintech-brain" \
  bash -c "$(curl -fsSL https://raw.githubusercontent.com/horskyyaron/fintechos/master/install.sh)"
```

Configure the coding agents during setup instead of selecting them interactively:

```bash
FINTECH_AGENTS="opencode,claude" \
  bash -c "$(curl -fsSL https://raw.githubusercontent.com/horskyyaron/fintechos/master/install.sh)"
```

Combine overrides:

```bash
FINTECH_INSTALL_DIR="$HOME/Projects/fintech-brain" \
  FINTECH_AGENTS="opencode,claude" \
  bash -c "$(curl -fsSL https://raw.githubusercontent.com/horskyyaron/fintechos/master/install.sh)"
```
