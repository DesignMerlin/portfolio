import { RopeCarousel } from "@/components/home/rope-carousel/rope-carousel";
import type { Skill } from "@/content/about";

/**
 * "What I do", in its own container below the hero: the services as notebook
 * pages pegged along a hanging rope (see rope-carousel.tsx).
 */
export function ServicesSection({ services }: { services: Skill[] }) {
  return (
    <section aria-labelledby="services-title" className="mt-24 border-t border-line pt-16 lg:pt-24">
      <div className="w-full max-w-[1320px] px-4 sm:px-8 lg:mx-auto">
        <h2 id="services-title" className="mx-auto max-w-[24ch] text-center text-balance font-display text-[clamp(2.5rem,6vw,72px)] leading-[1.02] font-semibold">
          Designing products people trust, for 3+ years.{" "}
          <span className="text-ink-3">Work that has generated revenue and helped companies raise pre-seed funding.</span>
        </h2>
      </div>
      <div className="mt-6 lg:mt-10">
        <RopeCarousel items={services} label="What I do" />
      </div>
    </section>
  );
}
