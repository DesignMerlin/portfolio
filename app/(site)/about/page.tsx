import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { DomainHeadline, type Domain } from "@/components/about/domain-headline";
import { ExperienceList } from "@/components/about/experience-list";
import { PixelPortrait } from "@/components/home/pixel-portrait";
import { PageTransition } from "@/components/site/page-transition";
import { CopyEmail } from "@/components/ui/copy-email";
import { LocalTime } from "@/components/ui/local-time";
import { RollingNumber } from "@/components/ui/rolling-number";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  achievements,
  bio,
  cvNumbers,
  education,
  experience,
  headline,
  heroPhoto,
} from "@/content/about";
import { getProfile } from "@/lib/content";
import { getProjects } from "@/lib/projects";
import { wallStored } from "@/lib/wall";

// The drawing wall is its own chunk, fetched only on this page
const DoodleWall = dynamic(() => import("@/components/about/doodle-wall").then((m) => m.DoodleWall));

export const metadata: Metadata = {
  title: "About",
  description: "Samuel Ekwenze: product and visual designer in Lagos, with experience across immigration technology, edtech, fintech and real estate.",
};

export default async function AboutPage() {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  const domains: Domain[] = headline.domains.map((d) => {
    const p = projects.find((x) => x.slug === d.slug)!;
    return { ...d, title: p.title, tint: p.tint, kind: p.detail.kind, mockup: p.mockup };
  });
  return (
    <PageTransition>
      <div className="mx-auto max-w-[1320px] px-4 pt-10 sm:px-8 lg:pt-16">
        {/* The CV's professional headline */}
        <section aria-labelledby="about-title" className="grid items-end gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className="text-ink-2">{profile.name}</p>
            <h1 id="about-title" className="mt-2 text-[clamp(2.75rem,8.2vw,7.25rem)] leading-[0.92] font-semibold text-balance">
              {headline.title}
            </h1>
            <div className="mt-8 lg:mt-10">
              <DomainHeadline lead="With experience across" domains={domains} />
            </div>
          </div>
          <figure className="w-[min(62%,300px)] lg:w-full">
            <div className="relative aspect-[27/38]">
              <PixelPortrait stylized={heroPhoto.stylized} real={heroPhoto} alt={heroPhoto.alt} priority />
            </div>
            <figcaption className="mt-3 text-small text-ink-2">
              <LocalTime />
            </figcaption>
          </figure>
        </section>

        <section aria-label="In short" className="mt-16 grid gap-x-12 gap-y-10 border-t border-line pt-10 lg:mt-24 lg:grid-cols-12 lg:pt-14">
          <p className="text-lead lg:col-span-7">{headline.summary}</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:col-span-12">
            {cvNumbers.map((n) => (
              <div key={n.label} className="border-t border-line pt-4">
                <dt className="sr-only">{n.label}</dt>
                <dd>
                  <RollingNumber value={n.value} className="block font-display text-h2 font-semibold tabular" />
                  <span className="mt-1 block max-w-[22ch] text-small text-ink-2">{n.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="story-title" className="mt-24 grid gap-x-12 gap-y-6 lg:mt-32 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="story-title">How I got here</SectionHeading>
          </div>
          <div className="space-y-5 text-ink-2 lg:col-span-7 lg:col-start-6">
            {bio.map((p) => (
              <p key={p.slice(0, 24)} className="max-w-[64ch]">
                {p}
              </p>
            ))}
            <div className="pt-2">
              <CopyEmail email={profile.email} />
            </div>
          </div>
        </section>
        {/* TODO: Samuel to add 4–6 captioned personal photos (desk, Lagos, a workshop, something outside design). */}

        <section aria-labelledby="exp-title" className="mt-24 lg:mt-32">
          <div className="mb-6">
            <SectionHeading id="exp-title" sub="Each role, led by what it taught me. Open one for the proof.">
              Things I&apos;ve learned so far
            </SectionHeading>
          </div>
          <ExperienceList roles={experience} />
        </section>

        <section aria-labelledby="education-title" className="mt-24 grid gap-x-12 gap-y-6 lg:mt-32 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="education-title">Education</SectionHeading>
          </div>
          <ul className="lg:col-span-7 lg:col-start-6">
            {education.map((e) => (
              <li key={e.what} className="grid gap-x-6 gap-y-1 border-t border-line py-4 last:border-b sm:grid-cols-[minmax(0,1fr)_auto]">
                <p className="font-medium">
                  {e.what}
                  <span className="block font-normal text-ink-2">{e.where}</span>
                </p>
                <p className="text-ink-2 tabular">{e.when}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="recognition-title" className="mt-20 grid gap-x-12 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="recognition-title">Recognition</SectionHeading>
          </div>
          <ul className="lg:col-span-7 lg:col-start-6">
            {achievements.map((a) => (
              <li key={a.title} className="border-t border-line py-4 last:border-b">
                <p className="font-medium">{a.title}</p>
                <p className="text-ink-2">{a.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* The shared doodle wall (lib/wall.ts; kept in each browser until a store is set up) */}
        <section aria-labelledby="doodle-title" className="mt-24 lg:mt-32">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
            <SectionHeading id="doodle-title">Leave a doodle</SectionHeading>
            <p className="max-w-[46ch] text-ink-2">
              {wallStored
                ? "One wall that everyone who visits draws on. Pick a pen or a brush, find a space, and add yours."
                : "Somewhere to draw before you go. Pick a pen or a brush, and it will still be here when you come back."}
            </p>
          </div>
          <DoodleWall />
        </section>
      </div>
    </PageTransition>
  );
}
