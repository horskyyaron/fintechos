import { loadConfig, validateConfig } from "../config.js";
import { doctorHelp, hasHelpFlag } from "../help.js";

export function doctor(args: string[]): void {
  if (hasHelpFlag(args)) {
    doctorHelp();
    return;
  }

  const config = loadConfig();

  if (!config) {
    console.log("Setup: missing");
    console.log("Run: fintech setup");
    return;
  }

  const validation = validateConfig(config);

  if (!validation.valid) {
    console.log("Setup: invalid");
    validation.errors.forEach((error) => console.log(`- ${error}`));
    console.log("Run: fintech setup --reset");
    return;
  }

  console.log("Setup: ok");
  console.log(`Name: ${config.name}`);
  console.log(`Email: ${config.email}`);
  console.log(`Agents: ${config.agents.join(", ")}`);
}
