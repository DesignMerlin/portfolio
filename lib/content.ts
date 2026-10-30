import "server-only";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

const CONTENT = path.join(process.cwd(), "content");

/* ------------------------------------------------------------------ */
/* Profile: flat frontmatter of content/profile.md                     */
/* ------------------------------------------------------------------ */

export type Profile = {
  name: string;
  title: string;
  location: string;
  timezone: string;
  availability: string;
  email: string;
  linkedin: string | null;
  x: string | null;
  instagram: string | null;
  behance: string | null;
  cv_url: string | null;
};

export const getProfile = cache(async (): Promise<Profile> => {
  const raw = await readFile(path.join(CONTENT, "profile.md"), "utf8");
  const block = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const data: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m?.[1]) data[m[1]] = (m[2] ?? "").trim();
  }
  // TODO values in profile.md mean "not public yet": hide those links instead of shipping them
  const real = (v: string | undefined) => (v && v !== "TODO" ? v : null);
  return {
    name: data.name ?? "Samuel Ekwenze",
    title: data.title ?? "",
    location: data.location ?? "",
    timezone: data.timezone ?? "",
    availability: data.availability ?? "",
    email: data.email ?? "",
    linkedin: real(data.linkedin),
    x: real(data.x_twitter),
    instagram: real(data.instagram),
    behance: real(data.behance),
    cv_url: real(data.cv_url),
  };
});

/* ------------------------------------------------------------------ */
/* Case studies: content/work/*.mdx                                    */
/* ------------------------------------------------------------------ */

export type Outcome = { value: string; label: string };

export type WorkMeta = {
  title: string;
  slug: string;
  summary: string;
  role: string;
  company: string;
  timeline: string;
  year: string;
  domain: string;
  platform: string;
  team?: string;
  tldr: [string, string, string];
  outcomes: Outcome[];
  cover: string | null;
  coverAlt: string;
  tint: string;
  featured: boolean;
  order: number;
  /** Drafted from designs; Samuel still needs to confirm research details */
  draft?: boolean;
};

export type WorkSection = { id: string; title: string };

export type WorkEntry = {
  meta: WorkMeta;
  source: string;
  sections: WorkSection[];
};

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  return { yaml: match?.[1] ?? "", body: match ? raw.slice(match[0].length) : raw };
}

/** Frontmatter is authored as JSON-compatible YAML (one object), parsed strictly */
function readMeta(yaml: string, file: string): WorkMeta {
  let meta: WorkMeta;
  try {
    meta = JSON.parse(yaml) as WorkMeta;
  } catch (e) {
    throw new Error(`Invalid frontmatter in ${file}: ${(e as Error).message}`);
  }
  if (meta.tldr?.length !== 3) throw new Error(`${file}: tldr must be exactly 3 lines`);
  return meta;
}

export const getAllWork = cache(async (): Promise<WorkEntry[]> => {
  const dir = path.join(CONTENT, "work");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));
  const entries = await Promise.all(
    files.map(async (file) => {
      const raw = (await readFile(path.join(dir, file), "utf8")).replace(/\r\n/g, "\n");
      const { yaml, body } = parseFrontmatter(raw);
      const meta = readMeta(yaml, file);
      const sections = [...body.matchAll(/<Section\s+id="([^"]+)"\s+title="([^"]+)"/g)].map(
        (m) => ({ id: m[1]!, title: m[2]! }),
      );
      return { meta, source: body, sections };
    }),
  );
  return entries.sort((a, b) => a.meta.order - b.meta.order);
});

export async function getWork(slug: string) {
  const all = await getAllWork();
  const index = all.findIndex((w) => w.meta.slug === slug);
  if (index === -1) return null;
  const next = all[(index + 1) % all.length]!;
  return { ...all[index]!, next: next.meta };
}
