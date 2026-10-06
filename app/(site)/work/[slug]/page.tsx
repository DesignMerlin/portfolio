import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { ReadingProgress } from "@/components/case-study/ReadingProgress";
import { SectionNav } from "@/components/case-study/SectionNav";
import { PageTransition } from "@/components/site/PageTransition";
import { Cover } from "@/components/work/Cover";
import {
  getWork,
  getWorkHeadings,
  getWorkSlugs,
  getWorkSummaries,
  resolveCover,
} from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await getWorkSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Only slugs that exist in /content/work are valid; everything else is a 404.
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { frontmatter } = await getWork(slug);
  return {
    title: frontmatter.title,
    description: frontmatter.tldr.join(" "),
    openGraph: { title: frontmatter.title, description: frontmatter.tldr[0] },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const [{ frontmatter: f, Content }, headings, all] = await Promise.all([
    getWork(slug),
    getWorkHeadings(slug),
    getWorkSummaries(),
  ]);
  const cover = await resolveCover(f.cover);

  const index = all.findIndex((project) => project.slug === slug);
  const next = all[(index + 1) % all.length];

  const meta = [
    { term: "Role", value: f.role },
    { term: "Company", value: f.company },
    { term: "Timeline", value: f.timeline },
    { term: "Domain", value: f.domain },
  ];

  return (
    <PageTransition>
      <ReadingProgress />
      <main className="mx-auto w-full max-w-[76rem] px-5 sm:px-10">
        <Link
          href="/#work"
          transitionTypes={["nav-back"]}
          className="inline-flex h-10 items-center gap-2 font-mono text-meta text-muted hover:text-fg"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          All work
        </Link>

        <header className="pt-6 pb-10 sm:pt-10">
          <h1 tabIndex={-1} className="text-display font-medium focus:outline-none">
            {f.title}
          </h1>

          {/* TL;DR: the three lines a reviewer needs if they read nothing else. */}
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p id="in-short" className="mb-3 font-mono text-meta text-faint">
                In short
              </p>
              <ul
                className="space-y-3 text-base text-pretty sm:text-lead"
                aria-labelledby="in-short"
              >
                {f.tldr.map((line) => (
                  <li key={line} className="max-w-[56ch]">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-start lg:col-span-4 lg:grid-cols-1">
              {meta.map(({ term, value }) => (
                <div key={term}>
                  <dt className="font-mono text-meta text-faint">{term}</dt>
                  <dd className="mt-0.5 text-sm">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <ViewTransition name={`cover-${slug}`} share="morph" default="none">
          <div>
            <Cover
              title={f.title}
              domain={f.domain}
              src={cover}
              sizes="(min-width: 76rem) 1120px, 100vw"
              priority
              large
            />
          </div>
        </ViewTransition>

        {f.outcomes.length > 0 && (
          <section aria-labelledby="outcomes" className="mt-12 border-y border-line py-8">
            <h2 id="outcomes" className="font-mono text-meta text-faint">
              Outcomes
            </h2>
            <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {f.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="border-l-2 border-stamp pl-4 text-title font-medium text-pretty"
                >
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid gap-10 py-16 lg:grid-cols-12 lg:py-20">
          <aside className="hidden lg:col-span-3 lg:block">
            <SectionNav headings={headings} />
          </aside>
          <article className="min-w-0 lg:col-span-8 lg:col-start-5">
            <Content />
          </article>
        </div>

        {next && next.slug !== slug && (
          <nav aria-label="Next case study" className="border-t border-line py-12">
            <Link
              href={`/work/${next.slug}`}
              transitionTypes={["nav-forward"]}
              className="group block"
            >
              <span className="font-mono text-meta text-faint">Next case study</span>
              <span className="mt-2 block text-h2 font-medium group-hover:text-ink">
                {next.title}
              </span>
              <span className="mt-1 block text-muted">{next.summary}</span>
            </Link>
          </nav>
        )}
      </main>
    </PageTransition>
  );
}
