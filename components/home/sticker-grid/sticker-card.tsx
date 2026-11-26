"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, ViewTransition } from "react";
import { PlaceholderShot, type PlaceholderKind } from "@/components/ui/placeholder-shot";
import { DeviceMockup, type Mockup } from "@/components/ui/device-mockup";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import type { PeelEngine, PeelSettings } from "@/components/home/sticker-grid/peel-engine";

const noop = () => () => {};

export type StickerWork = {
  id: string;
  title: string;
  /** Shown under the card with the title on hover: the year, and what kind of work it was */
  year?: string;
  label?: string;
  cover: string | null;
  tint: string;
  placeholder: PlaceholderKind;
  /** Real screenshots as a laptop + phone motion ad, when there's no cover image */
  mockup?: Mockup;
  href: string;
  /** The revealed cover morphs into the project page's cover */
  morphName?: string;
};

/**
 * One project as a peelable sticker.
 * - Drag the corner (or anywhere on the sticker) to peel it; let go past
 *   about 40% of the way, or throw it, and it peels off. Otherwise it
 *   springs back. Click or tap toggles. Every motion is interruptible.
 * - At rest the corner curls up, still. Hovering lifts it a little further
 *   and sets it fluttering in a light breeze, as a hint.
 * - Hovering (or focusing it) brings up a liquid glass View button, which
 *   goes straight to the project. Touch has no hover: tap peels the sticker,
 *   and the link underneath goes to the same page.
 * - Underneath: the cover behind frosted glass and the link to its page.
 *   "image-only" mode shows just the picture.
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
  // The copy under the sticker (what a peel reveals) is only built once someone reaches for the card:
  // six cards each holding a second, hidden film was half the page's drawing cost
  const [armed, setArmed] = useState(false);
  const arm = () => setArmed(true);
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

  // The View button leans a little towards the pointer, and its glass catches the light on that side
  const lean = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const s = e.currentTarget.style;
    s.setProperty("--lean-x", (x * 2 - 1).toFixed(3));
    s.setProperty("--lean-y", (y * 2 - 1).toFixed(3));
    s.setProperty("--light-x", `${(x * 100).toFixed(1)}%`);
    s.setProperty("--light-y", `${(y * 100).toFixed(1)}%`);
  };

  // A motion ad (laptop + phone, or three phones) wins over a still cover when there is one
  const art = (covered: boolean) =>
    work.mockup ? (
      <DeviceMockup mockup={work.mockup} label={work.title} covered={covered} priority={priority} />
    ) : work.cover ? (
      <Image
        src={work.cover}
        alt=""
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        priority={priority}
        draggable={false}
        className="object-cover"
      />
    ) : (
      <PlaceholderShot kind={work.placeholder} tint={work.tint} label={work.title} className="absolute inset-0 h-full w-full" />
    );

  return (
    <li className="min-w-0">
      <div
        ref={root}
        className="sticker relative aspect-[1184/1032] touch-pan-y select-none"
        onPointerMove={lean}
        onPointerEnter={arm}
        onPointerDown={arm}
        onFocus={arm}
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
            <ViewTransition name={mounted && open ? work.morphName : undefined} share="morph" default="none">
              <div className="absolute inset-0">{armed || open ? art(!open) : null}</div>
            </ViewTransition>
            {mode === "image-text" ? (
              <div className="sticker-frost absolute inset-0 grid place-items-center">
                <Link
                  ref={cta}
                  href={work.href}
                  transitionTypes={["nav-forward"]}
                  aria-label={`Read case study: ${work.title}`}
                  className="inline-flex items-center rounded-full bg-white px-5 py-3 text-small font-medium text-[#111318] transition-transform duration-[var(--dur-quick)] ease-[var(--ease-enter)] hover:scale-[1.03] active:scale-[0.97]"
                >
                  Read case study
                </Link>
              </div>
            ) : (
              <Link ref={cta} href={work.href} className="absolute inset-0" aria-label={`Read case study: ${work.title}`} />
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
            aria-label={`${work.title}. Peel the sticker to open the case study`}
            onClick={(e) => {
              // Pointer clicks are handled by the peel engine on release; this is the keyboard path
              if (e.detail !== 0) return;
              keyboard.current = true;
              engine.current?.toggle();
            }}
            className="sticker-front absolute inset-0 block cursor-grab"
          >
            <ViewTransition name={mounted && !open ? work.morphName : undefined} share="morph" default="none">
              <span className="absolute inset-0 block">{art(open)}</span>
            </ViewTransition>
            <span aria-hidden="true" className="sticker-sheen pointer-events-none absolute inset-0" />
          </button>

          {/* The part that's peeled up, mirrored over the fold */}
          <div aria-hidden="true" className="sticker-flap-shadow pointer-events-none absolute inset-0">
            <div ref={flap} className="sticker-flap absolute inset-0 origin-top-left rounded-[var(--radius-l)]" style={{ visibility: "hidden" }} />
          </div>

          {/* Straight to the project, without peeling */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center" inert={open}>
            <Link href={work.href} transitionTypes={["nav-forward"]} aria-label={`View ${work.title}`} className="glass sticker-view text-small font-medium">
              <span className="relative z-[1]">View</span>
            </Link>
          </div>
        </div>
      </div>
      {/* Name, year and what kind of work, shown while the card is hovered or focused (always on touch).
          The sticker's own buttons and links carry the name for keyboards and screen readers. */}
      <div aria-hidden="true" className="sticker-caption mt-3 flex items-baseline justify-between gap-4 text-small">
        <span className="min-w-0 truncate">
          <span className="font-medium text-ink">{work.title}</span>
          {work.year ? <span className="ml-2 text-ink-3">© {work.year}</span> : null}
        </span>
        {work.label ? <span className="shrink-0 text-ink-3">{work.label}</span> : null}
      </div>
    </li>
  );
}
