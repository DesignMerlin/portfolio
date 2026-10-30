"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, ViewTransition } from "react";
import { PlaceholderShot, type PlaceholderKind } from "@/components/ui/placeholder-shot";
import { RollingNumber } from "@/components/ui/rolling-number";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import type { PeelEngine, PeelSettings } from "@/components/home/sticker-grid/peel-engine";

const noop = () => () => {};

export type StickerWork = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  /** A confirmed result, shown under the subtitle */
  note?: string;
  cover: string | null;
  coverAlt: string;
  tint: string;
  placeholder: PlaceholderKind;
  href: string;
  cta: string;
  status: "case-study" | "soon";
  /** Case studies only: the revealed cover morphs into the case study hero */
  morphName?: string;
};

/**
 * One project as a peelable sticker.
 * - Drag the corner (or anywhere on the sticker) to peel it; let go past
 *   about 40% of the way, or throw it, and it peels off. Otherwise it
 *   springs back. Click or tap toggles. Every motion is interruptible.
 * - At rest the corner curls up and flutters in a light breeze; hovering
 *   lifts it a little further, as a hint.
 * - Underneath: the cover behind frosted glass, the title, one line on the
 *   work, and the next step (case study, or the Playground while a case
 *   study is on its way). "image-only" mode shows just the picture.
 * Keyboard: the sticker is a button (Enter/Space peels it and moves focus
 * to the link underneath); "Stick it back" or Escape covers it again.
 * Reduced motion: no breeze, and the sticker switches state instantly.
 */
export function StickerCard({
  work,
  mode = "image-text",
  settings = { wind: 1, windSpeed: 1 },
  priority = false,
}: {
  work: StickerWork;
  mode?: "image-text" | "image-only";
  settings?: PeelSettings;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  // The shared-element name is only given after hydration, so it never sits on two elements at once
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const root = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLButtonElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const engine = useRef<PeelEngine | null>(null);
  const keyboard = useRef(false);
  const live = useRef({ reduce, settings });
  useLayoutEffect(() => {
    live.current = { reduce, settings };
  });

  useEffect(() => {
    let cancelled = false;
    import("@/components/home/sticker-grid/peel-engine").then(({ PeelEngine }) => {
      if (cancelled || !root.current || !front.current || !flap.current) return;
      engine.current = new PeelEngine(
        { root: root.current, front: front.current, flap: flap.current },
        {
          isReduced: () => live.current.reduce,
          getSettings: () => live.current.settings,
          onToggle: (next) => setOpen(next),
        },
      );
    });
    return () => {
      cancelled = true;
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);

  // Focus follows the reveal when it came from the keyboard
  useEffect(() => {
    if (!keyboard.current) return;
    keyboard.current = false;
    if (open) cta.current?.focus({ preventScroll: true });
    else front.current?.focus({ preventScroll: true });
  }, [open]);

  const close = () => {
    keyboard.current = true;
    engine.current?.toggle(false);
  };

  const art = (sizes: string) =>
    work.cover ? (
      <Image
        src={work.cover}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        className="object-cover"
      />
    ) : (
      <PlaceholderShot kind={work.placeholder} tint={work.tint} label={work.title} className="absolute inset-0 h-full w-full" />
    );

  const sizes = "(min-width: 640px) 50vw, 100vw";

  return (
    <li className="min-w-0">
      <div
        ref={root}
        className="sticker relative aspect-[1184/1032] touch-pan-y select-none"
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.stopPropagation();
            close();
          }
        }}
      >
        <div className="sticker-bed absolute inset-0 overflow-hidden rounded-[var(--radius-l)]">
          {/* What the sticker was hiding */}
          <div className="absolute inset-0" inert={!open}>
            <ViewTransition name={mounted && work.morphName ? work.morphName : undefined} share="morph" default="none">
              <div className="absolute inset-0">{art(sizes)}</div>
            </ViewTransition>
            {mode === "image-text" ? (
              <div className="sticker-frost absolute inset-0 flex flex-col justify-end p-5 text-white sm:p-7">
                <p className="text-small text-white/70">{work.meta}</p>
                <h3 className="mt-1 font-display text-h3 font-semibold">{work.title}</h3>
                <p className="mt-2 max-w-[44ch] text-white/85">{work.subtitle}</p>
                {work.note ? (
                  <RollingNumber value={work.note} play={open} className="mt-2 block text-small font-medium tabular text-[#7ff0b3]" />
                ) : null}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    ref={cta}
                    href={work.href}
                    transitionTypes={["nav-forward"]}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-small font-medium text-[#111318] transition-transform duration-[var(--dur-quick)] ease-[var(--ease-enter)] hover:scale-[1.03] active:scale-[0.97]"
                  >
                    {work.cta}
                  </Link>
                  {work.status === "soon" ? (
                    <span className="rounded-full border border-dashed border-white/40 px-3 py-1.5 text-micro text-white/80">
                      Case study soon
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              <Link ref={cta} href={work.href} className="absolute inset-0" aria-label={`${work.cta}: ${work.title}`} />
            )}
            <button
              type="button"
              data-no-peel
              onClick={close}
              aria-label={`Stick the ${work.title} sticker back`}
              className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition-[background-color,transform] duration-[var(--dur-quick)] ease-[var(--ease-enter)] hover:bg-black/55 active:scale-[0.94]"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 8a5 5 0 1 0 1.5-3.5M3 2.5V5h2.5" />
              </svg>
            </button>
          </div>

          {/* The sticker itself */}
          <button
            ref={front}
            type="button"
            aria-expanded={open}
            aria-label={`${work.title}. Peel the sticker to ${work.status === "soon" ? "see the project" : "open the case study"}`}
            onClick={(e) => {
              // Pointer clicks are handled by the peel engine on release; this is the keyboard path
              if (e.detail !== 0) return;
              keyboard.current = true;
              engine.current?.toggle();
            }}
            className="sticker-front absolute inset-0 block cursor-grab"
          >
            {art(sizes)}
            <span aria-hidden="true" className="sticker-sheen pointer-events-none absolute inset-0" />
          </button>

          {/* The part that's peeled up, mirrored over the fold */}
          <div aria-hidden="true" className="sticker-flap-shadow pointer-events-none absolute inset-0">
            <div ref={flap} className="sticker-flap absolute inset-0 origin-top-left rounded-[var(--radius-l)]" style={{ visibility: "hidden" }} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="min-w-0 truncate">
          <span className="font-medium">{work.title}</span> <span className="text-ink-2">{work.meta}</span>
        </p>
        <span className={`shrink-0 text-small ${work.status === "soon" ? "text-ink-3" : "text-ink-2"}`}>
          {work.status === "soon" ? "Case study soon" : "Case study"}
        </span>
      </div>
    </li>
  );
}
