import type { SkillMetadata } from "./types.js";

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n?/;

export function splitFrontmatter(markdown: string): { body: string } {
  const match = markdown.match(FRONTMATTER_PATTERN);

  if (!match) {
    return { body: markdown.trimStart() };
  }

  return { body: markdown.slice(match[0].length).trimStart() };
}

export function renderSkillMarkdown(metadata: SkillMetadata, body: string): string {
  return `---
title: ${metadata.title}
author: ${metadata.author}
author_email: ${metadata.author_email}
tags: []
created: ${metadata.created}
updated: ${metadata.updated}
---

${body.trim()}
`;
}

export function extractTitle(markdown: string): string | null {
  const { body } = splitFrontmatter(markdown);
  const heading = body.match(/^#\s+(.+)$/m);
  return heading?.[1]?.trim() ?? null;
}
