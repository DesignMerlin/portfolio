"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, useSyncExternalStore, ViewTransition } from "react";
import type { WorkSummary } from "@/lib/content";
import { Cover } from "./Cover";

// Signature interaction (Index). CSS transitions only (motion tokens from
// styles/tokens.css): no animation library on the first load, and CSS
// transitions retarget mid-flight, so fast hovering never jumps.
// Hover or focus a row → the anchored preview switches to that project, and a
// thin ink marker slides to the row (it shows *which* row the preview belongs to).
// Select → the preview's cover morphs into the case study hero (React
// <ViewTransition>, shared name `cover-<slug>`).
// The preview always shows something (first project by default), so the panel
// is useful with zero interaction. On narrow screens each row carries its own
// cover instead: nothing hides behind hover, and one tap opens the case study.

const desktopQuery = "(min-width: 64rem)";
const subscribe = (onChange: () => void) => {
  const query = matchMedia(desktopQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

export function WorkList({ work }: { work: WorkSummary[] }) {
  // Only one element per cover name may exist at a time, so the morph source
  // is the panel on desktop and the row thumbnail on mobile.
  const isDesktop = useSyncExternalStore(
    subscribe,
    () => matchMedia(desktopQuery).matches,
    () => false,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const active = work[activeIndex] ?? work[0];

  const listRef = useRef<HTMLOListElement>(null);
  const [marker, setMarker] = useState<{ y: number; height: number } | null>(null);

  // Measure the active row to place the marker (transform only, no layout animation).
  useLayoutEffect(() => {
    const row = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    if (row) setMarker({ y: row.offsetTop, height: row.offsetHeight });
  }, [activeIndex, isDesktop]);

  if (!active) return null;

  return (
    <div className="grid gap-x-12 gap-y-6 lg:grid-cols-12">
      {/* On mouse leave the last previewed project stays: the panel never empties. */}
      <ol ref={listRef} className="relative border-t border-line lg:col-span-7">
        {work.map((project, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={project.slug} className="border-b border-line">
              <Link
                href={`/work/${project.slug}`}
                transitionTypes={["nav-forward"]}
                onPointerEnter={(event) => event.pointerType === "mouse" && setActiveIndex(index)}
                // Touch on a wide screen has no hover: make the tapped row the morph source.
                onPointerDown={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 outline-offset-[-2px] sm:py-6 lg:px-5"
              >
                {!isDesktop && (
                  <div className="col-span-2 mb-3">
                    <ViewTransition name={`cover-${project.slug}`} share="morph" default="none">
                      <div>
                        <Cover
                          title={project.title}
                          domain={project.domain}
                          src={project.cover}
                          sizes="(min-width: 40rem) 90vw, 100vw"
                          priority={index === 0}
                        />
                      </div>
                    </ViewTransition>
                  </div>
                )}
                <span
                  className={`text-title font-medium transition-colors duration-(--dur-quick) ${isActive && isDesktop ? "text-ink" : "text-fg"} group-hover:text-ink`}
                >
                  {project.title}
                </span>
                <span className="font-mono text-meta text-faint tabular-nums">
                  {project.timeline}
                </span>
                <span className="text-muted">{project.summary}</span>
                <span className="hidden font-mono text-meta text-faint sm:block">
                  {project.domain}
                </span>
              </Link>
            </li>
          );
        })}

        {/* Ink marker: desktop only, follows the previewed row (transform only).
            It mounts already in place, so it never slides in from the top. */}
        {isDesktop && marker && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 h-10 w-0.5 origin-top bg-ink transition-transform duration-(--dur-deliberate) ease-standard motion-reduce:transition-none"
            style={{
              // y to the row, scaleY to its height (h-10 = 40px base).
              transform: `translateY(${marker.y + 20}px) scaleY(${(marker.height - 40) / 40})`,
            }}
          />
        )}
      </ol>

      {isDesktop && (
        <div className="lg:col-span-5">
          <div className="sticky top-8">
            <Link
              href={`/work/${active.slug}`}
              transitionTypes={["nav-forward"]}
              tabIndex={-1}
              aria-hidden="true"
              className="block"
            >
              {/* All covers share one frame and crossfade in place: the frame never
                  moves, so it never flickers. Only the visible one carries the
                  shared name that morphs into the case study hero. */}
              <div className="grid">
                {work.map((project, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={project.slug}
                      className={`transition-[opacity,transform] [grid-area:1/1] motion-reduce:transform-none ${
                        isActive
                          ? "scale-100 opacity-100 duration-(--dur-base) ease-enter"
                          : "scale-[1.015] opacity-0 duration-(--dur-quick) ease-exit"
                      }`}
                    >
                      <ViewTransition
                        name={isActive ? `cover-${project.slug}` : undefined}
                        share="morph"
                        default="none"
                      >
                        <div>
                          <Cover
                            title={project.title}
                            domain={project.domain}
                            src={project.cover}
                            sizes="(min-width: 76rem) 460px, 40vw"
                            priority={index === 0}
                          />
                        </div>
                      </ViewTransition>
                    </div>
                  );
                })}
              </div>
            </Link>
            <p
              className="mt-3 flex justify-between gap-4 font-mono text-meta text-faint"
              aria-hidden="true"
            >
              <span>{active.role}</span>
              <span>{active.domain}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
