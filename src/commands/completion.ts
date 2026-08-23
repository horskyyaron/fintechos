import { completionHelp, hasHelpFlag } from "../help.js";

const COMMANDS = ["setup", "doctor", "version", "help", "completion"];
const SETUP_OPTIONS = ["--reset", "--name", "--email", "--agents", "--help", "-h"];
const HELP_OPTIONS = ["--help", "-h"];
const SHELLS = ["bash", "zsh"];

export function completion(args: string[]): void {
  if (hasHelpFlag(args)) {
    completionHelp();
    return;
  }

  const [shell] = args;

  if (shell === "bash") {
    console.log(bashCompletion());
    return;
  }

  if (shell === "zsh") {
    console.log(zshCompletion());
    return;
  }

  completionHelp();
  process.exitCode = 1;
}

function bashCompletion(): string {
  const commands = COMMANDS.join(" ");
  const setupOptions = SETUP_OPTIONS.join(" ");
  const helpOptions = HELP_OPTIONS.join(" ");
  const shells = SHELLS.join(" ");

  return `# fintech completion for bash
_fintech_completion() {
  local cur prev command
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD - 1]}"
  command="\${COMP_WORDS[1]}"

  if [[ $COMP_CWORD -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "${commands}" -- "$cur") )
    return 0
  fi

  case "$command" in
    setup)
      COMPREPLY=( $(compgen -W "${setupOptions}" -- "$cur") )
      ;;
    doctor|version|help)
      COMPREPLY=( $(compgen -W "${helpOptions}" -- "$cur") )
      ;;
    completion)
      COMPREPLY=( $(compgen -W "${shells} ${helpOptions}" -- "$cur") )
      ;;
  esac
}

complete -F _fintech_completion fintech`;
}

function zshCompletion(): string {
  const commands = COMMANDS.join(" ");
  const setupOptions = SETUP_OPTIONS.join(" ");
  const helpOptions = HELP_OPTIONS.join(" ");
  const shells = SHELLS.join(" ");

  return `#compdef fintech
# fintech completion for zsh
_fintech() {
  local -a commands setup_options help_options shells
  commands=(${commands})
  setup_options=(${setupOptions})
  help_options=(${helpOptions})
  shells=(${shells})

  if (( CURRENT == 2 )); then
    _describe 'command' commands
    return
  fi

  case "$words[2]" in
    setup)
      _describe 'option' setup_options
      ;;
    doctor|version|help)
      _describe 'option' help_options
      ;;
    completion)
      _describe 'shell' shells
      _describe 'option' help_options
      ;;
  esac
}

compdef _fintech fintech`;
}
