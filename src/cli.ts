import { setup } from "./commands/setup.js";
import { doctor } from "./commands/doctor.js";
import { completion } from "./commands/completion.js";
import { ALLOWED_BEFORE_SETUP, VERSION } from "./constants.js";
import { loadConfig, validateConfig } from "./config.js";

async function main(): Promise<void> {
  const [, , rawCommand, ...args] = process.argv;
  const command = rawCommand ?? "help";

  if (!ALLOWED_BEFORE_SETUP.has(command)) {
    requireSetup();
  }

  switch (command) {
    case "setup":
      await setup(args);
      break;
    case "doctor":
      doctor();
      break;
    case "completion":
      completion(args[0]);
      break;
    case "version":
    case "--version":
    case "-v":
      console.log(VERSION);
      break;
    case "help":
    case "--help":
    case "-h":
      help();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error("Run: fintech help");
      process.exitCode = 1;
  }
}

function requireSetup(): void {
  const config = loadConfig();
  const validation = validateConfig(config);

  if (!validation.valid) {
    console.error("Local setup is required before using this command.");
    console.error("");
    console.error("Run:");
    console.error("  fintech setup");
    process.exit(1);
  }
}

function help(): void {
  console.log(`fintech ${VERSION}

Usage:
  fintech setup [--reset] [--name <name>] [--email <email>] [--agents <agents>]
  fintech doctor
  fintech completion <bash|zsh>
  fintech version
  fintech help

Most commands require setup first:
  fintech setup`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
