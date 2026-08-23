import { execFileSync } from "node:child_process";

export function getGitConfig(key: string): string {
  try {
    return execFileSync("git", ["config", key], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}
