"use client";

import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HangingCards, Rope } from "@/components/home/hanging-cards";
import type { Skill } from "@/content/about";

function Statement() {
  return (
    <>
      Designing products people trust, for 3+ years.{" "}
      <span className="text-ink-3">Work that has generated revenue and helped companies raise pre-seed funding.</span>
    </>
  );
}

/**
 * "What I do", in its own container below the hero.
 * Desktop: the section pins while page scroll slides the tags along the
 * rope; they swing with the speed of the scroll. Phones: a swipeable row
 * with the same swing.
 */
export function ServicesSection({ services }: { services: Skill[] }) {
  return (
    <>
      <DesktopServices services={services} />
      <MobileServices services={services} />
    </>
  );
}

function Header({ id }: { id: string }) {
  return (
    <div className="w-full max-w-[1320px] px-4 sm:px-8 lg:mx-auto">
      <h2 id={id} className="font-sans text-small font-normal tracking-normal text-ink-2">
        What I do
      </h2>
      <p className="mt-3 max-w-[34ch] font-display text-h2 font-semibold">
        <Statement />
      </p>
    </div>
  );
}

function DesktopServices({ services }: { services: Skill[] }) {
  const ref = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [overflow, setOverflow] = useState(0);
  const { scrollYProgress, scrollY } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // The swing follows the page scroll itself (not just the row's travel), so the cards react the
  // whole time you're in the section, in both directions. Scrolling down pushes the row left.
  const push = useTransform(scrollY, (v) => -v);

  useEffect(() => {
    const measure = () => {
      if (windowRef.current && trackRef.current) {
        setOverflow(Math.max(0, trackRef.current.scrollWidth - windowRef.current.clientWidth));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (windowRef.current) ro.observe(windowRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  // A little dwell at both ends so the first and last cards get a moment on their own
  const x = useTransform(scrollYProgress, [0.08, 0.92], [0, -overflow], { clamp: true });
  const transform = useMotionTemplate`translateX(${x}px)`;

  return (
    <section ref={ref} aria-labelledby="services-title-desktop" className="relative mt-24 hidden h-[220vh] border-t border-line lg:block">
      <div className="sticky top-14 flex h-[calc(100svh-3.5rem)] flex-col justify-center overflow-hidden">
        <Header id="services-title-desktop" />
        <div ref={windowRef} className="relative mt-10">
          <Rope />
          <motion.ul
            ref={trackRef}
            className="flex w-max gap-8 px-[max(2rem,calc((100vw-1320px)/2+2rem))] pb-8"
            style={{ transform }}
          >
            <HangingCards services={services} motionSource={push} />
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

function MobileServices({ services }: { services: Skill[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const { scrollX } = useScroll({ container: scroller });
  // Content moves opposite to the scroll offset, so flip the sign for the swing
  const contentX = useTransform(scrollX, (v) => -v);

  return (
    <section aria-labelledby="services-title-mobile" className="mt-16 border-t border-line pt-14 lg:hidden">
      <Header id="services-title-mobile" />
      <div className="relative mt-8">
        <Rope />
        <div ref={scroller} className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max snap-x snap-mandatory gap-4 px-4 pb-8 sm:px-8 [&>li]:scroll-ml-4 [&>li]:snap-start">
            <HangingCards services={services} motionSource={contentX} />
          </ul>
        </div>
      </div>
    </section>
  );
}
