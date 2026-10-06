import { site } from "@/lib/site";

// 20 stops on an ease-out curve: fast at first, then settling, like a real
// counter.
const numbers = [0, 10, 20, 29, 38, 46, 53, 60, 66, 72, 78, 82, 86, 90, 93, 95, 97, 98, 99, 100];
// Timing (ms): a short hold on 0, then evenly spaced steps; the ease lives in the numbers.
const START = 150;
const SLOT = Math.round(1300 / (numbers.length - 1));

// The one orchestrated moment on first visit: a 0 → 100 count, then the sheet
// lifts away to reveal the page that was already rendered underneath.
// The count steps through 20 numbers and settles on 100.
// Everything is transform-only CSS (compositor thread), driven by
// html[data-intro="play"] (see globals.css and head-script.ts): it starts at
// first paint, ships no JS, and costs the main thread nothing.
// Decorative: hidden from assistive tech.
export function Intro() {
  return (
    <div
      aria-hidden="true"
      className="intro fixed inset-0 z-[100] flex-col justify-between bg-paper px-5 py-6 sm:px-10 sm:py-9"
    >
      <div className="flex items-baseline justify-between font-mono text-meta text-muted">
        <span>{site.name}</span>
        <span>Portfolio, 2026</span>
      </div>

      <div>
        <p className="font-mono text-faint">Loading the work</p>
        <p className="flex items-end text-[clamp(5rem,22vw,15rem)] leading-none font-medium tracking-[-0.05em] text-fg tabular-nums">
          {/* All numbers share one grid cell; each is visible only during its own
              time slot (opacity keyframes, see globals.css). Works the same in
              every engine, needs no clipping, and nothing slides. */}
          <span className="grid w-[3.2ch] text-right">
            {numbers.map((n, i) => {
              const last = i === numbers.length - 1;
              return (
                <span
                  key={n}
                  className={`intro-step [grid-area:1/1] ${last ? "intro-step-last" : ""}`}
                  style={{
                    animationDelay: `${i === 0 ? 0 : START + i * SLOT}ms`,
                    animationDuration: `${i === 0 ? START + SLOT : SLOT}ms`,
                  }}
                >
                  {n}
                </span>
              );
            })}
          </span>
          <span className="mb-[0.12em] ml-2 text-[0.35em] leading-none text-ink">%</span>
        </p>
        <div className="mt-6 h-0.5 w-full bg-line">
          <div className="intro-line h-0.5 w-full bg-ink" />
        </div>
      </div>
    </div>
  );
}
