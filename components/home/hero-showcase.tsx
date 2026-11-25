"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { useRef, useState } from "react";
import { PixelPortrait } from "@/components/home/pixel-portrait";
import { DotGrid } from "@/components/home/dot-grid";
import { PileControls } from "@/components/home/tag-pile/pile-controls";
import { usePileSettings } from "@/components/home/tag-pile/settings";
import { TagPile } from "@/components/home/tag-pile/tag-pile";
import { pileTags } from "@/content/tag-pile";
import { LocalTime } from "@/components/ui/local-time";

type Props = {
  first: string;
  last: string;
  photo: { src: string | null; stylized: string; alt: string };
  intro: string[];
};

// Scroll choreography (fractions of the pinned section)
// The first stretch of scroll only brings the nav in (header.tsx shows it after a few px);
// the portrait waits until it has arrived, then starts its move
const HOLD = 0.12;
const SPLIT_END = 0.56; // name parts have left, portrait has reached the left column
const INTRO_IN: [number, number] = [0.38, 0.62]; // the intro arrives on the right

/**
 * Hero: the name splits around a portrait. Scrolling is the only driver:
 * the two halves of the name drift apart and fade, the portrait glides to
 * the left column, and a short intro arrives
 * on the right. The portrait is an illustration that reveals the real photo
 * under the cursor (see PixelPortrait).
 * Behind it all, a soft gradient drifts and leans towards the cursor. In the
 * opening view a gravity pile of skill tags falls in for visitors to throw
 * around; it clears out as the intro arrives.
 *
 * Small screens get a stacked version with no pinning. Reduced motion keeps
 * the same sequence but crossfades instead of moving.
 */
export function HeroShowcase(props: Props) {
  return (
    <>
      <DesktopHero {...props} />
      <MobileHero {...props} />
    </>
  );
}

function DesktopHero({ first, last, photo, intro }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const split = useTransform(p, [HOLD, SPLIT_END], [0, 1], { clamp: true });
  const nameOpacity = useTransform(split, [0, 0.75], [1, 0]);
  const nameShift = useTransform(split, [0, 1], [0, reduce ? 0 : 10]);
  const firstTransform = useMotionTemplate`translateX(-${nameShift}vw)`;
  const lastTransform = useMotionTemplate`translateX(${nameShift}vw)`;

  const photoX = useTransform(split, [0, 1], [0, reduce ? 0 : -24]);
  const photoScale = useTransform(split, [0, 1], [1, reduce ? 1 : 1.12]);
  const photoTransform = useMotionTemplate`translateX(calc(-50% + ${photoX}vw)) scale(${photoScale})`;
  // Reduced motion: the centred photo fades out while a copy fades in on the left
  const centreOpacity = useTransform(split, [0.3, 0.7], [1, reduce ? 0 : 1]);
  const leftOpacity = useTransform(split, [0.3, 0.7], [0, 1]);

  // The tag pile clears out as the intro arrives, so it never sits over text you're reading
  const pileOpacity = useTransform(split, [0.4, 0.75], [1, 0]);
  const [pileActive, setPileActive] = useState(true);
  useMotionValueEvent(pileOpacity, "change", (v) => setPileActive(v > 0.15));
  const pile = usePileSettings();
  const controlsOpacity = useTransform(split, [0, 0.12], [1, 0]);
  const [controlsShown, setControlsShown] = useState(true);
  useMotionValueEvent(controlsOpacity, "change", (v) => setControlsShown(v > 0.05));

  const introOpacity = useTransform(p, INTRO_IN, [0, 1]);
  const introY = useTransform(p, INTRO_IN, [reduce ? 0 : 32, 0]);
  const introTransform = useMotionTemplate`translateY(calc(-50% + ${introY}px))`;
  // While it is invisible it overlaps the centred portrait; it must not take the pointer then
  const introPointer = useTransform(introOpacity, (v) => (v > 0.5 ? "auto" : "none"));

  return (
    <section ref={ref} aria-labelledby="hero-name" className="relative hidden h-[245vh] lg:block">
      <div className="sticky top-0 h-svh overflow-hidden">
        <DotGrid />
        {/* The layer spans the hero but only the tags and controls take the pointer, so the portrait under it stays hoverable */}
        <motion.div className="pointer-events-none absolute inset-0 z-20" style={{ opacity: pileOpacity, visibility: pileActive ? "visible" : "hidden" }}>
          <TagPile tags={pileTags} settings={pile.settings} dropKey={pile.dropKey} active={pileActive} className="inset-0" />
        </motion.div>
        {/* Pile buttons float bottom left, and go as soon as the hero starts moving on from the pile */}
        <motion.div
          className="absolute bottom-6 left-6 z-30"
          style={{ opacity: controlsOpacity, visibility: controlsShown ? "visible" : "hidden" }}
        >
          <PileControls {...pile} placement="above" />
        </motion.div>
        {/* Content keeps clear of where the nav appears; the grid and pile run the full height */}
        <div className="absolute inset-x-0 top-[var(--header-h)] bottom-0 mx-auto max-w-[1600px]">
          <h1 id="hero-name" className="sr-only">
            {first} {last}, product designer and design engineer
          </h1>

          {/* Name, split around the portrait */}
          <motion.div aria-hidden="true" className="absolute top-[28%] left-[3%]" style={{ opacity: nameOpacity, transform: firstTransform }}>
            <p className="hero-fade mb-4 text-[20px] text-ink-2">Product designer</p>
            <p className="hero-name-size font-display leading-[0.9] font-bold uppercase">
              <span className="hero-mask">
                <span className="hero-word" style={{ "--i": 0 } as React.CSSProperties}>
                  {first}
                </span>
              </span>
            </p>
          </motion.div>
          <motion.div aria-hidden="true" className="absolute top-[28%] right-[3%] text-right" style={{ opacity: nameOpacity, transform: lastTransform }}>
            <p className="hero-fade mb-4 text-[20px] text-ink-2">Design engineer, AI-native</p>
            <p className="hero-name-size font-display leading-[0.9] font-bold uppercase">
              <span className="hero-mask">
                <span className="hero-word" style={{ "--i": 2 } as React.CSSProperties}>
                  {last}
                </span>
              </span>
            </p>
            <p className="hero-fade mt-6 text-small text-ink-2">
              <LocalTime />
            </p>
          </motion.div>

          {/* Portrait: centred, then glides to the left column */}
          <motion.div
            className="absolute top-[17%] left-1/2 aspect-[27/38] w-[min(19vw,300px)] origin-top"
            style={{ transform: photoTransform, opacity: centreOpacity }}
          >
            <div className="hero-photo relative h-full w-full">
              <PixelPortrait stylized={photo.stylized} real={photo} alt={photo.alt} priority />
            </div>
          </motion.div>
          {reduce ? (
            <motion.div
              className="absolute top-[17%] left-[26%] aspect-[27/38] w-[min(21vw,336px)] -translate-x-1/2"
              style={{ opacity: leftOpacity }}
            >
              <PixelPortrait stylized={photo.stylized} real={photo} alt={photo.alt} />
            </motion.div>
          ) : null}

          {/* Intro, on the right once the portrait has moved */}
          <motion.div
            // Centred on the portrait beside it: where it starts, plus half its height at its final scale
            className="absolute top-[calc(17%+min(19vw,300px)*38/27*1.12/2)] right-[6%] w-[min(44%,620px)] space-y-6"
            style={{ opacity: introOpacity, transform: introTransform, pointerEvents: introPointer }}
          >
            {intro.map((para) => (
              <p key={para.slice(0, 20)} className="text-[clamp(1.15rem,1.45vw,1.45rem)] leading-[1.5] font-medium text-ink">
                {para}
              </p>
            ))}
          </motion.div>

          <ScrollHint progress={p} />
        </div>
      </div>
    </section>
  );
}

