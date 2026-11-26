import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { ProjectArt } from "@/components/case-study/project-art";
import { ProjectFilter } from "@/components/case-study/project-filter";
import { ProjectsViews } from "@/components/gallery/projects-views";
import { SpatialGallery, type GalleryItem } from "@/components/gallery/spatial-gallery";
import { PageTransition } from "@/components/site/page-transition";
import { ArrowRight } from "@/components/ui/icons";
import { archive } from "@/content/archive";
import { gallery } from "@/content/gallery";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Every project by Samuel Ekwenze: case studies, shipped products and interface work across mobile, web, dashboards and brand.",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "mobile", label: "Mobile" },
  { id: "web", label: "Web" },
  { id: "dashboard", label: "Dashboards" },
  { id: "brand", label: "Brand" },
];

/** A film's recording for the gallery's floating cards, when one has been made (scripts/gallery-videos.mjs) */
const recorded = (slug: string) =>
  fs.existsSync(path.join(process.cwd(), "public/work/gallery", `${slug}.webm`)) ? { src: `/work/gallery/${slug}.webm`, poster: `/work/gallery/${slug}.jpg` } : undefined;

/** The project art's own shape */
const ART = 1184 / 1032;

export default async function ProjectsPage() {
  const projects = await getProjects();

  const items: GalleryItem[] = projects
    .filter((p) => !gallery.entries[p.slug]?.hidden)
    .map((p) => {
      const e = gallery.entries[p.slug] ?? {};
      return {
        id: p.slug,
        title: e.title ?? p.title,
        caption: e.caption ?? p.detail.headline,
        summary: p.summary,
        year: p.entry?.meta.year || archive.find((a) => a.slug === p.slug)?.year || undefined,
        href: e.href === undefined ? `/work/${p.slug}` : e.href,
        tint: p.tint,
        kind: p.detail.kind,
        cover: p.cover,
        coverAlt: p.coverAlt,
        mockup: p.mockup,
        loop: recorded(p.slug),
        media: e.media,
        size: e.size ?? 1,
        aspect: e.aspect ?? ART,
        focus: e.focus,
      };
    });
  const start = Math.max(0, items.findIndex((i) => i.id === gallery.featured));

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1320px] px-4 pt-14 sm:px-8 lg:pt-20">
        <div className="grid gap-6 lg:grid-cols-12">
          <h1 className="text-h1 font-semibold lg:col-span-6">Projects</h1>
          <p className="max-w-[46ch] self-end text-ink-2 lg:col-span-5 lg:col-start-8">
            Case studies first, then shipped work whose write-up is on its way. Every one opens to its own page.
          </p>
        </div>
        <ProjectsViews
          gallery={<SpatialGallery items={items} start={start} />}
          list={
            <ProjectFilter
              filters={FILTERS}
              className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:gap-x-8"
              items={projects.map((p) => ({
                id: p.slug,
                kind: p.detail.kind,
                node: (
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
                ),
              }))}
            />
          }
        />
      </div>
    </PageTransition>
  );
}
