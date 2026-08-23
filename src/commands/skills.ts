import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkbox } from "@inquirer/prompts";

import { installSkillForAgent } from "../agents/skills.js";
import { loadConfig } from "../config.js";
import { CONTENT_SKILLS_DIR } from "../paths.js";
import { hasHelpFlag, skillsHelp, skillsInstallHelp, skillsInstalledHelp, skillsListHelp, skillsPublishHelp } from "../help.js";
import { extractTitle, renderSkillMarkdown, splitFrontmatter } from "../skills/frontmatter.js";
import { loadInstalledSkills, saveInstalledSkills, upsertInstalledSkill } from "../skills/installed.js";
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
    case "install":
      void installSkills(subArgs);
      break;
    case "installed":
      installedSkills(subArgs);
      break;
    default:
      console.error(`Unknown skills command: ${subcommand}`);
      console.error("Run: fintech skills --help");
      process.exitCode = 1;
  }
}

async function installSkills(args: string[]): Promise<void> {
  if (hasHelpFlag(args)) {
    skillsInstallHelp();
    return;
  }

  const config = loadConfig();

  if (!config) {
    console.error("Local setup is required before installing skills.");
    console.error("Run: fintech setup");
    process.exit(1);
  }

  const registry = loadSkillRegistry();
  const requestedIds = args.filter((arg) => !arg.startsWith("--"));
  const selectedIds = requestedIds.length > 0 ? requestedIds : await selectSkills(registry.skills);

  if (selectedIds.length === 0) {
    console.log("No skills selected.");
    return;
  }

  const selectedSkills = selectedIds.map((id) => registry.skills.find((skill) => skill.id === id));
  const missingIds = selectedIds.filter((_, index) => !selectedSkills[index]);

  if (missingIds.length > 0) {
    console.error(`Unknown skills: ${missingIds.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const supportedAgents = config.agents.filter((agent) => agent === "opencode" || agent === "claude");

  if (supportedAgents.length === 0) {
    console.error("No supported agents configured for skill install. Supported agents: opencode, claude");
    process.exitCode = 1;
    return;
  }

  console.log("Installing selected skills for:");
  supportedAgents.forEach((agent) => console.log(`- ${agent}`));

  let installed = loadInstalledSkills();
  const installedAt = new Date().toISOString();

  for (const skill of selectedSkills) {
    if (!skill) {
      continue;
    }

    const installedAgents: string[] = [];

    for (const agent of supportedAgents) {
      const result = installSkillForAgent(agent, skill);

      if (!result) {
        continue;
      }

      installedAgents.push(agent);
      console.log(`ok ${skill.title} -> ${result.path}`);
    }

    installed = upsertInstalledSkill(installed, {
      id: skill.id,
      title: skill.title,
      agents: installedAgents,
      installed_at: installedAt
    });
  }

  saveInstalledSkills(installed);
}

async function selectSkills(skills: SkillRegistryEntry[]): Promise<string[]> {
  if (!process.stdin.isTTY) {
    console.error("Interactive install requires a terminal.");
    console.error("Use: fintech skills install <skill-id>");
    process.exit(1);
  }

  return checkbox({
    message: "Select skills to install",
    choices: skills.map((skill) => ({
      name: `${skill.title} - ${skill.description || "No description"}`,
      value: skill.id
    }))
  });
}

function installedSkills(args: string[]): void {
  if (hasHelpFlag(args)) {
    skillsInstalledHelp();
    return;
  }

  const installed = loadInstalledSkills();

  if (installed.skills.length === 0) {
    console.log("No skills installed yet.");
    console.log("Install one with: fintech skills install <skill-id>");
    return;
  }

  const rows = installed.skills.map((skill) => [
    skill.title,
    skill.agents.join(","),
    skill.installed_at
  ]);
  const headers = ["Skill", "Agents", "Installed At"];
  const widths = headers.map((header, index) => Math.max(header.length, ...rows.map((row) => row[index].length)));

  console.log(formatRow(headers, widths));
  console.log(formatRow(widths.map((width) => "-".repeat(width)), widths));
  rows.forEach((row) => console.log(formatRow(row, widths)));
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

  printSkillTable(registry.skills);
}

function printSkillTable(skills: SkillRegistryEntry[]): void {
  const headers = ["Skill", "Description", "Author", "Email"];
  const terminalWidth = process.stdout.columns || Number(process.env.COLUMNS) || 100;
  const descriptionWidth = Math.max("Description".length, Math.floor(terminalWidth * 0.5));
  const rows = skills.map((skill) => ({
    columns: [
      skill.title,
      skill.description || "-",
      skill.author,
      skill.author_email
    ],
    descriptionLines: wrapText(skill.description || "-", descriptionWidth)
  }));
  const widths = headers.map((header, index) => {
    if (index === 1) {
      return descriptionWidth;
    }

    return Math.max(header.length, ...rows.map((row) => row.columns[index].length));
  });

  console.log(formatRow(headers, widths));
  console.log(formatRow(widths.map((width) => "-".repeat(width)), widths));

  for (const row of rows) {
    const [firstDescriptionLine, ...remainingDescriptionLines] = row.descriptionLines;
    console.log(formatRow([
      row.columns[0],
      firstDescriptionLine ?? "",
      row.columns[2],
      row.columns[3]
    ], widths));

    for (const descriptionLine of remainingDescriptionLines) {
      console.log(formatRow(["", descriptionLine, "", ""], widths));
    }
  }
}

function formatRow(values: string[], widths: number[]): string {
  return values.map((value, index) => value.padEnd(widths[index])).join("  ");
}

function wrapText(value: string, width: number): string[] {
  if (value.length <= width) {
    return [value];
  }

  const words = value.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
      continue;
    }

    if (`${currentLine} ${word}`.length <= width) {
      currentLine = `${currentLine} ${word}`;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.flatMap((line) => splitLongLine(line, width));
}

function splitLongLine(value: string, width: number): string[] {
  if (value.length <= width) {
    return [value];
  }

  const lines: string[] = [];

  for (let index = 0; index < value.length; index += width) {
    lines.push(value.slice(index, index + width));
  }

  return lines;
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
    description: "",
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
