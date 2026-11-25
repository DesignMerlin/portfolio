import Image from "next/image";
import { ArrowUpRight } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Job } from "@/content/about";

/**
 * Roles as a plain list: what and when, then who, beneath. Hovering or focusing a row
 * that links out brightens the company's underline and nudges its arrow up
 * and out, the way it's about to send you. The whole row is the hit area.
 */
export function WorkExperience({ jobs }: { jobs: Job[] }) {
  return (
    <section aria-labelledby="experience-title" className="mx-auto mt-28 max-w-[1320px] px-4 sm:px-8 lg:mt-36">
      <SectionHeading id="experience-title" count={jobs.length}>
        Work experience
      </SectionHeading>
      <ul className="mt-5">
        {jobs.map((j) => (
          <li
            key={j.company}
            className="job relative grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-3 border-b border-line py-6"
          >
            <p>{j.role}</p>
            <p className="text-right text-ink-2 tabular">{j.years}</p>
            <p className="col-span-2 flex min-w-0 items-center gap-2.5">
              {j.logo ? (
                <Image src={j.logo} alt="" width={24} height={24} className="size-6 shrink-0 rounded-[6px] ring-1 ring-line" />
              ) : (
                <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-sunken text-micro font-bold text-ink ring-1 ring-line">
                  {j.company[0]}
                </span>
              )}
              {j.href ? (
                <a href={j.href} target="_blank" rel="noreferrer" className="job-link inline-flex min-w-0 items-start gap-1 font-semibold after:absolute after:inset-0">
                  <span className="job-name">{j.company}</span>
                  <ArrowUpRight width={12} height={12} className="job-arrow mt-0.5 shrink-0" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <span className="font-semibold">{j.company}</span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
