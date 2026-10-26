"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ReplayIcon } from "@/components/ui/icons";
import { SpeedContext } from "@/components/case-study/prototype-speed";

const loading = () => <div className="h-full min-h-[560px] w-full animate-pulse rounded-[28px] bg-sunken" />;

// Each prototype is its own chunk, fetched only when its frame nears the viewport
const prototypes = {
  "room8-listings": dynamic(() => import("@/components/case-study/prototypes/room8-listings"), { loading }),
  "fundpath-donate": dynamic(() => import("@/components/case-study/prototypes/fundpath-donate"), { loading }),
  "immigify-agent": dynamic(() => import("@/components/case-study/prototypes/immigify-agent"), { loading }),
};

export type PrototypeName = keyof typeof prototypes;

/**
 * Frame for an embedded, clickable prototype of a key flow. Controls:
 * Replay (resets every state) and 0.25× speed (every duration and spring in
 * the prototype stretches, so reviewers can watch the motion frame by frame).
 */
export function Prototype({ name, caption, title }: { name: PrototypeName; caption: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [run, setRun] = useState(0);
  const Component = prototypes[name];

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className="my-12 lg:-mr-[12%]">
      <div className="rounded-[var(--radius-l)] border border-line bg-sunken/60 p-3 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-small font-medium text-ink">
            <span className="mr-2 inline-block size-1.5 rounded-full bg-signal align-middle" aria-hidden="true" />
            {title}
          </p>
          <div className="flex items-center gap-2">
            <div role="radiogroup" aria-label="Animation speed" className="flex rounded-full border border-line bg-surface p-0.5">
              {[1, 0.25].map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={speed === s}
                  onClick={() => setSpeed(s)}
                  className={`rounded-full px-3 py-1 font-mono text-micro transition-colors duration-150 ${
                    speed === s ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRun((r) => r + 1)}
              className="pressable inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-small text-ink-2 hover:text-ink"
            >
              <ReplayIcon />
              Replay
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <SpeedContext value={speed}>
            {visible ? <Component key={run} /> : loading()}
          </SpeedContext>
        </div>
      </div>
      <figcaption className="mt-3 max-w-[64ch] text-small text-ink-2">{caption}</figcaption>
    </figure>
  );
}
