import { completionHelp, hasHelpFlag } from "../help.js";

const COMMANDS = ["setup", "doctor", "skills", "version", "help", "completion"];
const SETUP_OPTIONS = ["--reset", "--name", "--email", "--agents", "--help", "-h"];
const HELP_OPTIONS = ["--help", "-h"];
const SKILLS_COMMANDS = ["list", "publish", "--help", "-h"];
const SKILLS_PUBLISH_OPTIONS = ["--help", "-h"];
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
  const skillsCommands = SKILLS_COMMANDS.join(" ");
  const skillsPublishOptions = SKILLS_PUBLISH_OPTIONS.join(" ");
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
    skills)
      if [[ $COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "${skillsCommands}" -- "$cur") )
      elif [[ "\${COMP_WORDS[2]}" == "publish" ]]; then
        COMPREPLY=( $(compgen -W "${skillsPublishOptions}" -- "$cur") )
      else
        COMPREPLY=( $(compgen -W "${helpOptions}" -- "$cur") )
      fi
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
  const skillsCommands = SKILLS_COMMANDS.join(" ");
  const skillsPublishOptions = SKILLS_PUBLISH_OPTIONS.join(" ");
  const shells = SHELLS.join(" ");

  return `#compdef fintech
# fintech completion for zsh
_fintech() {
  local -a commands setup_options help_options skills_commands skills_publish_options shells
  commands=(${commands})
  setup_options=(${setupOptions})
  help_options=(${helpOptions})
  skills_commands=(${skillsCommands})
  skills_publish_options=(${skillsPublishOptions})
  shells=(${shells})

  _arguments -C \
    '1:command:->command' \
    '*::arg:->arg'

  case "$state" in
    command)
      compadd -a commands
      ;;
    arg)
      case "$words[2]" in
        setup)
          compadd -a setup_options
          ;;
        doctor|version|help)
          compadd -a help_options
          ;;
        skills)
          if (( CURRENT == 3 )); then
            compadd -a skills_commands
          elif [[ "$words[3]" == "publish" ]]; then
            compadd -a skills_publish_options
          else
            compadd -a help_options
          fi
          ;;
        completion)
          compadd -a shells
          compadd -a help_options
          ;;
      esac
      ;;
  esac
}

compdef _fintech fintech`;
}
