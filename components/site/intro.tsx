"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_DONE } from "@/lib/site";

const stages = [
  { at: 0, label: "Loading type" },
  { at: 34, label: "Setting the grid" },
  { at: 68, label: "Tuning springs" },
  { at: 100, label: "Ready" },
];

/**
 * The page's one orchestrated moment: a 0 → 100% count while the page and
 * fonts load, then the curtain lifts and the hero statement rises in.
 *
 * The count tracks real signals (fonts ready, window load) and never sits
 * idle: it eases to 82% on its own, then finishes once loading is done.
 * Any key or tap skips it. Plays once per session (?intro replays it).
 * Values are written to the DOM directly, never through React state.
 */
export function Intro({ name }: { name: string }) {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    // Returning visitors: CSS already hides the overlay before first paint
    if (html.dataset.intro === "skip") return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = root.current!;
    html.style.overflow = "hidden";

    let raf = 0;
    let shown = 0;
    let ready = false;
    let skipping = false;
    let exiting = false;
    const start = performance.now();
    // The automatic climb. Reduced motion keeps the count (it is information) but shortens it.
    const climbMs = reduce ? 450 : 1150;
    const minTotal = reduce ? 600 : 1500;
    const maxWait = 3200;

    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else addEventListener("load", () => resolve(), { once: true });
    });
    Promise.all([loaded, document.fonts?.ready]).then(() => (ready = true));

    let lastStage = -1;
    const paint = (v: number) => {
      const n = Math.round(v);
      if (count.current) count.current.textContent = String(n).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`;
      let s = 0;
      for (let i = 0; i < stages.length; i++) if (n >= stages[i]!.at) s = i;
      if (s !== lastStage && stage.current) {
        stage.current.textContent = stages[s]!.label;
        lastStage = s;
      }
    };

    const exit = () => {
      if (exiting) return;
      exiting = true;
      paint(100);
      html.dataset.intro = "done";
      window.dispatchEvent(new Event(INTRO_DONE));
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}

      const finish = () => {
        html.style.overflow = "";
        setDone(true);
      };

      if (reduce) {
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: "ease", fill: "forwards" })
          .finished.then(finish, finish);
        return;
      }
      // Curtain lifts upward; content inside drifts with it so it reads as one sheet.
      el.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }], {
        duration: skipping ? 450 : 700,
        delay: skipping ? 0 : 140,
        easing: "cubic-bezier(0.32, 0.72, 0, 1)",
        fill: "forwards",
      }).finished.then(finish, finish);
      el.querySelector<HTMLElement>("[data-intro-content]")?.animate(
        [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-48px)", opacity: 0 }],
        { duration: 500, delay: skipping ? 0 : 140, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" },
      );
    };

    const tick = (now: number) => {
      const t = now - start;
      // Strong ease-out climb towards 82%, then finish quickly once everything has loaded.
      const climb = 1 - Math.pow(1 - Math.min(t / climbMs, 1), 3);
      let target = climb * 82;
      if ((ready && t > minTotal * 0.6) || t > maxWait || skipping) target = 100;
      shown += (target - shown) * (target === 100 ? 0.18 : 0.35);
      if (target === 100 && 100 - shown < 0.6) shown = 100;
      paint(shown);
      if (shown >= 100 && (t >= minTotal || skipping)) {
        exit();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const skip = () => {
      skipping = true;
    };
    addEventListener("keydown", skip);
    addEventListener("pointerdown", skip);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("keydown", skip);
      removeEventListener("pointerdown", skip);
      html.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="intro fixed inset-0 z-[200] flex flex-col justify-between bg-[#0d0e12] p-4 text-[#eceef1] select-none sm:p-8"
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      <div data-intro-content className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between text-small">
          <span>{name}</span>
          <span className="text-right text-[#a0a5b0]">
            Product designer
            <br />
            and design engineer
          </span>
        </div>

        <div>
          <div className="flex items-end justify-between gap-6">
            <p className="font-mono leading-[0.8] font-medium tracking-[-0.06em] tabular text-[clamp(5.5rem,24vw,20rem)]">
              <span ref={count}>000</span>
              <span className="text-[0.35em] tracking-normal text-[#a99cff]">%</span>
            </p>
            <p className="hidden pb-3 text-right text-small text-[#a0a5b0] sm:block">
              Press any key
              <br />
              to skip
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between font-mono text-micro text-[#a0a5b0]">
            <span ref={stage}>Loading type</span>
            <span>Lagos, Nigeria</span>
          </div>
          <div className="mt-3 h-px w-full bg-white/15">
            <div ref={bar} className="h-px origin-left bg-[#a99cff]" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
