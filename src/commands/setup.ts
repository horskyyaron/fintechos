import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { CONFIG_PATH, SUPPORTED_AGENTS, type SupportedAgent } from "../constants.js";
import { isValidEmail, loadConfig, type FintechConfig } from "../config.js";
import { getGitConfig } from "../git.js";

type SetupOptions = {
  name?: string;
  email?: string;
  agents?: string;
};

export async function setup(args: string[]): Promise<void> {
  const reset = args.includes("--reset");
  const options = parseOptions(args);
  const existing = loadConfig();

  if (existing && !reset) {
    console.log(`Setup already exists at ${CONFIG_PATH}`);
    console.log("Run `fintech setup --reset` to reconfigure.");
    return;
  }

  const rl = readline.createInterface({ input, output });

  try {
    const gitName = getGitConfig("user.name");
    const gitEmail = getGitConfig("user.email");

    const name = options.name ?? await askWithDefault(rl, "Name", gitName);
    const email = options.email ?? await askWithDefault(rl, "Email", gitEmail);

    if (!name.trim()) {
      throw new Error("Name is required.");
    }

    if (!isValidEmail(email)) {
      throw new Error("A valid email is required.");
    }

    if (!options.agents) {
      console.log("Select coding agents by comma-separated number:");
      SUPPORTED_AGENTS.forEach((agent, index) => {
        console.log(`  ${index + 1}. ${agent}`);
      });
    }

    const selected = options.agents ?? await askWithDefault(rl, "Agents", "1");
    const agents = parseAgentSelection(selected);

    if (agents.length === 0) {
      throw new Error("At least one coding agent is required.");
    }

    const now = new Date().toISOString();
    const config: FintechConfig = {
      version: 1,
      name: name.trim(),
      email: email.trim(),
      agents,
      default_confidentiality: "internal",
      created_at: existing?.created_at ?? now,
      updated_at: now
    };

    mkdirSync(dirname(CONFIG_PATH), { recursive: true });
    writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });

    console.log(`Setup complete. Config saved to ${CONFIG_PATH}`);
  } finally {
    rl.close();
  }
}

async function askWithDefault(rl: readline.Interface, label: string, defaultValue: string): Promise<string> {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const answer = await rl.question(`${label}${suffix}: `);
  return answer.trim() || defaultValue;
}

function parseAgentSelection(value: string): SupportedAgent[] {
  return [...new Set(value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .map((part) => {
      const number = Number(part);
      if (Number.isInteger(number) && number >= 1 && number <= SUPPORTED_AGENTS.length) {
        return SUPPORTED_AGENTS[number - 1];
      }
      return part;
    })
    .filter((agent): agent is SupportedAgent => (SUPPORTED_AGENTS as readonly string[]).includes(agent)))];
}

function parseOptions(args: string[]): SetupOptions {
  const options: SetupOptions = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--name") {
      options.name = args[index + 1];
      index += 1;
    }

    if (arg === "--email") {
      options.email = args[index + 1];
      index += 1;
    }

    if (arg === "--agents") {
      options.agents = args[index + 1];
      index += 1;
    }
  }

  return options;
}
