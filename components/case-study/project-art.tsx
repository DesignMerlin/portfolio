import { Cover } from "@/components/case-study/cover";
import { ProjectCover } from "@/components/case-study/project-cover";
import { DeviceMockup } from "@/components/ui/device-mockup";
import { PlaceholderShot } from "@/components/ui/placeholder-shot";
import type { Project } from "@/lib/projects";

/** A project's picture: its film or motion mockup, its cover, or a labelled placeholder */
export function ProjectArt({ project, sizes, interactive = false }: { project: Project; sizes: string; interactive?: boolean }) {
  if (project.mockup) {
    return interactive ? (
      <ProjectCover mockup={project.mockup} title={project.title} />
    ) : (
      <div className="relative h-full w-full">
        <DeviceMockup mockup={project.mockup} label={project.title} />
      </div>
    );
  }
  if (project.cover) return <Cover work={project} sizes={sizes} priority={interactive} />;
  return <PlaceholderShot kind={project.detail.kind} tint={project.tint} label={project.title} className="h-full w-full" />;
}
