"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import type { Skill } from "@/content/about";
import { Clip } from "@/components/home/rope-carousel/clips";
import { NotebookCard } from "@/components/home/rope-carousel/notebook-card";
import type { RopeEngine } from "@/components/home/rope-carousel/rope-engine";
import { defaultRopeSettings, type RopeCarouselSettings } from "@/components/home/rope-carousel/settings";

// One highlighter colour per page
const tints = ["#c4b5fd", "#fde047", "#fdba74", "#f9a8d4", "#86efac"];

/**
 * Rope curved carousel. Notebook pages are pegged along a hanging rope and
 * flow along it in an endless loop. Each page follows the rope's curve,
 * keeps its own slight lean, and swings when the flow changes speed.
 *
 * Input: drag (with fling momentum), horizontal wheel/trackpad, vertical
 * wheel nudges and arrow keys (focus the rope first). Autoplay pauses on
 * hover and while the rope has keyboard focus.
 *
 * Reduced motion: no autoplay and no sway; steps jump instead of glide.
 * Dragging still works because it's the visitor's own motion.
 */
export function RopeCarousel({
  items,
  settings: overrides,
  label,
}: {
  items: Skill[];
  settings?: Partial<RopeCarouselSettings>;
  label: string;
}) {
  const settings = useMemo(() => ({ ...defaultRopeSettings, ...overrides }), [overrides]);
  const reduce = useReducedMotion();
  const [copies, setCopies] = useState(2);

  const stage = useRef<HTMLDivElement>(null);
  const ropePaths = useRef<SVGPathElement[]>([]);
  const cardEls = useRef<(HTMLLIElement | null)[]>([]);
  const engine = useRef<RopeEngine | null>(null);
  const live = useRef({ settings, reduce });
  useLayoutEffect(() => {
    live.current = { settings, reduce };
  });

  const count = items.length;
  const total = count * copies;

  useEffect(() => {
    let cancelled = false;
    import("@/components/home/rope-carousel/rope-engine").then(({ RopeEngine }) => {
      if (cancelled || !stage.current) return;
      engine.current = new RopeEngine(stage.current, ropePaths.current.filter(Boolean), {
        getSettings: () => live.current.settings,
        isReduced: () => live.current.reduce,
        isPlaying: () => live.current.settings.autoplay,
        onLayout: (width, pitch) => {
          // Enough copies that the loop is wider than the stage plus a card at each end
          setCopies(Math.max(1, Math.ceil((width + 2 * pitch) / (count * pitch))));
        },
      });
      engine.current.setCards(cardEls.current.slice(0, count * 2).filter((el): el is HTMLLIElement => !!el));
    });
    return () => {
      cancelled = true;
      engine.current?.destroy();
      engine.current = null;
    };
  }, [count]);

  useLayoutEffect(() => {
    engine.current?.setCards(cardEls.current.slice(0, total).filter((el): el is HTMLLIElement => !!el));
  }, [total]);

  useEffect(() => {
    engine.current?.wake();
  }, [reduce, settings]);

  const stageStyle = {
    "--rc-w": `${settings.width}px`,
    "--rc-w-m": `${settings.mobileWidth}px`,
    "--rc-top": `${settings.top}px`,
    "--rc-sag": settings.sag,
    "--rc-ratio": settings.ratio,
  } as React.CSSProperties;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      // Only keyboard focus pauses: clicking or dragging the rope also focuses it, and that must not stop the flow
      onFocus={(e) => engine.current?.setFocused(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) engine.current?.setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          engine.current?.step(e.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div
        ref={stage}
        tabIndex={0}
        aria-label={`${label}. Drag, scroll sideways or use the arrow keys to move along the rope.`}
        className="rope-stage relative w-full touch-pan-y overflow-hidden outline-offset-[-4px] select-none [--rc-cw:var(--rc-w-m)] sm:[--rc-cw:var(--rc-w)]"
        style={stageStyle}
      >
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          {settings.shadow ? (
            <path
              ref={(el) => {
                if (el) ropePaths.current[0] = el;
              }}
              fill="none"
              stroke="rgb(0 0 0 / 0.28)"
              strokeWidth={settings.thickness + 1.5}
              transform="translate(0 5)"
              className="[filter:blur(2.5px)]"
            />
          ) : null}
          <path
            ref={(el) => {
              if (el) ropePaths.current[1] = el;
            }}
            fill="none"
            stroke={settings.color}
            strokeWidth={settings.thickness}
            strokeLinecap="round"
          />
          {settings.braid ? (
            <path
              ref={(el) => {
                if (el) ropePaths.current[2] = el;
              }}
              fill="none"
              stroke="rgb(255 255 255 / 0.55)"
              strokeWidth={Math.max(0.6, settings.thickness * 0.45)}
              strokeDasharray={`${settings.thickness * 1.6} ${settings.thickness * 1.4}`}
            />
          ) : null}
        </svg>

        <ul className="m-0 list-none p-0">
          {Array.from({ length: total }, (_, i) => {
            const svc = items[i % count]!;
            const copy = i >= count;
            return (
              <li
                key={i}
                ref={(el) => {
                  cardEls.current[i] = el;
                }}
                // Only the first set is announced; the rest are visual repeats that make the loop endless
                aria-hidden={copy || undefined}
                className="absolute top-0 left-0 w-[var(--rc-cw)] origin-[50%_0] will-change-transform"
                style={{ transform: "translate3d(-9999px,0,0)" }}
              >
                <NotebookCard
                  svc={svc}
                  tint={tints[i % count % tints.length]!}
                  radius={settings.radius}
                  shadow={settings.cardShadow}
                />
                <Clip style={settings.clip} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
