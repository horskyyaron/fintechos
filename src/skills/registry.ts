import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";

import { REPO_ROOT, SKILLS_REGISTRY_PATH } from "../paths.js";
import type { SkillRegistry, SkillRegistryEntry } from "./types.js";

export function loadSkillRegistry(): SkillRegistry {
  try {
    return JSON.parse(readFileSync(SKILLS_REGISTRY_PATH, "utf8")) as SkillRegistry;
  } catch {
    return { skills: [] };
  }
}

export function saveSkillRegistry(registry: SkillRegistry): void {
  mkdirSync(dirname(SKILLS_REGISTRY_PATH), { recursive: true });
  const sorted = [...registry.skills].sort((left, right) => left.id.localeCompare(right.id));
  writeFileSync(SKILLS_REGISTRY_PATH, `${JSON.stringify({ skills: sorted }, null, 2)}\n`);
}

export function relativeToRepo(path: string): string {
  return relative(REPO_ROOT, path);
}

export function upsertSkill(registry: SkillRegistry, entry: SkillRegistryEntry): SkillRegistry {
  const existingIndex = registry.skills.findIndex((skill) => skill.id === entry.id);

  if (existingIndex === -1) {
    return { skills: [...registry.skills, entry] };
  }

  const skills = [...registry.skills];
  skills[existingIndex] = entry;
  return { skills };
}
