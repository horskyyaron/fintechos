import { constants, accessSync, readFileSync } from "node:fs";

import { CONFIG_PATH, SUPPORTED_AGENTS, type SupportedAgent } from "./constants.js";

export type FintechConfig = {
  version: 1;
  name: string;
  email: string;
  agents: SupportedAgent[];
  default_confidentiality: "internal";
  created_at: string;
  updated_at: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export function loadConfig(): FintechConfig | null {
  try {
    accessSync(CONFIG_PATH, constants.R_OK);
    return JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as FintechConfig;
  } catch {
    return null;
  }
}

export function validateConfig(config: unknown): ValidationResult {
  const errors: string[] = [];

  if (!config || typeof config !== "object") {
    return { valid: false, errors: ["Config is missing."] };
  }

  const candidate = config as Partial<FintechConfig>;

  if (candidate.version !== 1) {
    errors.push("Unsupported config version.");
  }

  if (!candidate.name || typeof candidate.name !== "string") {
    errors.push("Name is required.");
  }

  if (!isValidEmail(candidate.email)) {
    errors.push("A valid email is required.");
  }

  if (!Array.isArray(candidate.agents) || candidate.agents.length === 0) {
    errors.push("At least one coding agent is required.");
  } else {
    const unsupportedAgents = candidate.agents.filter((agent) => !isSupportedAgent(agent));
    if (unsupportedAgents.length > 0) {
      errors.push(`Unsupported agents: ${unsupportedAgents.join(", ")}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isSupportedAgent(agent: unknown): agent is SupportedAgent {
  return typeof agent === "string" && (SUPPORTED_AGENTS as readonly string[]).includes(agent);
}
