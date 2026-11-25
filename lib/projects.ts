import { archive } from "@/content/archive";
import { details, type ProjectDetail } from "@/content/details";
import { workMockups } from "@/content/mockups";
import type { Mockup } from "@/components/ui/device-mockup";
import { getAllWork, type Outcome, type WorkEntry } from "@/lib/content";

/** One shape for every project: full case studies (MDX) and shipped work whose write-up is on its way */
export type Project = {
  slug: string;
  title: string;
  summary: string;
  tldr: string[] | null;
  outcomes: Outcome[];
  tint: string;
  cover: string | null;
  coverAlt: string;
  mockup?: Mockup;
  detail: ProjectDetail;
  entry: WorkEntry | null;
};

/** Every project, case studies first */
export async function getProjects(): Promise<Project[]> {
  const work = await getAllWork();
  return [
    ...work.map(({ meta, ...rest }) => ({
      slug: meta.slug,
      title: meta.title,
      summary: meta.summary,
      tldr: meta.tldr,
      outcomes: meta.outcomes,
      tint: meta.tint,
      cover: meta.cover,
      coverAlt: meta.coverAlt,
      mockup: workMockups[meta.slug],
      detail: details[meta.slug]!,
      entry: { meta, ...rest },
    })),
    ...archive.map((a) => {
      const d = details[a.slug]!;
      return {
        slug: a.slug,
        title: a.title,
        summary: a.what,
        tldr: d.tldr ?? null,
        outcomes: d.figure ? [d.figure] : [],
        tint: a.tint,
        cover: null,
        coverAlt: "",
        mockup: a.mockup,
        detail: d,
        entry: null,
      };
    }),
  ];
}
