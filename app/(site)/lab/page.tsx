import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/site/PageTransition";
import { getAllLab } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Small, focused interaction studies, each with a live demo and notes on the decisions.",
};

export default async function LabPage() {
  const experiments = await getAllLab();

  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-[76rem] px-5 pb-20 sm:px-10">
        <header className="grid gap-8 pt-8 pb-12 sm:pt-14 lg:grid-cols-12">
          <p className="font-mono text-meta text-faint lg:col-span-3">Lab</p>
          <div className="lg:col-span-8">
            <h1 className="max-w-[22ch] text-h2 font-medium text-balance">
              Small interaction studies, built in code and slowed down so you can see the details.
            </h1>
          </div>
        </header>

        {experiments.length === 0 ? (
          // Empty state: says what will be here and when, and offers a next step.
          <section className="grid gap-8 border-t border-line pt-12 lg:grid-cols-12">
            <div className="lg:col-span-8 lg:col-start-4">
              <p className="font-mono text-meta text-faint">Nothing published yet</p>
              <p className="mt-3 max-w-[56ch] text-lead text-muted">
                Experiments go up here once they feel finished, roughly one a week. Each comes with
                a live demo, a slow-motion switch, and a short note on the decisions.
              </p>
              <Link
                href="/#work"
                transitionTypes={["nav-back"]}
                className="mt-6 inline-block text-ink underline"
              >
                See the case studies in the meantime
              </Link>
            </div>
          </section>
        ) : (
          <ul className="border-t border-line">
            {experiments.map(({ frontmatter }) => (
              <li key={frontmatter.slug} className="border-b border-line">
                <Link
                  href={`/lab/${frontmatter.slug}`}
                  transitionTypes={["nav-forward"]}
                  className="grid gap-1 py-6 sm:grid-cols-[1fr_2fr]"
                >
                  <span className="text-title font-medium">{frontmatter.title}</span>
                  <span className="text-muted">{frontmatter.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </PageTransition>
  );
}
