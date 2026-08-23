import { homedir } from "node:os";
import { join } from "node:path";

export const VERSION = "0.1.0";
export const CONFIG_PATH = join(homedir(), ".config", "fintech-brain", "config.json");
export const INSTALLED_SKILLS_PATH = join(homedir(), ".config", "fintech-brain", "installed-skills.json");
export const CLAUDE_SKILLS_DIR = join(homedir(), ".claude", "skills");
export const OPENCODE_SKILLS_DIR = join(homedir(), ".config", "opencode", "skills");
export const ALLOWED_BEFORE_SETUP = new Set(["setup", "help", "--help", "-h", "version", "--version", "-v", "doctor", "completion"]);
export const SUPPORTED_AGENTS = ["opencode", "claude", "kiro"] as const;

export type SupportedAgent = typeof SUPPORTED_AGENTS[number];
