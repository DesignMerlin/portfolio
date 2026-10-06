import type { Metadata } from "next";
import { getWork, getWorkSlugs } from "@/lib/content";

// Placeholder template. The case study layout and components come in Phase 2.

export async function generateStaticParams() {
  const slugs = await getWorkSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Only slugs that exist in /content/work are valid; everything else is a 404.
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { frontmatter } = await getWork(slug);
  return { title: frontmatter.title, description: frontmatter.tldr.join(" ") };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const { frontmatter, Content } = await getWork(slug);

  return (
    <main>
      <h1>{frontmatter.title}</h1>
      <Content />
    </main>
  );
}
