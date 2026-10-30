"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_DONE } from "@/lib/site";

/** One colour per letter, cycled. Saturated enough to read on both the light and dark paper */
const COLORS = ["#e4572e", "#7c4ddb", "#3b6cf6", "#0ea5a4", "#22a35a", "#d63d8f"];
/** Where each letter starts its fall: sideways drift (px), spin (deg), and when it lets go (ms). Fixed, so it plays the same every time */
const DROPS = [
  { dx: -70, spin: -38, delay: 0 },
  { dx: 50, spin: 24, delay: 520 },
  { dx: -30, spin: -16, delay: 260 },
  { dx: 80, spin: 42, delay: 900 },
  { dx: -50, spin: -26, delay: 690 },
  { dx: 40, spin: 18, delay: 1120 },
];
/** The fall (gravity: speeds up all the way down), then three bounces, each lower, sized to the letter, not the drop */
const FALL_MS = 1150;
const BOUNCE_MS = 1100;
/** After everything has landed, the word bounces once, as a wave through the letters */
const HOP_MS = 620;
const HOP_STAGGER = 90;
/** The loader always runs this long before the letters leave (unless skipped) */
const RUN_MS = 5000;
/** Leaving: each letter shoots up and fades, left to right, quicker than it came in */
const LEAVE_MS = 560;
const LEAVE_STAGGER = 75;
const GRAVITY = "cubic-bezier(0.55, 0, 1, 0.45)";
const RISE = "cubic-bezier(0, 0.55, 0.45, 1)";

function dropFrames(dx: number, spin: number): Keyframe[] {
  const fall = FALL_MS / (FALL_MS + BOUNCE_MS);
  const rest = 1 - fall;
  // Each bounce is lower and shorter than the last, like a real ball losing energy
  return [
    { transform: `translate(${dx}px, -110vh) rotate(${spin}deg)`, easing: GRAVITY },
    { transform: `translate(0, 0) rotate(${spin * 0.2}deg)`, offset: fall, easing: RISE },
    { transform: `translate(0, -0.26em) rotate(${spin * -0.1}deg)`, offset: fall + rest * 0.25, easing: GRAVITY },
    { transform: "translate(0, 0) rotate(0deg)", offset: fall + rest * 0.5, easing: RISE },
    { transform: "translate(0, -0.1em) rotate(0deg)", offset: fall + rest * 0.66, easing: GRAVITY },
    { transform: "translate(0, 0) rotate(0deg)", offset: fall + rest * 0.82, easing: RISE },
    { transform: "translate(0, -0.03em) rotate(0deg)", offset: fall + rest * 0.91, easing: GRAVITY },
    { transform: "translate(0, 0) rotate(0deg)" },
  ];
}

const squash = (amount: number): Keyframe[] => [
  { transform: "scale(1, 1)" },
  { transform: `scale(${1 + 0.14 * amount}, ${1 - 0.2 * amount})`, offset: 0.3 },
  { transform: `scale(${1 - 0.03 * amount}, ${1 + 0.05 * amount})`, offset: 0.65 },
  { transform: "scale(1, 1)" },
];

/**
 * The page's one orchestrated moment. The first name is set huge as a faint
 * ghost; its letters then drop in from above one by one, each in its own
 * colour, spinning as they fall under gravity, and land with three bounces
 * (each lower) and a squash. The word is sized to span the screen. Once the
 * whole word is down it bounces once, as a wave left to right. At 5s (and
 * once the page has loaded: fonts, window load) the letters leave one by
 * one, shooting up and fading, faster than they came, while the paper
 * dissolves and the hero rises in underneath. The hero's tag pile drops on
 * that same signal (INTRO_DONE).
 *
 * Any key or tap skips it. Plays on every full page load.
 * Reduced motion: no falling; the letters fade in over the ghost, then the
 * overlay fades out.
 */
