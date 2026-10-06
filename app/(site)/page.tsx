import Link from "next/link";
import { LocalTime } from "@/components/site/LocalTime";
import { PageTransition } from "@/components/site/PageTransition";
import { WorkList } from "@/components/work/WorkList";
import { getWorkSummaries } from "@/lib/content";
import { hero, now, site } from "@/lib/site";

export default async function Home() {
  const work = await getWorkSummaries();

  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-[76rem] px-5 sm:px-10">
        {/* Hero: statement first, proof second, status third. */}
        <section className="pt-8 pb-12 sm:pt-14 lg:pb-14" aria-labelledby="statement">
          <h1 id="statement" className="max-w-[20ch] text-display font-medium text-balance">
            {hero.statement}
          </h1>
          <p className="mt-5 max-w-[46ch] text-lead text-muted">{hero.lead}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-meta text-muted">
            <Link href="/#contact" className="group inline-flex items-center gap-2 hover:text-fg">
              <span className="size-2 rounded-full bg-stamp" aria-hidden="true" />
              Open to new roles
            </Link>
            <span>
              {site.city}, <LocalTime />
            </span>
          </div>
        </section>

        <section id="work" aria-labelledby="work-heading" className="scroll-mt-6 pb-16 lg:pb-24">
          <h2 id="work-heading" className="mb-4 font-mono text-meta text-faint">
            Selected work
          </h2>
          <WorkList work={work} />
        </section>

        <section aria-label="What I'm doing now" className="pb-20">
          <p className="flex max-w-[60ch] flex-wrap gap-x-4 gap-y-1 border-l-2 border-ink pl-4">
            <span className="font-mono text-meta leading-[1.6rem] text-ink">{now.label}</span>
            <span>{now.text}</span>
          </p>
        </section>
      </main>
    </PageTransition>
  );
}
