# Fintech Brain

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/horskyyaron/fintechos/master/install.sh | bash
```

This clones the repo into `~/.local/share/fintech-brain`, installs the `fintech` CLI, runs `fintech setup`, and installs shell completion.

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
