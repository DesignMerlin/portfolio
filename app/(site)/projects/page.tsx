import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { ProjectArt } from "@/components/case-study/project-art";
import { ShotsGallery } from "@/components/shots/shots-gallery";
import { PageTransition } from "@/components/site/page-transition";
import { ArrowRight } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { shotFilters, shots } from "@/content/shots";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Every project by Samuel Ekwenze: case studies, shipped products and interface work across mobile, web, dashboards and brand.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <PageTransition>
      <div className="mx-auto max-w-[1320px] px-4 pt-14 sm:px-8 lg:pt-20">
        <div className="grid gap-6 lg:grid-cols-12">
          <h1 className="text-h1 font-semibold lg:col-span-6">Projects</h1>
          <p className="max-w-[46ch] self-end text-ink-2 lg:col-span-5 lg:col-start-8">
            Case studies first, then shipped work whose write-up is on its way. Every one opens to its own page.
          </p>
        </div>
        <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:gap-x-8">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link href={`/work/${p.slug}`} transitionTypes={["nav-forward"]} className="group block rounded-[var(--radius-l)] outline-offset-4">
                <div className="aspect-[1184/1032] overflow-hidden rounded-[var(--radius-l)] bg-sunken">
                  <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
                    <div className="h-full w-full">
                      <ProjectArt project={p} sizes="(min-width: 640px) 50vw, 100vw" />
                    </div>
                  </ViewTransition>
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-sans text-body font-semibold">{p.title}</h2>
                    <p className="text-small text-ink-2">{p.detail.headline}</p>
                  </div>
                  <ArrowRight className="mt-1.5 shrink-0 text-ink-3 transition-transform duration-[var(--dur-quick)] ease-[var(--ease-enter)] group-hover:translate-x-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <section aria-labelledby="screens-title" className="mt-28">
          <SectionHeading id="screens-title" sub="Single screens and explorations. Open any one for the thinking behind it. Placeholders are on their way from Figma.">
            Screens
          </SectionHeading>
          <div className="mt-8">
            <ShotsGallery shots={shots} filters={shotFilters} />
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
