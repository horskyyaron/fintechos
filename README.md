# Fintech Brain

A small CLI-backed knowledge repo for sharing team skills, lessons, workflows, and agent instructions.

## First Command

Run setup before using other commands:

```bash
fintech setup
```

The CLI stores local identity and agent preferences at:

```text
~/.config/fintech-brain/config.json
```

## Development

```bash
npm link
fintech setup
fintech doctor
```

## Bootstrap

```bash
./setup.sh
```

This installs dependencies, builds the CLI, links the `fintech` command, runs setup, and installs shell completion for bash or zsh.

## Remote Install

```bash
curl -fsSL https://raw.githubusercontent.com/horskyyaron/fintechos/master/install.sh | bash
```

The installer clones the repo into `~/.local/share/fintech-brain` and runs `setup.sh`.

Optional overrides:

```bash
FINTECH_INSTALL_DIR="$HOME/Projects/fintech-brain" \
FINTECH_AGENTS="opencode,claude" \
bash -c "$(curl -fsSL https://raw.githubusercontent.com/horskyyaron/fintechos/master/install.sh)"
```
