import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/site/PageTransition";
import { about, aiProcess, experience, principles, recognition, site, tools } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${about.headline} ${about.lead}`,
};

export default function AboutPage() {
  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-[76rem] px-5 pb-12 sm:px-10">
        <header className="grid gap-8 pt-8 pb-16 sm:pt-14 lg:grid-cols-12">
          <p className="font-mono text-meta text-faint lg:col-span-3">About</p>
          <div className="lg:col-span-8">
            <h1 className="max-w-[20ch] text-h2 font-medium text-balance sm:text-[clamp(2rem,1.2rem+2.4vw,3rem)] sm:leading-[1.1]">
              {about.headline}
            </h1>
            <p className="mt-5 max-w-[52ch] text-lead text-pretty">{about.lead}</p>
            <div className="mt-8 max-w-[64ch] space-y-4 text-muted">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-8 inline-flex items-center gap-2 font-mono text-meta text-muted">
              <span className="size-2 rounded-full bg-stamp" aria-hidden="true" />
              {site.availability}. {site.availabilityDetail}
            </p>
          </div>
        </header>

        <section
          aria-labelledby="learned"
          className="grid gap-8 border-t border-line py-16 lg:grid-cols-12"
        >
          <h2 id="learned" className="text-title font-medium lg:col-span-3">
            Things I&rsquo;ve learned so far
          </h2>
          <ol className="lg:col-span-8">
            {experience.map((role) => (
              <li
                key={role.company}
                className="grid gap-x-8 gap-y-3 border-b border-line py-8 first:pt-0 last:border-0 sm:grid-cols-[9rem_1fr]"
              >
                <div className="font-mono text-meta text-faint">
                  <p className="tabular-nums">{role.period}</p>
                  <p className="mt-1">{role.place}</p>
                </div>
                <div>
                  <h3 className="text-base">
                    <span className="font-semibold">{role.company}</span>
                    <span className="text-muted">, {role.title}</span>
                  </h3>
                  <p className="mt-3 max-w-[56ch] text-title font-medium text-pretty">
                    {role.lesson}
                  </p>
                  <ul className="mt-4 max-w-[60ch] space-y-1.5 text-sm text-muted">
                    {role.proof.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  {role.caseStudy && (
                    <Link
                      href={`/work/${role.caseStudy}`}
                      transitionTypes={["nav-forward"]}
                      className="mt-4 inline-block text-sm text-ink underline decoration-ink/30 hover:decoration-ink"
                    >
                      Read the case study
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="how"
          className="grid gap-8 border-t border-line py-16 lg:grid-cols-12"
        >
          <h2 id="how" className="text-title font-medium lg:col-span-3">
            How I work
          </h2>
          <div className="lg:col-span-8">
            <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {principles.map(({ title, body }) => (
                <li key={title}>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-muted">{body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-12 max-w-[60ch] border-l-2 border-ink pl-5">
              <p className="font-mono text-meta text-ink">How I use AI</p>
              <p className="mt-2">{aiProcess}</p>
            </div>
          </div>
        </section>

        <section
          aria-label="Recognition and tools"
          className="grid gap-8 border-t border-line py-16 lg:grid-cols-12"
        >
          <div className="lg:col-span-3" />
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8">
            <div>
              <h2 className="font-mono text-meta text-faint">Recognition</h2>
              <ul className="mt-3 space-y-2">
                {recognition.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-mono text-meta text-faint">Tools</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-sm border border-line px-2 py-1 text-sm text-muted"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
