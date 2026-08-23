import { VERSION } from "./constants.js";

export function globalHelp(): void {
  console.log(`fintech ${VERSION}

Usage:
  fintech <command> [options]

Commands:
  setup       Configure local identity and agents
  doctor      Check local fintech setup
  skills      Publish and list shared skills
  completion  Generate shell completion
  version     Print version
  help        Print help

Run command help:
  fintech <command> --help

Most commands require setup first:
  fintech setup`);
}

export function setupHelp(): void {
  console.log(`Usage:
  fintech setup [options]

Configure local identity and coding agent preferences.

Defaults:
  Name and email are read from git config when available.

Options:
  --reset           Replace an existing setup
  --name <name>     Set display name without prompting
  --email <email>   Set email without prompting
  --agents <agents> Set comma-separated agents without prompting
  -h, --help        Print this help

Examples:
  fintech setup
  fintech setup --reset
  fintech setup --name "Yaron Horsky" --email "yaron@example.com" --agents opencode,claude`);
}

export function doctorHelp(): void {
  console.log(`Usage:
  fintech doctor [options]

Check whether local fintech setup exists and is valid.

Options:
  -h, --help  Print this help

Examples:
  fintech doctor`);
}

export function completionHelp(): void {
  console.log(`Usage:
  fintech completion <bash|zsh> [options]

Generate shell completion script.

Options:
  -h, --help  Print this help

Examples:
  fintech completion zsh
  fintech completion bash`);
}

export function skillsHelp(): void {
  console.log(`Usage:
  fintech skills <command> [options]

Commands:
  list     List published skills
  publish  Publish a markdown file as a shared skill
  install  Install skills into your configured coding agents
  installed Show locally installed skills

Run command help:
  fintech skills list --help
  fintech skills publish --help
  fintech skills install --help
  fintech skills installed --help`);
}

export function skillsListHelp(): void {
  console.log(`Usage:
  fintech skills list [options]

List published agent-agnostic skills.

Options:
  -h, --help  Print this help

Examples:
  fintech skills list`);
}

export function skillsPublishHelp(): void {
  console.log(`Usage:
  fintech skills publish <file.md> [options]

Publish a markdown file as an agent-agnostic shared skill.

The CLI adds frontmatter with:
  title, author, author_email, tags, created, updated

Options:
  -h, --help  Print this help

Examples:
  fintech skills publish ./my-skill.md`);
}

export function skillsInstallHelp(): void {
  console.log(`Usage:
  fintech skills install [skill-id...]

Install shared skills into your configured coding agents.

With no skill IDs, opens an interactive checkbox picker.
With skill IDs, installs those skills directly.

Supported agents:
  opencode, claude

Examples:
  fintech skills install
  fintech skills install efi5
  fintech skills install efi5 another-skill`);
}

export function skillsInstalledHelp(): void {
  console.log(`Usage:
  fintech skills installed [options]

List skills installed on this machine.

Options:
  -h, --help  Print this help

Examples:
  fintech skills installed`);
}

export function versionHelp(): void {
  console.log(`Usage:
  fintech version [options]

Print the fintech CLI version.

Options:
  -h, --help  Print this help`);
}

export function hasHelpFlag(args: string[]): boolean {
  return args.includes("--help") || args.includes("-h");
}
