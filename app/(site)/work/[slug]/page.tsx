import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { ViewTransition } from "react";
import { Cover } from "@/components/case-study/cover";
import { mdxComponents } from "@/components/case-study/mdx-components";
import { ReadingChrome, SectionNav } from "@/components/case-study/reading-chrome";
import { PageTransition } from "@/components/site/page-transition";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { getAllWork, getWork } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllWork()).map((w) => ({ slug: w.meta.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) return {};
  return {
    title: `${work.meta.title} case study`,
    description: work.meta.summary,
    openGraph: { title: `${work.meta.title}: ${work.meta.summary}`, description: work.meta.tldr[0] },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) notFound();
  const { meta, next } = work;

  const { content } = await compileMDX({
    source: work.source,
    components: mdxComponents,
    // Local, trusted files: allow JS expressions for component props, keep the dangerous-JS guard on
    options: { blockJS: false, blockDangerousJS: true },
  });

  const facts = [
    ["Role", meta.role],
    ["Company", meta.company],
    ["Timeline", meta.timeline],
    ["Platform", meta.platform],
    ...(meta.team ? [["Team", meta.team]] : []),
  ];

  return (
    <PageTransition>
      <ReadingChrome sections={work.sections} />
      <article className="mx-auto max-w-[1320px] px-4 sm:px-8">
        {meta.draft && process.env.NODE_ENV === "development" ? (
          <p className="mt-6 rounded-[var(--radius-m)] border border-dashed border-danger/50 px-4 py-3 text-small text-danger">
            Draft written from the designs. Research details, personas and test findings need Samuel&apos;s confirmation before
            publishing. Search this file for TODO. (Only visible in development.)
          </p>
        ) : null}

        <header className="grid gap-10 pt-10 lg:grid-cols-12 lg:gap-8 lg:pt-16">
          <div className="flex flex-col lg:col-span-5">
            <Link
              href="/#work"
              transitionTypes={["nav-back"]}
              className="inline-flex w-fit items-center gap-2 text-small text-ink-2 hover:text-ink"
            >
              <ArrowLeft />
              All work
            </Link>
            <p className="mt-10 text-small text-ink-2">{meta.domain}</p>
            <h1 className="mt-2 text-h1 font-semibold">{meta.title}</h1>
            <p className="mt-4 max-w-[40ch] text-lead text-ink-2">{meta.summary}</p>

            <div className="mt-auto pt-10">
              <h2 className="text-small font-semibold">TL;DR</h2>
              <ul className="mt-3 space-y-2.5">
                {meta.tldr.map((line) => (
                  <li key={line} className="flex gap-3 text-ink">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="aspect-[1184/1032] overflow-hidden rounded-[var(--radius-l)] bg-sunken shadow-[var(--shadow-raised)]">
              <ViewTransition name={`cover-${meta.slug}`} share="morph" default="none">
                <div className="h-full w-full">
                  <Cover work={meta} sizes="(min-width: 1024px) 58vw, 100vw" priority />
                </div>
              </ViewTransition>
            </div>
          </div>
        </header>

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 md:grid-cols-5">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-micro text-ink-3">{k}</dt>
              <dd className="mt-1 text-small text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        {meta.outcomes.length ? (
          <section aria-label="Outcomes" className="mt-12 grid gap-6 sm:grid-cols-3">
            {meta.outcomes.map((o) => (
              <div key={o.label} className="rounded-[var(--radius-l)] bg-surface p-6">
                <p className="font-display text-h2 font-semibold tabular">{o.value}</p>
                <p className="mt-2 text-small text-ink-2">{o.label}</p>
              </div>
            ))}
          </section>
        ) : null}

        <div className="mt-20 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <SectionNav sections={work.sections} />
          </aside>
          <div className="min-w-0 lg:pr-[12%]">{content}</div>
        </div>

        <nav aria-label="Next case study" className="mt-32">
          <Link
            href={`/work/${next.slug}`}
            transitionTypes={["nav-forward"]}
            className="group grid items-center gap-6 rounded-[var(--radius-l)] border border-line bg-surface p-4 transition-colors duration-150 hover:border-line-strong sm:grid-cols-[200px_1fr_auto] sm:p-5"
          >
            <div className="aspect-[1184/1032] overflow-hidden rounded-[var(--radius-m)] bg-sunken">
              <ViewTransition name={`cover-${next.slug}`} share="morph" default="none">
                <div className="h-full w-full transition-transform duration-[280ms] ease-[var(--ease-enter)] group-hover:scale-[1.03]">
                  <Cover work={next} sizes="200px" />
                </div>
              </ViewTransition>
            </div>
            <div>
              <p className="text-small text-ink-2">Next case study</p>
              <p className="mt-1 font-display text-h3 font-semibold">{next.title}</p>
              <p className="mt-1 text-ink-2">{next.summary}</p>
            </div>
            <span className="hidden size-11 place-items-center rounded-full bg-ink text-paper transition-transform duration-[180ms] ease-[var(--ease-enter)] group-hover:translate-x-1 sm:grid">
              <ArrowRight />
            </span>
          </Link>
        </nav>
      </article>
    </PageTransition>
  );
}
