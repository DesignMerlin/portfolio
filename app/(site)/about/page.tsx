import type { Metadata } from "next";
import { AiProcessCard } from "@/components/about/ai-process-card";
import { ExperienceList } from "@/components/about/experience-list";
import { SkillsSwitcher } from "@/components/about/skills-switcher";
import { PageTransition } from "@/components/site/page-transition";
import { CopyEmail } from "@/components/ui/copy-email";
import { aiProcess, bio, experience, principles, recognition, skills, tools } from "@/content/about";
import { getProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Samuel Ekwenze: product designer and design engineer in Lagos. Experience, skills, and how he works.",
};

export default async function AboutPage() {
  const profile = await getProfile();
  return (
    <PageTransition>
      <div className="mx-auto max-w-[1320px] px-4 pt-14 sm:px-8 lg:pt-20">
        <section className="grid gap-10 lg:grid-cols-12">
          <h1 className="text-h1 font-semibold lg:col-span-5">
            Hi, I&apos;m Samuel. <span className="text-ink-3">I make hard processes make sense.</span>
          </h1>
          <div className="space-y-5 text-ink-2 lg:col-span-6 lg:col-start-7">
            {bio.map((p) => (
              <p key={p.slice(0, 24)} className="max-w-[62ch]">
                {p}
              </p>
            ))}
            <div className="pt-2">
              <CopyEmail email={profile.email} />
            </div>
          </div>
        </section>
        {/* TODO: Samuel to add 4–6 captioned personal photos (desk, Lagos, a workshop, something outside design). */}

        <section aria-labelledby="exp-title" className="mt-28">
          <h2 id="exp-title" className="mb-8 text-h2 font-semibold">
            Things I&apos;ve learned so far
          </h2>
          <ExperienceList roles={experience} />
        </section>

        <section aria-labelledby="skills-title" className="mt-28">
          <h2 id="skills-title" className="mb-8 text-h2 font-semibold">
            What I do
          </h2>
          <SkillsSwitcher skills={skills} />
        </section>

        <section aria-labelledby="principles-title" className="mt-28 grid gap-10 lg:grid-cols-12">
          <h2 id="principles-title" className="text-h2 font-semibold lg:col-span-4">
            How I work
          </h2>
          <ol className="space-y-6 lg:col-span-7 lg:col-start-6">
            {principles.map((p) => (
              <li key={p.title} className="border-t border-line pt-5">
                <p className="text-lead font-medium">{p.title}</p>
                <p className="mt-1 text-ink-2">{p.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label="How I use AI" className="mt-20">
          <AiProcessCard steps={aiProcess} />
        </section>

        <section className="mt-28 grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="text-h3 font-semibold">Recognition</h2>
            <ul className="mt-4 space-y-2 text-ink-2">
              {recognition.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-h3 font-semibold">Tools</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {tools.map((t) => (
                <li key={t} className="rounded-full border border-line px-3 py-1 text-small text-ink-2">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
