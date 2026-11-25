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
  facts: [string, string][];
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
  // Anything Samuel still has to confirm stays off the page
  const facts = (rows: [string, string | undefined][]) =>
    rows.filter((r): r is [string, string] => !!r[1] && r[1] !== "To confirm");
  return [
    ...work.map(({ meta, ...rest }) => ({
      slug: meta.slug,
      title: meta.title,
      summary: meta.summary,
      facts: facts([
        ["Time", meta.timeline],
        ["Role", meta.role],
        ["Platform", meta.platform],
        ["Company", meta.company],
      ]),
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
        facts: facts([
          ["Time", d.time],
          ["Role", d.role],
          ["Platform", d.platform],
          ["Company", d.company],
        ]),
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
