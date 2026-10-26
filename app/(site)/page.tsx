import Link from "next/link";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { WorkList } from "@/components/home/work-list";
import { ScrollSentence } from "@/components/home/scroll-sentence";
import { ContactComposer } from "@/components/home/contact-composer";
import { AskAiLinks } from "@/components/home/ask-ai-links";
import { CopyEmail } from "@/components/ui/copy-email";
import { PageTransition } from "@/components/site/page-transition";
import { getAllWork, getProfile } from "@/lib/content";
import { archive } from "@/content/archive";
import { heroIntro, heroPhoto, skills } from "@/content/about";
import { ServicesSection } from "@/components/home/services-section";

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

  return (
    <PageTransition>
      <HeroShowcase
        first={profile.name.split(" ")[0] ?? profile.name}
        last={profile.name.split(" ").slice(1).join(" ")}
        availability="Open to full-time roles, remote or relocation"
        photo={heroPhoto}
        intro={heroIntro}
      />
      <ServicesSection services={skills} />

      <section id="work" aria-labelledby="work-title" className="mx-auto max-w-[1320px] px-4 pt-14 sm:px-8 lg:pt-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 id="work-title" className="text-h3 font-semibold">
            Selected work
          </h2>
          <Link href="/shots" transitionTypes={["nav-forward"]} className="text-small text-ink-2 underline-offset-4 hover:text-ink hover:underline">
            See all UI shots
          </Link>
        </div>
        <WorkList
          items={featured.map((m) => ({
            slug: m.slug,
            title: m.title,
            summary: m.summary,
            domain: m.domain,
            year: m.year,
            role: m.role,
            cover: m.cover,
            coverAlt: m.coverAlt,
            tint: m.tint,
          }))}
        />

        <div className="mt-20 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-h3 font-semibold">More work</h2>
            <p className="mt-2 max-w-[34ch] text-ink-2">Shipped, and worth a proper write-up. Case studies are on the way.</p>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2 lg:col-span-8">
            {archive.map((a) => (
              <li key={a.title} className="flex items-start justify-between gap-4 border-t border-line py-4">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-small text-ink-2">{a.what}</p>
                  {a.note ? <p className="mt-1 text-small text-signal">{a.note}</p> : null}
                </div>
                <span className="shrink-0 rounded-full border border-dashed border-line-strong px-2.5 py-0.5 text-micro whitespace-nowrap text-ink-3">
                  Case study soon
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="now-title" className="mx-auto mt-24 max-w-[1320px] px-4 sm:px-8">
        <div className="flex flex-col gap-4 rounded-[var(--radius-l)] border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 id="now-title" className="text-small text-ink-2">
              Building now
            </h2>
            <p className="mt-1 text-lead font-medium">
              Voxdeed, an AI legal tech product I&apos;m founding. Brand, product and go-to-market, pre-launch.
            </p>
            {/* TODO: Samuel to confirm the one public line on what Voxdeed does for its users */}
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-small text-ink">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Pre-launch
          </span>
        </div>
      </section>

      <section aria-label="How I work" className="mx-auto mt-32 max-w-[1320px] px-4 sm:px-8 lg:mt-44">
        <div className="lg:ml-[33.333%]">
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
                <span className="block font-display text-h1 font-semibold tabular">{s.value}</span>
                <span className="mt-2 block max-w-[24ch] text-small text-ink-2">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="contact" aria-labelledby="contact-title" className="mx-auto mt-32 max-w-[1320px] px-4 sm:px-8 lg:mt-44">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 id="contact-title" className="text-h2 font-semibold">
              Got a hard problem? Let&apos;s make it make sense.
            </h2>
            <p className="mt-4 max-w-[40ch] text-ink-2">
              Open to full-time product design and design engineering roles. Remote, or relocation including the EU.
            </p>
            <div className="mt-8 flex flex-col items-start gap-6">
              <CopyEmail email={profile.email} />
              <AskAiLinks />
            </div>
          </div>
          <div className="lg:col-span-7">
            <ContactComposer email={profile.email} />
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
