import type { Metadata } from "next";
import { ShotsGallery } from "@/components/shots/shots-gallery";
import { PageTransition } from "@/components/site/page-transition";
import { shotFilters, shots } from "@/content/shots";

export const metadata: Metadata = {
  title: "Playground",
  description: "Interface work by Samuel Ekwenze across mobile, web, dashboards and brand.",
};

export default function PlaygroundPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-[1320px] px-4 pt-14 sm:px-8 lg:pt-20">
        <div className="grid gap-6 lg:grid-cols-12">
          <h1 className="text-h1 font-semibold lg:col-span-6">Playground</h1>
          <p className="max-w-[46ch] self-end text-ink-2 lg:col-span-5 lg:col-start-8">
            Screens from shipped products, work without a full case study yet, and explorations. Open any shot for the
            thinking behind it. Shots marked as placeholders are on their way from Figma.
          </p>
        </div>
        <div className="mt-12">
          <ShotsGallery shots={shots} filters={shotFilters} />
        </div>
      </div>
    </PageTransition>
  );
}
