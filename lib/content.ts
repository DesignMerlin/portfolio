import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { MDXContent } from "mdx/types";
import { z } from "zod";
import { slugify } from "./slugify";

// Typed loading for /content. Server-only (uses the file system).
// Frontmatter is validated here so a missing field fails the build
// instead of rendering a broken page.

const CONTENT_DIR = path.join(process.cwd(), "content");

export const workSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
  // Coerced: YAML reads a bare year (timeline: 2024) as a number.
  timeline: z.coerce.string().min(1),
  domain: z.string().min(1),
  tldr: z.array(z.string().min(1)).length(3),
  outcomes: z.array(z.string().min(1)),
  cover: z.string().min(1),
  featured: z.boolean(),
  // Optional: position in the work list (lower first). Falls back to file order.
  order: z.number().optional(),
  // Optional: one line for the work list. Falls back to the first TL;DR line.
  summary: z.string().min(1).optional(),
});

export const labSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  // Lab rule: nothing is listed until it feels finished.
  published: z.boolean(),
  source: z.url().optional(),
});

export type WorkFrontmatter = z.infer<typeof workSchema>;
export type LabFrontmatter = z.infer<typeof labSchema>;

export type Entry<T> = { frontmatter: T; Content: MDXContent };

type Collection = "work" | "lab";

// Files starting with "_" are drafts/templates and are never loaded.
async function listSlugs(collection: Collection): Promise<string[]> {
  let files: string[];
  try {
    files = await readdir(path.join(CONTENT_DIR, collection));
  } catch {
    return [];
  }
  return files
    .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
    .map((file) => file.slice(0, -".mdx".length))
    .sort();
}

function parse<T>(schema: z.ZodType<T>, raw: unknown, file: string, slug: string): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid frontmatter in ${file}:\n${z.prettifyError(result.error)}`);
  }
  const data = result.data as T & { slug: string };
  if (data.slug !== slug) {
    throw new Error(`${file}: frontmatter slug "${data.slug}" must match the file name "${slug}"`);
  }
  return data;
}

// One import per collection keeps the paths static enough for the bundler.
export async function getWork(slug: string): Promise<Entry<WorkFrontmatter>> {
  const mod = await import(`@/content/work/${slug}.mdx`);
  return {
    frontmatter: parse(workSchema, mod.frontmatter, `content/work/${slug}.mdx`, slug),
    Content: mod.default,
  };
}

export async function getLab(slug: string): Promise<Entry<LabFrontmatter>> {
  const mod = await import(`@/content/lab/${slug}.mdx`);
  return {
    frontmatter: parse(labSchema, mod.frontmatter, `content/lab/${slug}.mdx`, slug),
    Content: mod.default,
  };
}

export async function getAllWork(): Promise<Entry<WorkFrontmatter>[]> {
  const slugs = await listSlugs("work");
  const entries = await Promise.all(slugs.map(getWork));
  return entries.sort(
    (a, b) => (a.frontmatter.order ?? Infinity) - (b.frontmatter.order ?? Infinity),
  );
}

// Section headings (## …) of an MDX file, for the case study navigator.
export type Heading = { id: string; text: string };

export async function getWorkHeadings(slug: string): Promise<Heading[]> {
  const source = await readFile(path.join(CONTENT_DIR, "work", `${slug}.mdx`), "utf8");
  return [...source.matchAll(/^## (.+)$/gm)].map((match) => {
    const text = match[1]!.trim();
    return { id: slugify(text), text };
  });
}

// A cover only renders as an image once the file exists in /public.
// Until then the designed placeholder shows, so nothing ever looks broken.
export async function resolveCover(cover: string): Promise<string | null> {
  try {
    await access(path.join(process.cwd(), "public", cover));
    return cover;
  } catch {
    return null;
  }
}

/** Plain data for the work list (safe to pass to client components). */
export type WorkSummary = {
  slug: string;
  title: string;
  summary: string;
  domain: string;
  timeline: string;
  role: string;
  cover: string | null;
};

export async function getWorkSummaries(): Promise<WorkSummary[]> {
  const entries = await getAllWork();
  return Promise.all(
    entries.map(async ({ frontmatter: f }) => ({
      slug: f.slug,
      title: f.title,
      summary: f.summary ?? f.tldr[0]!,
      domain: f.domain,
      timeline: f.timeline,
      role: f.role,
      cover: await resolveCover(f.cover),
    })),
  );
}

export async function getAllLab(): Promise<Entry<LabFrontmatter>[]> {
  const slugs = await listSlugs("lab");
  const entries = await Promise.all(slugs.map(getLab));
  return entries.filter((entry) => entry.frontmatter.published);
}

export const getWorkSlugs = () => listSlugs("work");
export const getLabSlugs = () => listSlugs("lab");
