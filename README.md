# Fintech Brain 🧠

A CLI-backed shared knowledge base for fintech teams.

Fintech Brain helps developers and product managers share reusable skills, workflows, debugging stories, testing strategies, and product/domain lessons.

## Install 🚀

```bash
curl -fsSL https://raw.githubusercontent.com/horskyyaron/fintechos/master/install.sh | bash
```

The installer clones the repo into `~/.local/share/fintech-brain`, installs the `fintech` CLI, runs setup, installs shell completion, and prepares your coding-agent skill folders.

It checks for `git` and `curl` first. If either is missing, it checks for Homebrew, prompts to install Homebrew when needed, and installs the missing dependency with Homebrew.

If `node` or `npm` are missing, setup installs `mise` and uses it to install the required Node version.

## Quick Start ⚡

```bash
fintech skills list                  # Show available shared skills
fintech skills install               # Choose skills to install with a checkbox picker
fintech skills installed             # Show skills installed on this machine
fintech skills publish ./my-skill.md # Publish a new shared skill from a Markdown file
```

## Optional Overrides 🛠️

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

## What Works Today ✅

- Publish shared skills
- List available skills
- Install skills into configured coding agents
- Track locally installed skills
- Support Claude and OpenCode
- Shell completion for zsh and bash
- Setup-gated commands

## Roadmap 🗺️

### Skills

- [ ] Uninstall skills with checkbox chooser
- [ ] `fintech skills reset` to remove all installed skills
- [ ] Improve skill publishing flow
- [ ] Add LLM summarization during publish to generate listing descriptions
- [ ] Add skill update/contribution workflow
- [ ] Add skill search and filtering

### Knowledge Types

- [ ] Workflows
- [ ] Debugging stories
- [ ] Testing strategies
- [ ] Product/domain notes
- [ ] Incident lessons
- [ ] Review playbooks
- [ ] Architecture decisions
- [ ] More useful team knowledge patterns

### Frontends

- [ ] TUI frontend
- [ ] Web frontend

### Agents

- [ ] Better setup: detect coding agents already used on the machine, then still prompt the user to add more
- [ ] More coding agents
- [ ] Agent-specific rendering improvements
- [ ] Installed skill upgrades
- [ ] Agent health checks

### Safety

- [ ] Secret scanning before publish
- [ ] PII/sensitive-data detection
- [ ] Review flow for restricted content
- [ ] CI validation for registry and frontmatter

## Why This Exists 💡

Teams repeatedly learn the same lessons across projects. Fintech Brain is meant to make those lessons easy to publish, find, install, and reuse from inside the tools developers already use.

## Philosophy

- Low friction first
- Git as the source of truth
- Markdown over databases
- Skills are agent-agnostic at rest
- Agent-specific files are generated only during install
