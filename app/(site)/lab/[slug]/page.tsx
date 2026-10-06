import type { Metadata } from "next";
import { getAllLab, getLab } from "@/lib/content";

// Placeholder template. Demo shell and controls come in Phase 3.

// Only published experiments get a page.
export async function generateStaticParams() {
  const experiments = await getAllLab();
  return experiments.map(({ frontmatter }) => ({ slug: frontmatter.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/lab/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { frontmatter } = await getLab(slug);
  return { title: frontmatter.title, description: frontmatter.summary };
}

export default async function ExperimentPage({ params }: PageProps<"/lab/[slug]">) {
  const { slug } = await params;
  const { frontmatter, Content } = await getLab(slug);

  return (
    <main>
      <h1>{frontmatter.title}</h1>
      <Content />
    </main>
  );
}
