import Link from "next/link";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { StickerCard, type StickerWork } from "@/components/home/sticker-grid/sticker-card";
import { ScrollSentence } from "@/components/home/scroll-sentence";
import { RollingNumber } from "@/components/ui/rolling-number";
import { PageTransition } from "@/components/site/page-transition";
import { getAllWork, getProfile } from "@/lib/content";
import { archive } from "@/content/archive";
import { heroIntro, heroPhoto, skills } from "@/content/about";
import { ServicesSection } from "@/components/home/services-section";
import { ArcDial } from "@/components/home/arc-dial/arc-dial";
import { testimonials } from "@/content/testimonials";

// Confirmed numbers only (content/profile.md). Unattributed ones stay out until Samuel confirms them.
const impact = [
  { value: "10,000", label: "downloads in HeightGPT's first week" },
  { value: "100+", label: "design tokens in a system built from zero" },
  { value: "30%", label: "faster time-to-task for iExcelo students" },
  { value: "$1M", label: "pre-seed raised by Immigify while I led design" },
];

export default async function HomePage() {
  const [profile, work] = await Promise.all([getProfile(), getAllWork()]);
  const featured = work.filter((w) => w.meta.featured).map((w) => w.meta);

  // Six stickers: the case studies first, then shipped work whose case study is on its way (those open the Playground)
  const stickers: StickerWork[] = [
    ...featured.map((m) => ({
      id: m.slug,
      title: m.title,
      subtitle: m.summary,
      meta: m.domain,
      cover: m.cover,
      coverAlt: m.coverAlt,
      tint: m.tint,
      placeholder: "web" as const,
      href: `/work/${m.slug}`,
      cta: "Read case study",
      status: "case-study" as const,
      morphName: `cover-${m.slug}`,
    })),
    ...archive.map((a) => ({
      id: a.title,
      title: a.title,
      subtitle: a.what,
      meta: a.year ?? "Shipped",
      note: a.note,
      cover: null,
      coverAlt: "",
      tint: a.tint,
      placeholder: a.kind,
      href: "/playground",
      cta: "Enter playground",
      status: "soon" as const,
    })),
  ].slice(0, 6);

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
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h2 id="work-title" className="font-display text-[clamp(2.25rem,5vw,58px)] leading-[1.05] font-semibold text-balance">
              Selected work samples
            </h2>
            <p className="mt-3 max-w-[48ch] text-[20px] leading-[1.5] text-ink-2">
              A carefully picked showcase of projects that highlight my commitment to this design industry.
            </p>
          </div>
          <Link href="/playground" transitionTypes={["nav-forward"]} className="text-small text-ink-2 underline-offset-4 hover:text-ink hover:underline">
            Enter the playground
          </Link>
        </div>
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-14">
          {stickers.map((w, i) => (
            <StickerCard key={w.id} work={w} priority={i < 2} />
          ))}
        </ul>
      </section>

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

      <section aria-labelledby="testimonials-title" className="mt-32 overflow-hidden lg:mt-44">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
          <h2 id="testimonials-title" className="text-center font-display text-[clamp(2.25rem,5vw,56px)] leading-[1.05] font-semibold text-balance">
            What people say
          </h2>
          <p className="mx-auto mt-3 max-w-[44ch] text-center text-[20px] leading-[1.5] text-balance text-ink-2">
            A few thoughts from people who have experienced the value of working together.
          </p>
          <div className="mt-10">
            <ArcDial items={testimonials} />
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
