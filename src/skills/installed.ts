import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { INSTALLED_SKILLS_PATH } from "../constants.js";
import type { InstalledSkillEntry, InstalledSkills } from "./types.js";

export function loadInstalledSkills(): InstalledSkills {
  try {
    return JSON.parse(readFileSync(INSTALLED_SKILLS_PATH, "utf8")) as InstalledSkills;
  } catch {
    return { skills: [] };
  }
}

export function saveInstalledSkills(installed: InstalledSkills): void {
  mkdirSync(dirname(INSTALLED_SKILLS_PATH), { recursive: true });
  const sorted = [...installed.skills].sort((left, right) => left.id.localeCompare(right.id));
  writeFileSync(INSTALLED_SKILLS_PATH, `${JSON.stringify({ skills: sorted }, null, 2)}\n`);
}

export function upsertInstalledSkill(installed: InstalledSkills, entry: InstalledSkillEntry): InstalledSkills {
  const existingIndex = installed.skills.findIndex((skill) => skill.id === entry.id);

  if (existingIndex === -1) {
    return { skills: [...installed.skills, entry] };
  }

  const skills = [...installed.skills];
  skills[existingIndex] = entry;
  return { skills };
}