export function Intro({ name }: { name: string }) {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const word = name.split(" ")[0] ?? name;

  useEffect(() => {
    const html = document.documentElement;
    // Returning visitors: CSS already hides the overlay before first paint
    if (html.dataset.intro === "skip") return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = root.current!;
    html.style.overflow = "hidden";

    let skipping = false;
    let exiting = false;
    let ready = false;
    let timer = 0;
    const start = performance.now();
    const letters = [...el.querySelectorAll<HTMLElement>("[data-letter]")];

    // Size the word to span the screen inside the padding (and stay short enough to sit in the
    // middle). CSS starts close; this corrects for the real font once it has loaded.
    const wordEl = wordRef.current!;
    const ghost = wordEl.firstElementChild as HTMLElement;
    const fit = () => {
      const pad = parseFloat(getComputedStyle(el.querySelector("[data-intro-content]")!).paddingLeft) || 16;
      const size = parseFloat(getComputedStyle(wordEl).fontSize);
      const width = ghost.getBoundingClientRect().width;
      if (!width) return;
      const next = Math.min((size * (el.clientWidth - pad * 2)) / width, innerHeight * 0.62);
      wordEl.style.fontSize = `${next}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    addEventListener("resize", fit);
    const landedAt = reduce ? 500 : Math.max(...letters.map((_, i) => DROPS[i % DROPS.length]!.delay)) + FALL_MS + BOUNCE_MS;
    const maxWait = 7000;
    const leaveAt = reduce ? 1200 : Math.max(landedAt + 300, RUN_MS);

    // Drop the letters
    letters.forEach((letter, i) => {
      const d = DROPS[i % DROPS.length]!;
      if (reduce) {
        letter.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, delay: i * 50, easing: "ease", fill: "both" });
        return;
      }
      letter.animate(dropFrames(d.dx, d.spin), { duration: FALL_MS + BOUNCE_MS, delay: d.delay, fill: "both" });
      // Squash on impact (the hardest), then smaller on the first bounce, from the baseline
      const glyph = letter.firstElementChild as HTMLElement;
      const rest = BOUNCE_MS;
      glyph.animate(squash(1), { duration: 380, delay: d.delay + FALL_MS - 20, easing: "ease-out" });
      glyph.animate(squash(0.5), { duration: 300, delay: d.delay + FALL_MS + rest * 0.5 - 20, easing: "ease-out" });
      // Once the whole word is down: one bounce, passing through the letters left to right
      glyph.animate(
        [
          { transform: "translateY(0)", easing: RISE },
          { transform: "translateY(-0.1em)", offset: 0.4, easing: GRAVITY },
          { transform: "translateY(0)", offset: 0.8 },
          { transform: "translateY(0)" },
        ],
        { duration: HOP_MS + HOP_STAGGER * 2, delay: landedAt + 250 + i * HOP_STAGGER, composite: "add" },
      );
    });

    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else addEventListener("load", () => resolve(), { once: true });
    });
    Promise.all([loaded, document.fonts?.ready]).then(() => {
      ready = true;
      check();
    });

    const exit = () => {
      if (exiting) return;
      exiting = true;
      clearTimeout(timer);
      if (status.current) status.current.textContent = "Ready";
      html.dataset.intro = "done";
      window.dispatchEvent(new Event(INTRO_DONE));

      const finish = () => {
        html.style.overflow = "";
        setDone(true);
      };

      if (reduce) {
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: "ease", fill: "forwards" }).finished.then(finish, finish);
        return;
      }
      // The letters leave one by one, left to right: each shoots up and fades, faster than it
      // came in. Meanwhile the paper dissolves, so the hero (already rising in) shows through.
      const stagger = skipping ? 30 : LEAVE_STAGGER;
      const leave = skipping ? 380 : LEAVE_MS;
      const flights = letters.map((letter, i) => {
        const d = DROPS[i % DROPS.length]!;
        return letter.animate(
          [
            { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
            { transform: `translate(${d.dx * -0.3}px, -0.12em) rotate(${d.spin * -0.1}deg)`, opacity: 1, offset: 0.18 },
            { transform: `translate(${d.dx * 0.4}px, -75vh) rotate(${d.spin * 0.4}deg)`, opacity: 0 },
          ],
          { duration: leave, delay: i * stagger, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "forwards" },
        );
      });
      const fadeMs = leave + stagger * (letters.length - 1);
      el.querySelector<HTMLElement>(".intro-ghost")?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" });
      status.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" });
      el.querySelector<HTMLElement>("[data-intro-chrome]")?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" });
      // The paper fades a little behind the letters, so the last ones still read against it
      el.querySelector<HTMLElement>("[data-intro-paper]")?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: fadeMs * 0.85,
        delay: 80,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      });
      Promise.all(flights.map((f) => f.finished)).then(finish, finish);
    };

    // Leave once every letter has landed (plus a beat to read the word) and the page is loaded
    function check() {
      const t = performance.now() - start;
      if (skipping || t >= maxWait || (ready && t >= leaveAt)) exit();
      else timer = window.setTimeout(check, Math.max(60, leaveAt - t));
    }
    timer = window.setTimeout(check, leaveAt);
    const hardStop = window.setTimeout(exit, maxWait);

    const skip = () => {
      skipping = true;
      exit();
    };
    addEventListener("keydown", skip);
    addEventListener("pointerdown", skip);

    return () => {
      clearTimeout(timer);
      clearTimeout(hardStop);
      removeEventListener("keydown", skip);
      removeEventListener("pointerdown", skip);
      removeEventListener("resize", fit);
      html.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="intro fixed inset-0 z-[200] overflow-hidden text-ink select-none"
    >
      {/* The page colour on its own layer, so leaving can fade it (opacity) under the departing letters */}
      <div data-intro-paper className="absolute inset-0 bg-paper" />
      <div data-intro-content className="relative flex h-full flex-col items-center justify-center px-4 sm:px-8">
        <span data-intro-chrome className="absolute top-4 right-4 rounded-full border border-line-strong px-3 py-1.5 text-micro text-ink-2 sm:top-8 sm:right-8">
          Skip intro
        </span>

        <div
          ref={wordRef}
          className="grid font-display text-[calc((100vw-2rem)/3)] leading-[0.9] font-semibold whitespace-nowrap sm:text-[calc((100vw-4rem)/3)]"
        >
          {/* The ghost: where each letter is going. Both layers set each letter in its own box, so the
              tight fit comes from a negative margin per letter (letter-spacing doesn't apply between boxes) */}
          <span className="intro-ghost col-start-1 row-start-1">
            {[...word].map((ch, i) => (
              <span key={i} className="intro-glyph inline-block">
                {ch}
              </span>
            ))}
          </span>
          <span className="col-start-1 row-start-1">
            {[...word].map((ch, i) => (
              <span key={i} data-letter className="intro-letter intro-glyph inline-block">
                <span className="inline-block origin-bottom" style={{ color: COLORS[i % COLORS.length] }}>
                  {ch}
                </span>
              </span>
            ))}
          </span>
        </div>

        <p ref={status} className="intro-status mt-10 text-small font-medium sm:mt-14">
          Getting things up
        </p>
      </div>
    </div>
  );
}
