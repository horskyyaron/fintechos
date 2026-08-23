import { setup } from "./commands/setup.js";
import { doctor } from "./commands/doctor.js";
import { completion } from "./commands/completion.js";
import { skills } from "./commands/skills.js";
import { ALLOWED_BEFORE_SETUP, VERSION } from "./constants.js";
import { loadConfig, validateConfig } from "./config.js";
import { globalHelp, hasHelpFlag, versionHelp } from "./help.js";

async function main(): Promise<void> {
  const [, , rawCommand, ...args] = process.argv;
  const command = rawCommand ?? "help";

  if (!ALLOWED_BEFORE_SETUP.has(command) && !hasHelpFlag(args)) {
    requireSetup();
  }

  switch (command) {
    case "setup":
      await setup(args);
      break;
    case "doctor":
      doctor(args);
      break;
    case "completion":
      completion(args);
      break;
    case "skills":
      skills(args);
      break;
    case "version":
    case "--version":
    case "-v":
      if (hasHelpFlag(args)) {
        versionHelp();
        break;
      }
      console.log(VERSION);
      break;
    case "help":
    case "--help":
    case "-h":
      globalHelp();
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

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
