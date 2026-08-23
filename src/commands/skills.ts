import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadConfig } from "../config.js";
import { CONTENT_SKILLS_DIR } from "../paths.js";
import { hasHelpFlag, skillsHelp, skillsListHelp, skillsPublishHelp } from "../help.js";
import { extractTitle, renderSkillMarkdown, splitFrontmatter } from "../skills/frontmatter.js";
import { loadSkillRegistry, relativeToRepo, saveSkillRegistry, upsertSkill } from "../skills/registry.js";
import { slugify } from "../skills/slug.js";
import type { SkillMetadata, SkillRegistryEntry } from "../skills/types.js";

export function skills(args: string[]): void {
  const [subcommand, ...subArgs] = args;

  if (!subcommand || (hasHelpFlag(args) && subcommand.startsWith("-"))) {
    skillsHelp();
    return;
  }

  switch (subcommand) {
    case "list":
      listSkills(subArgs);
      break;
    case "publish":
      publishSkill(subArgs);
      break;
    default:
      console.error(`Unknown skills command: ${subcommand}`);
      console.error("Run: fintech skills --help");
      process.exitCode = 1;
  }
}

function listSkills(args: string[]): void {
  if (hasHelpFlag(args)) {
    skillsListHelp();
    return;
  }

  const registry = loadSkillRegistry();

  if (registry.skills.length === 0) {
    console.log("No skills published yet.");
    console.log("Publish one with: fintech skills publish <file.md>");
    return;
  }

  for (const skill of registry.skills) {
    const tags = skill.tags.length > 0 ? skill.tags.join(",") : "-";
    console.log(`${skill.id}\t${skill.title}\t${skill.author}\t${tags}`);
  }
}

function publishSkill(args: string[]): void {
  if (hasHelpFlag(args)) {
    skillsPublishHelp();
    return;
  }

  const fileArg = args.find((arg) => !arg.startsWith("--"));

  if (!fileArg) {
    skillsPublishHelp();
    process.exitCode = 1;
    return;
  }

  const config = loadConfig();

  if (!config) {
    console.error("Local setup is required before publishing skills.");
    console.error("Run: fintech setup");
    process.exit(1);
  }

  const sourcePath = resolve(process.cwd(), fileArg);
  const source = readFileSync(sourcePath, "utf8");
  const title = extractTitle(source);

  if (!title) {
    console.error("Skill file must contain a top-level markdown heading, for example: # Debug flaky tests");
    process.exitCode = 1;
    return;
  }

  const id = slugify(title);

  if (!id) {
    console.error("Could not derive a skill id from the title.");
    process.exitCode = 1;
    return;
  }

  const targetPath = resolve(CONTENT_SKILLS_DIR, `${id}.md`);

  if (existsSync(targetPath)) {
    console.error(`Skill already exists: ${id}`);
    console.error("Publishing cannot overwrite existing skills. Future update/contribution flows will handle changes.");
    process.exitCode = 1;
    return;
  }

  const now = new Date().toISOString();
  const metadata: SkillMetadata = {
    title,
    author: config.name,
    author_email: config.email,
    tags: [],
    created: now,
    updated: now
  };
  const { body } = splitFrontmatter(source);

  mkdirSync(CONTENT_SKILLS_DIR, { recursive: true });
  writeFileSync(targetPath, renderSkillMarkdown(metadata, body));

  const entry: SkillRegistryEntry = {
    id,
    path: relativeToRepo(targetPath),
    ...metadata
  };
  const registry = upsertSkill(loadSkillRegistry(), entry);
  saveSkillRegistry(registry);

  console.log("Published skill:");
  console.log(`id: ${entry.id}`);
  console.log(`title: ${entry.title}`);
  console.log(`path: ${entry.path}`);
  console.log(`author: ${entry.author}`);
}
