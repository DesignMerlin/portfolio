import type { Metadata } from "next";
import Link from "next/link";
import { getAllLab } from "@/lib/content";

// Placeholder. The Lab index is designed in Phase 3.

export const metadata: Metadata = { title: "Lab" };

export default async function LabPage() {
  const experiments = await getAllLab();

  return (
    <main>
      <h1>Lab</h1>
      {experiments.length === 0 ? (
        <p>The first experiment is on its way.</p>
      ) : (
        <ul>
          {experiments.map(({ frontmatter }) => (
            <li key={frontmatter.slug}>
              <Link href={`/lab/${frontmatter.slug}`}>{frontmatter.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
