"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";
import { FlipPortrait } from "@/components/home/flip-portrait";
import { LocalTime } from "@/components/ui/local-time";

type Props = {
  first: string;
  last: string;
  availability: string;
  photo: { src: string | null; alt: string };
  intro: string[];
};

// Scroll choreography (fractions of the pinned section)
const SPLIT_END = 0.5; // name parts have left, portrait has reached the left column
const INTRO_IN: [number, number] = [0.3, 0.56]; // the intro arrives on the right

/**
 * Hero: the name splits around a portrait. Scrolling is the only driver:
 * the two halves of the name drift apart and fade, the portrait glides to
 * the left column (turning once as it arrives), and a short intro arrives
 * on the right. The portrait only becomes flippable once it has settled.
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

function DesktopHero({ first, last, availability, photo, intro }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const split = useTransform(p, [0, SPLIT_END], [0, 1], { clamp: true });
  const nameOpacity = useTransform(split, [0, 0.75], [1, 0]);
  const nameShift = useTransform(split, [0, 1], [0, reduce ? 0 : 10]);
  const firstTransform = useMotionTemplate`translateX(-${nameShift}vw)`;
  const lastTransform = useMotionTemplate`translateX(${nameShift}vw)`;

  const photoX = useTransform(split, [0, 1], [0, reduce ? 0 : -24]);
  const photoScale = useTransform(split, [0, 1], [1, reduce ? 1 : 1.12]);
  const photoTransform = useMotionTemplate`translateX(calc(-50% + ${photoX}vw)) scale(${photoScale})`;
  // One full turn as it arrives on the left (never while it's still the hero)
  const turn = useTransform(split, [0.55, 1], [0, 360]);
  const [settled, setSettled] = useState(false);
  useMotionValueEvent(split, "change", (v) => setSettled(v >= 0.98));
  // Reduced motion: the centred photo fades out while a copy fades in on the left
  const centreOpacity = useTransform(split, [0.3, 0.7], [1, reduce ? 0 : 1]);
  const leftOpacity = useTransform(split, [0.3, 0.7], [0, 1]);

  const introOpacity = useTransform(p, INTRO_IN, [0, 1]);
  const introY = useTransform(p, INTRO_IN, [reduce ? 0 : 32, 0]);
  const introTransform = useMotionTemplate`translateY(calc(-50% + ${introY}px))`;

  return (
    <section ref={ref} aria-labelledby="hero-name" className="relative hidden h-[220vh] lg:block">
      <div className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-hidden">
        <div className="relative mx-auto h-full max-w-[1500px]">
          <h1 id="hero-name" className="sr-only">
            {first} {last}, product designer and design engineer
          </h1>

          {/* Name, split around the portrait */}
          <motion.div aria-hidden="true" className="absolute top-[30%] left-[6%]" style={{ opacity: nameOpacity, transform: firstTransform }}>
            <p className="hero-fade mb-3 text-small text-ink-2">Product designer</p>
            <p className="font-display text-[clamp(3rem,6.2vw,7.75rem)] leading-[0.9] font-bold tracking-[-0.045em] uppercase">
              <span className="hero-mask">
                <span className="hero-word" style={{ "--i": 0 } as React.CSSProperties}>
                  {first}
                </span>
              </span>
            </p>
            <p className="hero-fade mt-6 flex w-fit items-center gap-2 rounded-full border border-line bg-surface/80 py-1.5 pr-3.5 pl-3 text-small backdrop-blur">
              <span className="size-2 rounded-full bg-signal" />
              {availability}
            </p>
          </motion.div>
          <motion.div aria-hidden="true" className="absolute top-[30%] right-[6%] text-right" style={{ opacity: nameOpacity, transform: lastTransform }}>
            <p className="hero-fade mb-3 text-small text-ink-2">Design engineer, AI-native</p>
            <p className="font-display text-[clamp(3rem,6.2vw,7.75rem)] leading-[0.9] font-bold tracking-[-0.045em] uppercase">
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
              <FlipPortrait
                photo={photo}
                name={`${first} ${last}`}
                role="Product Designer"
                scrollTurn={turn}
                interactive={settled && !reduce}
                priority
              />
            </div>
          </motion.div>
          {reduce ? (
            <motion.div
              className="absolute top-[17%] left-[26%] aspect-[27/38] w-[min(21vw,336px)] -translate-x-1/2"
              style={{ opacity: leftOpacity }}
            >
              <FlipPortrait photo={photo} name={`${first} ${last}`} role="Product Designer" interactive={settled} />
            </motion.div>
          ) : null}

          {/* Intro, on the right once the portrait has moved */}
          <motion.div
            className="absolute top-1/2 right-[6%] w-[min(44%,620px)] space-y-6"
            style={{ opacity: introOpacity, transform: introTransform }}
          >
            {intro.map((para) => (
              <p key={para.slice(0, 20)} className="text-[clamp(1.15rem,1.45vw,1.45rem)] leading-[1.5] font-semibold text-ink">
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
      className="hero-fade absolute bottom-[5%] left-1/2 -translate-x-1/2 font-mono text-micro text-ink-3"
      style={{ opacity }}
    >
      Scroll to meet me
    </motion.p>
  );
}

function MobileHero({ first, last, availability, photo, intro }: Props) {
  return (
    <section aria-labelledby="hero-name-mobile" className="border-b border-line lg:hidden">
      <div className="mx-auto max-w-[720px] px-4 pt-10 pb-14 sm:px-8">
        <p className="hero-fade text-small text-ink-2">Product designer and design engineer</p>
        <h1 id="hero-name-mobile" className="mt-2 text-[clamp(3rem,15vw,6rem)] leading-[0.88] font-bold tracking-[-0.045em] uppercase">
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
          <FlipPortrait photo={photo} name={`${first} ${last}`} role="Product Designer" interactive={false} priority />
        </div>

        <div className="hero-fade mt-6 space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-3.5 pl-3 text-small">
            <span className="size-2 rounded-full bg-signal" aria-hidden="true" />
            {availability}
          </p>
          <p className="text-small text-ink-2">
            <LocalTime withRelative />
          </p>
        </div>
        <div className="mt-8 space-y-5">
          {intro.map((para) => (
            <p key={para.slice(0, 20)} className="text-lead leading-[1.5] font-semibold text-ink">
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
