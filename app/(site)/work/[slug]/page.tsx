import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { ViewTransition } from "react";
import { KeyScreens } from "@/components/case-study/key-screens";
import { mdxComponents } from "@/components/case-study/mdx-components";
import { RandomTwo } from "@/components/case-study/random-two";
import { ProjectArt } from "@/components/case-study/project-art";
import { ReadingChrome, SectionNav } from "@/components/case-study/reading-chrome";
import { PageTransition } from "@/components/site/page-transition";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown } from "@/components/ui/icons";
import { RollingNumber } from "@/components/ui/rolling-number";
import { pickSections } from "@/lib/content";
import { getProjects } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

/** The tabs, the same on every project page */
const TABS = [
  { id: "overview", title: "Overview" },
  { id: "challenge", title: "The challenge" },
  { id: "how-i-worked", title: "How I worked" },
  { id: "outcome", title: "Outcome" },
  { id: "key-screens", title: "Key screens" },
];

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

const isDev = process.env.NODE_ENV === "development";

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProjects()).find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.entry ? `${p.title} case study` : p.title,
    description: p.summary,
    openGraph: { title: `${p.title}: ${p.detail.headline}`, description: p.tldr?.[0] ?? p.summary },
    // Unfinished write-ups stay out of search until they're real
    ...(p.entry ? {} : { robots: { index: false } }),
  };
}

/** A page section: its name on the left, what it says on the right */
function Row({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} data-section aria-labelledby={`${id}-title`} className="grid gap-x-8 gap-y-3 border-t border-line py-10 md:grid-cols-[200px_minmax(0,1fr)] lg:py-14">
      <h2 id={`${id}-title`} className="font-sans font-medium tracking-[-0.02em] text-ink">
        {title}
      </h2>
      <div className="max-w-[62ch]">{children}</div>
    </section>
  );
}


