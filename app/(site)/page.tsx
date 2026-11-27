import Link from "next/link";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { WorkExperience } from "@/components/home/work-experience";
import { StickerCard, type StickerWork } from "@/components/home/sticker-grid/sticker-card";
import { ScrollSentence } from "@/components/home/scroll-sentence";
import { SectionHeading } from "@/components/ui/section-heading";
import { RollingNumber } from "@/components/ui/rolling-number";
import { PageTransition } from "@/components/site/page-transition";
import { getAllWork, getProfile } from "@/lib/content";
import { archive } from "@/content/archive";
import { workMockups } from "@/content/mockups";
import { heroIntro, heroPhoto, skills, workExperience } from "@/content/about";
import { ServicesSection } from "@/components/home/services-section";
import { ArcDial } from "@/components/home/arc-dial/arc-dial";
import { testimonials } from "@/content/testimonials";
import { details } from "@/content/details";

// Confirmed numbers only (content/profile.md). Unattributed ones stay out until Samuel confirms them.
const impact = [
  { value: "10,000", label: "downloads in HeightGPT's first week" },
  { value: "100+", label: "design tokens in a system built from zero" },
  { value: "30%", label: "faster time-to-task for iExcelo students" },
  { value: "$1M", label: "pre-seed raised by Immigify while I led design" },
];

/** The order of the six cards (anything not listed keeps its place after these) */
const HOME_ORDER = ["room8", "revival-stream", "iexcelo", "immigify-case-tracker", "fundpath", "yoyo"];
const rank = (slug: string) => {
  const i = HOME_ORDER.indexOf(slug);
  return i === -1 ? HOME_ORDER.length : i;
};

export default async function HomePage() {
  const [profile, work] = await Promise.all([getProfile(), getAllWork()]);
  const featured = work.filter((w) => w.meta.featured).map((w) => w.meta);

  // Six stickers: projects with something to show first, case studies before shipped work
  const stickers: StickerWork[] = [
    ...featured.map((m) => ({
      id: m.slug,
      title: m.title,
      year: m.year || undefined,
      label: details[m.slug]?.tags.join(" + "),
      cover: m.cover,
      tint: m.tint,
      placeholder: "web" as const,
      mockup: workMockups[m.slug],
      href: `/work/${m.slug}`,
      morphName: `cover-${m.slug}`,
    })),
    ...archive.map((a) => ({
      id: a.slug,
      title: a.title,
      year: a.year,
      label: details[a.slug]?.tags.join(" + "),
      cover: null,
      tint: a.tint,
      placeholder: a.kind,
      mockup: a.mockup,
      href: `/work/${a.slug}`,
      morphName: `cover-${a.slug}`,
    })),
  ]
    .sort((a, b) => Number(!(a.mockup || a.cover)) - Number(!(b.mockup || b.cover)) || rank(a.id) - rank(b.id))
    // Only projects with something real to show
    .filter((s) => s.mockup || s.cover)
    .slice(0, 6);
  // Only quotes the person has approved go live. In development the drafts show too, marked, so they can be
  // seen in place while they wait for a yes (content/testimonials.ts)
  const drafts = process.env.NODE_ENV === "development";
  const quotes = testimonials.filter((t) => !t.placeholder || drafts);

  return (
    <PageTransition>
      <HeroShowcase
        first={profile.name.split(" ")[0] ?? profile.name}
        last={profile.name.split(" ").slice(1).join(" ")}
        photo={heroPhoto}
        intro={heroIntro}
      />
      <ServicesSection services={skills} />

      <section id="work" aria-labelledby="work-title" className="mx-auto max-w-[1320px] px-4 pt-14 sm:px-8 lg:pt-20">
        <div className="mb-8">
          <SectionHeading id="work-title" sub="A carefully picked showcase of projects that highlight my commitment to this design industry.">
            Selected work samples
          </SectionHeading>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          {stickers.map((w, i) => (
            <StickerCard key={w.id} work={w} priority={i < 2} />
          ))}
        </ul>
        {/* After the six, where the reader has just finished looking: the way on to the rest */}
        <div className="mt-12 flex justify-center lg:mt-16">
          <Link
            href="/projects"
            transitionTypes={["nav-forward"]}
            className="pressable inline-flex items-center rounded-full border border-line-strong px-6 py-3 text-small font-medium text-ink transition-colors duration-[var(--dur-quick)] hover:border-ink-3 hover:bg-sunken"
          >
            View all projects
          </Link>
        </div>
      </section>

      <WorkExperience jobs={workExperience} />

      <section aria-label="How I work" className="mx-auto mt-32 max-w-[1320px] px-4 sm:px-8 lg:mt-44">
        <div className="flex justify-center text-center">
          <ScrollSentence />
        </div>
      </section>

      <section aria-labelledby="impact-title" className="mx-auto mt-32 max-w-[1320px] px-4 sm:px-8 lg:mt-44">
        <h2 id="impact-title" className="max-w-[30ch] text-h3 font-semibold">
          Okay, so what does that look like in practice?
        </h2>
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {impact.map((s) => (
            <div key={s.label} className="border-t border-line pt-5">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <RollingNumber value={s.value} className="block font-display text-h1 font-semibold tabular" />
                <span className="mt-2 block max-w-[24ch] text-small text-ink-2">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Approved testimonials only: the section waits until there are some */}
      {quotes.length ? (
      <section aria-labelledby="testimonials-title" className="mt-32 overflow-hidden lg:mt-44">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
          <h2 id="testimonials-title" className="text-center font-display text-[clamp(2.25rem,5vw,56px)] leading-[1.05] font-semibold text-balance">
            What people say
          </h2>
          <p className="mx-auto mt-3 max-w-[44ch] text-center text-[20px] leading-[1.5] text-balance text-ink-2">
            A few thoughts from people who have experienced the value of working together.
          </p>
          {drafts && quotes.some((t) => t.placeholder) ? (
            <p className="mx-auto mt-6 w-fit rounded-[var(--radius-m)] border border-dashed border-danger/50 px-4 py-2 text-small text-danger">
              Drafts awaiting each person&apos;s approval (italic). Only visible in development.
            </p>
          ) : null}
          <div className="mt-10">
            <ArcDial items={quotes} />
          </div>
        </div>
      </section>
      ) : null}
    </PageTransition>
  );
}
