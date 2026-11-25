import type { Metadata } from "next";
import { Doodle } from "@/components/playground/doodle";
import { PageTransition } from "@/components/site/page-transition";

export const metadata: Metadata = {
  title: "Playground",
  description: "A page to doodle on. Pen, marker, spray and a kaleidoscope, in Samuel Ekwenze's portfolio.",
};

export default function PlaygroundPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-[1320px] px-4 pt-8 sm:px-8 lg:pt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <h1 className="text-h1 font-semibold">Playground</h1>
          <p className="max-w-[46ch] text-ink-2">
            Somewhere to doodle. Nothing you draw leaves your browser, and it will still be here when you come back.
          </p>
        </div>
        <Doodle />
      </div>
    </PageTransition>
  );
}