export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  if (!project) notFound();
  const { detail, entry } = project;
  // Only the sections there's something confirmed to say in
  const has: Record<string, boolean> = {
    challenge: !!detail.challenge,
    "how-i-worked": !!detail.approach,
    outcome: !!detail.outcome || project.outcomes.length > 0,
    "key-screens": !!detail.keyScreens?.length,
  };
  const tabs = TABS.filter((t) => has[t.id] ?? true);
  // Every other project there's something to see of. Two are shown, at random
  const more = projects.map((_, n) => projects[(index + 1 + n) % projects.length]!).filter((x) => x.slug !== slug && (x.mockup || x.cover));

  const mdx = async (keep: (id: string) => boolean) =>
    entry && pickSections(entry.source, keep)
      ? (
          await compileMDX({
            source: pickSections(entry.source, keep),
            components: mdxComponents,
            // Local, trusted files: allow JS expressions for component props, keep the dangerous-JS guard on
            options: { blockJS: false, blockDangerousJS: true },
          })
        ).content
      : null;
  // What the tabs already say isn't repeated in the full process. Prototypes aren't shown on the page
  const covered = new Set(["context", "problem", "prototype", "outcome"]);
  const fullProcess = await mdx((id) => !covered.has(id));

  return (
    <PageTransition>
      <ReadingChrome sections={tabs} />
      <article className="mx-auto grid max-w-[1320px] gap-x-16 px-4 pt-8 sm:px-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:pt-12">
        <aside>
          <div className="lg:sticky lg:top-28">
            <Link href="/#work" transitionTypes={["nav-back"]} className="inline-flex w-fit items-center gap-2 text-small text-ink-2 hover:text-ink">
              <ArrowLeft />
              All work
            </Link>
            <div className="mt-8 hidden lg:block">
              <SectionNav sections={tabs} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 max-w-[1020px]">
          {/* Overview */}
          <section id="overview" data-section aria-labelledby="project-title" className="pt-8 lg:pt-0">
            {entry?.meta.draft && isDev ? (
              <p className="mb-8 rounded-[var(--radius-m)] border border-dashed border-danger/50 px-4 py-3 text-small text-danger">
                Draft written from the designs. Research details, personas and test findings need Samuel&apos;s confirmation before
                publishing. Search this file for TODO. (Only visible in development.)
              </p>
            ) : null}
            <p className="text-ink-2">{project.title}</p>
            <h1 id="project-title" className="mt-2 max-w-[24ch] font-display text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1.02] font-semibold text-balance">
              {detail.headline}
            </h1>
            <p className="mt-4 max-w-[60ch] text-lead text-ink-2">{project.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
            <ul aria-label="Topics" className="flex flex-wrap gap-1.5">
              {detail.tags.map((t) => (
                <li key={t} className="rounded-full border border-line px-3 py-1 text-small text-ink-2">
                  {t}
                </li>
              ))}
            </ul>
            {detail.site ? (
              <a
                href={detail.site}
                target="_blank"
                rel="noopener noreferrer"
                className="pressable group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-small font-medium text-paper hover:opacity-90"
              >
                Visit site
                <span className="sr-only"> ({new URL(detail.site).hostname}, opens in a new tab)</span>
                <ArrowUpRight className="transition-transform duration-[var(--dur-quick)] ease-[var(--ease-enter)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ) : null}
            </div>

            <div className="mt-8 aspect-[1184/1032] overflow-hidden rounded-[var(--radius-l)] bg-sunken sm:aspect-[1184/860]">
              <ViewTransition name={`cover-${project.slug}`} share="morph" default="none">
                <div className="h-full w-full">
                  <ProjectArt project={project} sizes="(min-width: 1024px) 1020px, 100vw" interactive />
                </div>
              </ViewTransition>
            </div>
          </section>

          <div className="mt-10 lg:mt-14">
            {detail.challenge ? (
              <Row id="challenge" title="The challenge">
                <p className="text-lead text-ink">{detail.challenge}</p>
              </Row>
            ) : null}
            {detail.approach ? (
              <Row id="how-i-worked" title="How I worked">
                <p className="text-lead text-ink">{detail.approach}</p>
              </Row>
            ) : null}
            {fullProcess ? (
              <details className="full-process -mt-6 mb-10 lg:-mt-8 lg:mb-14">
                <summary className="pressable inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-strong px-4 py-2.5 text-small font-medium hover:border-ink-3 md:ml-[232px]">
                  Read the full process
                  <ChevronDown />
                </summary>
                <div className="pt-12">{fullProcess}</div>
              </details>
            ) : null}
            {has.outcome ? (
            <Row id="outcome" title="Outcome">
              {detail.outcome ? <p className="text-lead text-ink">{detail.outcome}</p> : null}
              {project.outcomes.length ? (
                <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-3">
                  {project.outcomes.map((o) => (
                    <div key={o.label}>
                      <dt className="sr-only">{o.label}</dt>
                      <dd>
                        <RollingNumber value={o.value} className="block font-display text-h2 font-semibold tabular" />
                        <span className="mt-1 block text-small text-ink-2">{o.label}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </Row>
            ) : null}
            <section id="key-screens" data-section aria-labelledby="key-screens-title" className="border-t border-line pt-10 lg:pt-14">
              <h2 id="key-screens-title" className="mb-8 font-display text-h2 font-semibold">
                Key screens
              </h2>
              <KeyScreens groups={detail.keyScreens} tint={project.tint} kind={detail.kind} title={project.title} />
            </section>
          </div>

          <nav aria-label="More work" className="mt-24 border-t border-line pt-10">
            <p className="font-display text-h3 font-semibold">More work</p>
            <RandomTwo
              key={slug}
              className="mt-6 grid gap-x-4 gap-y-8 sm:grid-cols-2"
              items={more.map((p) => (
                <li key={p.slug}>
                  <Link href={`/work/${p.slug}`} transitionTypes={["nav-forward"]} className="group block">
                    <div className="aspect-[1184/1032] overflow-hidden rounded-[var(--radius-l)] bg-sunken">
                      <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
                        <div className="h-full w-full">
                          <ProjectArt project={p} sizes="(min-width: 640px) 500px, 100vw" />
                        </div>
                      </ViewTransition>
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-small text-ink-2">{p.detail.headline}</p>
                      </div>
                      <ArrowRight className="mt-1 shrink-0 text-ink-3 transition-transform duration-[var(--dur-quick)] ease-[var(--ease-enter)] group-hover:translate-x-1" />
                    </div>
                  </Link>
                </li>
              ))}
            />
          </nav>
        </div>
      </article>
    </PageTransition>
  );
}
