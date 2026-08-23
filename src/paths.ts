import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_FILE = fileURLToPath(import.meta.url);

export const REPO_ROOT = resolve(dirname(CURRENT_FILE), "..");
export const CONTENT_SKILLS_DIR = resolve(REPO_ROOT, "content", "skills");
export const SKILLS_REGISTRY_PATH = resolve(REPO_ROOT, "registry", "skills.json");
