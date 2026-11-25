"use client";

import { useState } from "react";
import { DeviceMockup, type Mockup } from "@/components/ui/device-mockup";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";

const control =
  "pressable h-9 rounded-full bg-[rgb(12_18_14/0.72)] text-white backdrop-blur-md hover:bg-[rgb(12_18_14/0.86)]";

/**
 * The project's motion piece as the page cover, with its controls: pause (it
 * runs longer than 5s, so it can always be stopped) and, for films, 0.25×
 * speed to look at the motion closely. Reduced motion: a still, no controls.
 */
export function ProjectCover({ mockup, title }: { mockup: Mockup; title: string }) {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  return (
    <div className="project-cover relative h-full w-full">
      <DeviceMockup mockup={mockup} label={title} paused={paused} rate={rate} priority />
      {reduce ? null : (
        <div className="absolute right-3 bottom-3 z-10 flex gap-2 sm:right-4 sm:bottom-4">
          {"film" in mockup ? (
            <button
              type="button"
              aria-pressed={rate !== 1}
              onClick={() => setRate((r) => (r === 1 ? 0.25 : 1))}
              className={`${control} px-3.5 font-mono text-micro aria-pressed:bg-white aria-pressed:text-[#111318]`}
            >
              0.25×<span className="sr-only"> speed</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play" : "Pause"}
            className={`${control} grid w-9 place-items-center`}
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d={paused ? "M3.5 1.5 12 7l-8.5 5.5Z" : "M2.5 1.5h3v11h-3zM8.5 1.5h3v11h-3z"} />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
