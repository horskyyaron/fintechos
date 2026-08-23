import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { CLAUDE_SKILLS_DIR, OPENCODE_SKILLS_DIR, type SupportedAgent } from "../constants.js";
import { REPO_ROOT } from "../paths.js";
import { splitFrontmatter } from "../skills/frontmatter.js";
import type { SkillRegistryEntry } from "../skills/types.js";

export type AgentInstallResult = {
  agent: SupportedAgent;
  path: string;
};

export function installSkillForAgent(agent: SupportedAgent, skill: SkillRegistryEntry): AgentInstallResult | null {
  if (agent === "claude") {
    return installSkill(skill, resolve(CLAUDE_SKILLS_DIR, skill.id, "SKILL.md"), agent);
  }

  if (agent === "opencode") {
    return installSkill(skill, resolve(OPENCODE_SKILLS_DIR, skill.id, "SKILL.md"), agent);
  }

  return null;
}

function installSkill(skill: SkillRegistryEntry, targetPath: string, agent: SupportedAgent): AgentInstallResult {
  const source = readFileSync(resolve(REPO_ROOT, skill.path), "utf8");
  const { body } = splitFrontmatter(source);
  const rendered = renderAgentSkill(skill, body);

  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, rendered);

  return { agent, path: targetPath };
}

function renderAgentSkill(skill: SkillRegistryEntry, body: string): string {
  return `---
name: ${skill.id}
description: ${skill.description || skill.title}
---

${body.trim()}
`;
}
