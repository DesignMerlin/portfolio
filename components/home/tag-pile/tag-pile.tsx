"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { pileThemes, type PileTag } from "@/content/tag-pile";
import { INTRO_DONE } from "@/lib/site";
import type { PileEngine } from "@/components/home/tag-pile/pile-engine";
import type { PileSettings } from "@/components/home/tag-pile/settings";

const fontVar = { display: "var(--font-display)", sans: "var(--font-sans)", mono: "var(--font-mono)" } as const;

/**
 * Gravity tag pile. Every tag is a real rigid body (matter-js, loaded only
 * in the browser, see pile-engine.ts): tags fall in, collide, rotate and
 * stack. Visitors grab and throw any tag, push tags with the cursor, and
 * click one for a pop (or to open its link). Hard landings squash a tag.
 *
 * Tags are DOM buttons positioned from the physics each frame, so they keep
 * real typography, focus rings and keyboard access: Enter pops or opens a
 * tag, arrow keys nudge it. The layer itself never catches the pointer;
 * only the tags do, so everything underneath stays usable.
 *
 * Reduced motion: the pile appears already settled, with no squash or
 * cursor push. Dragging still works.
 */
export function TagPile({
  tags,
  settings,
  dropKey,
  active = true,
  className = "",
}: {
  tags: PileTag[];
  settings: PileSettings;
  dropKey: number;
  /** When false the pile pauses and ignores the pointer (e.g. while faded out) */
  active?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const area = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLButtonElement | null)[]>([]);
  const engine = useRef<PileEngine | null>(null);
  const live = useRef({ settings, reduce, active, tags, router });
  useLayoutEffect(() => {
    live.current = { settings, reduce, active, tags, router };
  });

  const theme = pileThemes[settings.theme];

  // Build the world once, in the browser only
  useEffect(() => {
    let cancelled = false;
    Promise.all([import("matter-js"), import("@/components/home/tag-pile/pile-engine")]).then(([mod, { PileEngine }]) => {
      if (cancelled || !area.current) return;
      const M = (mod.default ?? mod) as typeof import("matter-js");
      engine.current = new PileEngine(M, area.current, els.current, {
        getSettings: () => live.current.settings,
        isReduced: () => live.current.reduce,
        isActive: () => live.current.active,
        onActivate: (i) => {
          engine.current?.pop(i);
          const href = live.current.tags[i]?.href;
          if (href) setTimeout(() => live.current.router.push(href), 220);
        },
      });
      // Webfonts change the tags' width; re-measure once they're in
      document.fonts?.ready.then(() => !cancelled && engine.current?.buildBodies(true));
    });
    // On a full load the preloader covers the hero, so the first drop lands unseen: drop the
    // pile again the moment the preloader starts to leave, so every reload ends with it falling
    const afterIntro = () => engine.current?.drop();
    if (document.documentElement.dataset.intro === "play") addEventListener(INTRO_DONE, afterIntro, { once: true });
    return () => {
      removeEventListener(INTRO_DONE, afterIntro);
      cancelled = true;
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);

  // Live physics
  useEffect(() => {
    engine.current?.setPhysics(settings);
  }, [settings]);

  // A new theme changes the tags' size: rebuild their bodies where they are
  useLayoutEffect(() => {
    engine.current?.buildBodies(true);
  }, [settings.theme]);

  // Replay / Reset
  const lastDrop = useRef(dropKey);
  useEffect(() => {
    if (lastDrop.current === dropKey) return;
    lastDrop.current = dropKey;
    engine.current?.drop();
  }, [dropKey]);

  return (
    <div
      ref={area}
      role="group"
      aria-label="Skills pile. Drag and throw the tags, or focus one and use the arrow keys."
      data-active={active}
      className={`tag-pile pointer-events-none absolute overflow-hidden ${className}`}
    >
      {tags.map((t, i) => {
        const fill = t.color ?? theme.fills[i % theme.fills.length]!;
        const ink = t.ink ?? theme.inks[i % theme.inks.length]!;
        return (
          <button
            key={t.label}
            ref={(el) => {
              els.current[i] = el;
            }}
            type="button"
            aria-label={t.href ? `${t.label}, open` : t.label}
            tabIndex={active ? 0 : -1}
            onPointerDown={(e) => {
              if (engine.current?.grab(i, e.clientX, e.clientY)) e.preventDefault();
            }}
            onClick={(e) => {
              // Pointer clicks are handled on release; this is the keyboard path
              if (e.detail !== 0) return;
              engine.current?.pop(i);
              if (t.href) setTimeout(() => router.push(t.href!), 220);
            }}
            onKeyDown={(e) => {
              if (engine.current?.nudge(i, e.key)) e.preventDefault();
            }}
            className="pile-tag absolute top-0 left-0 cursor-grab touch-none outline-offset-4 select-none"
            style={{ opacity: 0, transform: "translate3d(-999px,-999px,0)" }}
          >
            <span
              className="relative inline-flex items-center gap-2 overflow-hidden rounded-full whitespace-nowrap"
              style={{
                background: fill,
                color: ink,
                paddingTop: theme.paddingY,
                paddingBottom: theme.paddingY,
                paddingRight: theme.paddingX,
                paddingLeft: t.image ? theme.paddingY : theme.paddingX,
                fontFamily: fontVar[theme.font],
                fontWeight: theme.weight,
                fontSize: theme.fontSize,
                lineHeight: 1.1,
                border: theme.border,
                boxShadow: theme.shadow,
              }}
            >
              {t.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.image}
                  alt=""
                  draggable={false}
                  className="shrink-0 rounded-full object-cover"
                  style={{ width: theme.imageSize, height: theme.imageSize }}
                />
              ) : null}
              {t.label}
              {t.href ? (
                <span aria-hidden="true" className="opacity-60">
                  ↗
                </span>
              ) : null}
              {theme.gloss ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgb(255_255_255/0.55)_0%,rgb(255_255_255/0.08)_48%,transparent_52%)]"
                />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
