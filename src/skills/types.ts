export type SkillMetadata = {
  title: string;
  author: string;
  author_email: string;
  tags: string[];
  created: string;
  updated: string;
};

export type SkillRegistryEntry = SkillMetadata & {
  id: string;
  path: string;
  description: string;
};

export type SkillRegistry = {
  skills: SkillRegistryEntry[];
};