function ScrollHint({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.08], [1, 0]);
  return (
    <motion.p
      aria-hidden="true"
      className="hero-fade absolute bottom-[26%] left-1/2 -translate-x-1/2 font-mono text-micro text-ink-3"
      style={{ opacity }}
    >
      Scroll to meet me
    </motion.p>
  );
}

function MobileHero({ first, last, photo, intro }: Props) {
  const pile = usePileSettings();
  return (
    <section aria-labelledby="hero-name-mobile" className="relative isolate overflow-hidden border-b border-line lg:hidden">
      <DotGrid />
      <div className="mx-auto max-w-[720px] px-4 pt-[calc(var(--header-h)+2.5rem)] pb-4 sm:px-8">
        <p className="hero-fade text-[20px] text-ink-2">Product designer and design engineer</p>
        <h1 id="hero-name-mobile" className="mt-2 text-[clamp(3.5rem,17.5vw,8rem)] leading-[0.88] font-bold tracking-[-0.02em] uppercase">
          <span className="hero-mask">
            <span className="hero-word" style={{ "--i": 0 } as React.CSSProperties}>
              {first}
            </span>
          </span>
          <br />
          <span className="hero-mask">
            <span className="hero-word" style={{ "--i": 2 } as React.CSSProperties}>
              {last}
            </span>
          </span>
        </h1>

        <div className="hero-photo relative mt-8 aspect-[27/38] w-[min(60%,300px)]">
          <PixelPortrait stylized={photo.stylized} real={photo} alt={photo.alt} priority />
        </div>

        <div className="hero-fade mt-6 space-y-3">
          <p className="text-small text-ink-2">
            <LocalTime withRelative />
          </p>
        </div>
        <div className="mt-8 space-y-5">
          {intro.map((para) => (
            <p key={para.slice(0, 20)} className="text-lead leading-[1.5] font-medium text-ink">
              {para}
            </p>
          ))}
        </div>
      </div>
      {/* Phones: the pile falls from the very top of the hero, past the name and portrait, and
          settles on its own floor at the bottom. The layer ignores the pointer; only the tags take it */}
      <div className="relative">
        {/* Left, stacked; the panel opens upward over the intro, since the hero clips anything below its floor */}
        <PileControls {...pile} stacked placement="above" className="relative z-30 mx-4 w-fit sm:mx-8" />
        {/* Floor just tall enough for the settled pile, so it sits about 96px under the intro. The pile
            gets taller as the screen narrows (same tags, less width), hence the vw term */}
        <div aria-hidden="true" className="mt-3 h-[max(280px,calc(580px-57vw))]" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-20">
        <TagPile tags={pileTags} settings={pile.settings} dropKey={pile.dropKey} className="inset-0" />
      </div>
    </section>
  );
}
