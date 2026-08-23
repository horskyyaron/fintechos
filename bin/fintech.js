#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { constants, accessSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const VERSION = "0.1.0";
const CONFIG_PATH = join(homedir(), ".config", "fintech-brain", "config.json");
const ALLOWED_BEFORE_SETUP = new Set(["setup", "help", "--help", "-h", "version", "--version", "-v", "doctor"]);
const SUPPORTED_AGENTS = ["opencode", "claude", "kiro"];

async function main() {
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

async function setup(args) {
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

    const nameDefault = gitName || "";
    const emailDefault = gitEmail || "";

    const name = options.name ?? await askWithDefault(rl, "Name", nameDefault);
    const email = options.email ?? await askWithDefault(rl, "Email", emailDefault);

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
    const config = {
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

function doctor() {
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

function requireSetup() {
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

function loadConfig() {
  try {
    accessSync(CONFIG_PATH, constants.R_OK);
    return JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return null;
  }
}

function validateConfig(config) {
  const errors = [];

  if (!config || typeof config !== "object") {
    return { valid: false, errors: ["Config is missing."] };
  }

  if (config.version !== 1) {
    errors.push("Unsupported config version.");
  }

  if (!config.name || typeof config.name !== "string") {
    errors.push("Name is required.");
  }

  if (!isValidEmail(config.email)) {
    errors.push("A valid email is required.");
  }

  if (!Array.isArray(config.agents) || config.agents.length === 0) {
    errors.push("At least one coding agent is required.");
  } else {
    const unsupportedAgents = config.agents.filter((agent) => !SUPPORTED_AGENTS.includes(agent));
    if (unsupportedAgents.length > 0) {
      errors.push(`Unsupported agents: ${unsupportedAgents.join(", ")}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function getGitConfig(key) {
  try {
    return execFileSync("git", ["config", key], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

async function askWithDefault(rl, label, defaultValue) {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const answer = await rl.question(`${label}${suffix}: `);
  return answer.trim() || defaultValue;
}

function parseAgentSelection(value) {
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
    .filter((agent) => SUPPORTED_AGENTS.includes(agent)))];
}

function parseOptions(args) {
  const options = {};

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

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function help() {
  console.log(`fintech ${VERSION}

Usage:
  fintech setup [--reset] [--name <name>] [--email <email>] [--agents <agents>]
  fintech doctor
  fintech version
  fintech help

Most commands require setup first:
  fintech setup`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
