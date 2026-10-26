"use client";

import Link from "next/link";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { useState, ViewTransition } from "react";
import { Cover, type CoverData } from "@/components/case-study/cover";
import { ArrowUpRight } from "@/components/ui/icons";
import { tween } from "@/lib/motion";

export type WorkListItem = CoverData & {
  slug: string;
  summary: string;
  domain: string;
  year: string;
  role: string;
};

/**
 * Signature interaction for the Index.
 * - Hover or focus a row: the anchored preview swaps to that project, wiping
 *   in from the direction you moved through the list (down the list, it rises
 *   from below). Interruptible: Motion retargets mid-wipe.
 * - Hover the preview: it blurs and reveals the pitch and call to action
 *   (Samuel's Figma hover state, rebuilt with real text).
 * - Select: the preview image morphs into the case study hero (shared
 *   <ViewTransition> name), while the page slides forward.
 * Touch and small screens get full cards with the cover visible. Nothing is
 * hidden behind hover.
 */
export function WorkList({ items }: { items: WorkListItem[] }) {
  const [{ active, direction }, setState] = useState({ active: 0, direction: 1 });
  const [engaged, setEngaged] = useState(false);
  const reduce = useReducedMotion();

  const activate = (i: number) =>
    setState((s) => (s.active === i ? s : { active: i, direction: i > s.active ? 1 : -1 }));

  const current = items[active]!;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
      <ol
        className="group/list"
        data-engaged={engaged}
        onPointerEnter={() => setEngaged(true)}
        onPointerLeave={() => setEngaged(false)}
        onFocus={() => setEngaged(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setEngaged(false);
        }}
      >
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <li key={item.slug} className="border-t border-line last:border-b">
              <Link
                href={`/work/${item.slug}`}
                transitionTypes={["nav-forward"]}
                onPointerEnter={() => activate(i)}
                onFocus={() => activate(i)}
                className="group/row block py-6 outline-offset-[-2px] lg:py-7"
              >
                {/* Small screens: the cover is always visible, and morphs on tap */}
                <div className="mb-5 aspect-[1184/1032] overflow-hidden rounded-[var(--radius-l)] bg-sunken lg:hidden">
                  <ViewTransition name={`cover-${item.slug}`} share="morph" default="none">
                    <div className="h-full w-full">
                      <Cover work={item} sizes="(max-width: 1024px) 100vw, 1px" />
                    </div>
                  </ViewTransition>
                </div>

                <div
                  className={`flex items-baseline justify-between gap-6 transition-opacity duration-[180ms] ease-[var(--ease-enter)] ${
                    engaged && !isActive ? "lg:opacity-40" : "opacity-100"
                  }`}
                >
                  <h3 className="text-h2 font-semibold">{item.title}</h3>
                  {item.year ? <span className="shrink-0 font-mono text-micro text-ink-2 tabular">{item.year}</span> : null}
                </div>
                <div
                  className={`mt-3 grid gap-x-6 gap-y-1 transition-opacity duration-[180ms] ease-[var(--ease-enter)] sm:grid-cols-[1fr_auto] ${
                    engaged && !isActive ? "lg:opacity-40" : "opacity-100"
                  }`}
                >
                  <p className="max-w-[46ch] text-ink-2">{item.summary}</p>
                  <p className="text-small text-ink-3 sm:text-right">{item.domain}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Large screens: anchored preview. It duplicates the row link, so it's hidden from tab order and AT. */}
      <div className="hidden lg:block">
        <Link
          href={`/work/${current.slug}`}
          transitionTypes={["nav-forward"]}
          tabIndex={-1}
          aria-hidden="true"
          className="group/preview sticky top-24 block aspect-[1184/1032] overflow-hidden rounded-[var(--radius-l)] bg-sunken shadow-[var(--shadow-raised)]"
        >
          <AnimatePresence initial={false}>
            <PreviewImage key={current.slug} item={current} direction={direction} reduce={!!reduce} />
          </AnimatePresence>

          {/* Hover state from the Figma component: blur, wash, pitch, call to action */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-paper/90 via-paper/40 to-transparent opacity-0 transition-opacity duration-[280ms] ease-[var(--ease-enter)] group-hover/preview:opacity-100" />
          <div className="pointer-events-none absolute inset-x-8 bottom-8 z-20 translate-y-2 opacity-0 transition-[opacity,transform] duration-[280ms] ease-[var(--ease-enter)] group-hover/preview:translate-y-0 group-hover/preview:opacity-100">
            <p className="font-display text-h3 font-semibold text-ink">{current.title}</p>
            <p className="mt-1 max-w-[40ch] text-ink-2">{current.summary}</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-small font-medium text-accent-ink">
              Read case study
              <ArrowUpRight />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

function PreviewImage({ item, direction, reduce }: { item: WorkListItem; direction: number; reduce: boolean }) {
  // Only the image that's staying gets the shared name, so an exiting copy never collides with it
  const present = useIsPresent();
  const from = direction > 0 ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)";

  return (
    <motion.div
      className="absolute inset-0"
      initial={reduce ? { opacity: 0 } : { clipPath: from }}
      animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0% 0)" }}
      // The old image stays put underneath until the new one has fully covered it
      exit={reduce ? { opacity: 0 } : { opacity: 1, transition: { duration: 0, delay: 0.28 } }}
      transition={tween("base")}
      style={{ zIndex: present ? 1 : 0 }}
    >
      <ViewTransition name={present ? `cover-${item.slug}` : undefined} share="morph" default="none">
        <div className="h-full w-full transition-[filter,transform] duration-[280ms] ease-[var(--ease-enter)] group-hover/preview:scale-[1.02] group-hover/preview:blur-md">
          <Cover work={item} sizes="(min-width: 1024px) 50vw, 1px" />
        </div>
      </ViewTransition>
    </motion.div>
  );
}
