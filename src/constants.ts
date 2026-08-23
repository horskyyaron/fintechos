import { homedir } from "node:os";
import { join } from "node:path";

export const VERSION = "0.1.0";
export const CONFIG_PATH = join(homedir(), ".config", "fintech-brain", "config.json");
export const ALLOWED_BEFORE_SETUP = new Set(["setup", "help", "--help", "-h", "version", "--version", "-v", "doctor", "completion"]);
export const SUPPORTED_AGENTS = ["opencode", "claude", "kiro"] as const;

export type SupportedAgent = typeof SUPPORTED_AGENTS[number];
