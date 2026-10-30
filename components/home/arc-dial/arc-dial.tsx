"use client";

import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Testimonial } from "@/content/testimonials";
import { defaultArcSettings, type ArcDialSettings } from "@/components/home/arc-dial/settings";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { duration, ease, spring, stagger } from "@/lib/motion";

/** Side portraits are this fraction of the featured one */
const SMALL = 0.5;
/** Throws carry the dial this many seconds further before it settles */
const THROW = 0.18;
const DRAG_THRESHOLD = 6;

const wrap = (v: number, n: number) => ((((v + n / 2) % n) + n) % n) - n / 2;
const mod = (v: number, n: number) => ((v % n) + n) % n;

type Geometry = { R: number; step: number; vis: number };

/**
 * Testimonials on a dial. Portraits sit along the top of a circle; the one
 * at the top is the story being told, inside a ring that fills while it
 * plays. Turning the dial (drag, swipe, horizontal wheel, arrows, arrow
 * keys, or picking a portrait) rotates every portrait along the arc on one
 * spring, so you can see where the next story comes from.
 * - One continuous position drives everything: drags and wheels move it
 *   directly, releases settle it on the nearest portrait (throws carry on).
 * - The quote resolves word by word out of a blur; colours (accent, glow,
 *   text) cross-fade per story.
 * - Autoplay pauses while you hover, focus, drag, read an expanded quote,
 *   or the dial is off-screen.
 * Reduced motion: no autoplay, the dial jumps instead of rotating, and the
 * quote fades in.
 */
export function ArcDial({
  items,
  settings = defaultArcSettings,
}: {
  items: Testimonial[];
  settings?: ArcDialSettings;
}) {
  const n = items.length;
  const reduce = useReducedMotion();
  const pos = useMotionValue(0);
  const progress = useMotionValue(0);
  const R = useMotionValue(460);
  const step = useMotionValue((settings.span / 2 / settings.visible) * (Math.PI / 180));
  const vis = useMotionValue(settings.visible);
  const geo = useRef<Geometry>({ R: 460, step: step.get(), vis: settings.visible });

  const stage = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLDivElement>(null);
  const move = useRef<AnimationPlaybackControls | null>(null);
  const target = useRef(0);

  const [active, setActive] = useState(0);
  const [expandedFor, setExpandedFor] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [smallScreen, setSmallScreen] = useState(false);

  const item = items[active]!;
  const expanded = expandedFor === active;
  const playing = settings.autoplay && !reduce;
  const running = playing && onScreen && !hovered && !focused && !dragging && !expanded;

  useMotionValueEvent(pos, "change", (v) => {
    const a = mod(Math.round(v), n);
    setActive((prev) => (prev === a ? prev : a));
  });

  // Fit the dial to the stage: radius, spacing and how many portraits fit
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      const phone = w < 640;
      const size = phone ? Math.round(settings.size * 0.76) : settings.size;
      const r = Math.max(150, Math.min(w * 0.44, 480));
      const v = phone ? Math.min(settings.visible, 2) : settings.visible;
      const s = ((phone ? 64 : settings.span / 2) / v) * (Math.PI / 180);
      geo.current = { R: r, step: s, vis: v };
      R.set(r);
      step.set(s);
      vis.set(v);
      // Arrows sit on the arc just clear of the featured ring
      const d = size / 2 + 40;
      const arrowY = r - Math.sqrt(r * r - d * d);
      el.style.setProperty("--R", `${r}px`);
      el.style.setProperty("--S", `${size}px`);
      el.style.setProperty("--arrow-x", `${d}px`);
      el.style.setProperty("--arrow-y", `${arrowY}px`);
      el.style.setProperty("--arrow-a", `${(Math.asin(d / r) * 180) / Math.PI}deg`);
      // Start the badge and quote below any portrait that hangs over the text column, so they
      // never overlap (phones and narrow desktops, where the arc drops into the content)
      const y0 = size / 2 + 14;
      const column = Math.min(w, 544) / 2 - 8;
      const counterRow = phone ? 48 : 40;
      let top = size + 34;
      for (let k = 1; k <= v; k++) {
        const half = (size * SMALL * (1 - settings.depth * 0.14 * (k - 1))) / 2;
        if (r * Math.sin(k * s) - half > column + 8) continue;
        top = Math.max(top, y0 + r * (1 - Math.cos(k * s)) + half + 14 - counterRow);
      }
      el.style.setProperty("--content-top", `${Math.ceil(top)}px`);
      el.dataset.ready = "";
      setSmallScreen(phone);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [settings.size, settings.span, settings.visible, settings.depth, R, step, vis]);

  const settle = useCallback(
    (to: number, velocity = 0) => {
      target.current = to;
      move.current?.stop();
      move.current = reduce
        ? animate(pos, to, { duration: 0 })
        : animate(pos, to, { ...spring.gentle, velocity });
    },
    [pos, reduce],
  );

  const go = useCallback(
    (dir: number) => {
      const from = move.current?.state === "running" ? target.current : Math.round(pos.get());
      settle(from + dir);
    },
    [pos, settle],
  );

  const select = (i: number) => {
    const base = Math.round(pos.get());
    settle(base + wrap(i - mod(base, n), n));
  };

  // Autoplay: the ring fills, then the dial turns one step. Pausing keeps the fill where it was.
  const lastActive = useRef(active);
  useEffect(() => {
    if (lastActive.current !== active) {
      lastActive.current = active;
      progress.set(0);
    }
    if (!running) return;
    const left = (1 - progress.get()) * settings.interval;
    const c = animate(progress, 1, { duration: left, ease: "linear", onComplete: () => go(1) });
    return () => c.stop();
  }, [active, running, progress, settings.interval, go]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(!!e?.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Drag and swipe: the dial follows the pointer 1:1 along the arc
  const drag = useRef<{ id: number; x: number; from: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const pxPerStep = () => geo.current.R * geo.current.step;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("[data-no-drag]")) return;
    drag.current = { id: e.pointerId, x: e.clientX, from: pos.get(), moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      d.moved = true;
      move.current?.stop();
      d.from = pos.get() + dx / pxPerStep();
      stage.current?.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    pos.set(d.from - dx / pxPerStep());
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    suppressClick.current = true;
    setDragging(false);
    const v = pos.getVelocity();
    const carry = Math.max(-2, Math.min(2, v * THROW));
    settle(Math.round(pos.get() + carry), v);
  };

  // Horizontal wheel and trackpad swipes turn the dial directly; it settles once they stop
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let idle = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 1) return;
      e.preventDefault();
      move.current?.stop();
      pos.set(pos.get() + e.deltaX / (geo.current.R * geo.current.step));
      clearTimeout(idle);
      idle = window.setTimeout(() => settle(Math.round(pos.get())), 120);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(idle);
    };
  }, [pos, settle]);

  const vars = {
    "--t-accent": item.colors.accent,
    "--t-glow": item.colors.glow ?? item.colors.accent,
    "--t-text": item.colors.text ?? "var(--ink)",
  } as CSSProperties;

  const counter = (
    <span className="arc-pill rounded-full border border-line bg-surface px-3 py-1 text-micro text-ink-2 tabular">
      {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
    </span>
  );

  const arrow = (dir: -1 | 1, className = "") => (
    <button
      type="button"
      data-no-drag
      onClick={() => go(dir)}
      aria-label={dir < 0 ? "Previous testimonial" : "Next testimonial"}
      className={`arc-arrow grid size-8 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-[var(--shadow-raised)] transition-[color,transform] duration-[var(--dur-quick)] ease-[var(--ease-enter)] hover:text-ink active:scale-[0.92] ${className}`}
    >
      {dir < 0 ? <ArrowLeft width={14} height={14} /> : <ArrowRight width={14} height={14} />}
    </button>
  );

  return (
    <div
      ref={section}
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials"
      className="arc-dial relative"
      style={vars}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          go(e.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div aria-hidden="true" className="arc-glow pointer-events-none absolute -z-10" />

      <div
        ref={stage}
        className="arc-stage relative touch-pan-y select-none"
        data-dragging={dragging ? "" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* The dial: a dotted guide, with the accent stretch between the arrows */}
        <div aria-hidden="true" className="arc-guide pointer-events-none absolute" />
        <div aria-hidden="true" className="arc-guide arc-guide-accent pointer-events-none absolute" />

        <ul aria-label="Choose a testimonial" className="contents">
          {items.map((t, i) => (
            <Portrait
              key={t.id}
              t={t}
              index={i}
              n={n}
              pos={pos}
              R={R}
              step={step}
              vis={vis}
              depth={settings.depth}
              current={i === active}
              reachable={Math.abs(wrap(i - active, n)) <= (smallScreen ? Math.min(settings.visible, 2) : settings.visible)}
              onSelect={() => select(i)}
            />
          ))}
        </ul>

        {/* Ring around the featured slot; it fills while the story plays */}
        <svg aria-hidden="true" className="arc-ring pointer-events-none absolute" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" className="arc-ring-track" />
          <motion.circle cx="50" cy="50" r="48" className="arc-ring-fill" style={{ pathLength: progress }} />
        </svg>

        {arrow(-1, "arc-arrow-prev absolute hidden sm:grid")}
        {arrow(1, "arc-arrow-next absolute hidden sm:grid")}

        <div className="arc-content relative mx-auto flex max-w-[34rem] flex-col items-center px-2 text-center">
          <span
            aria-hidden="true"
            className="arc-quote-mark pointer-events-none absolute top-[calc(var(--S)+84px)] -left-4 hidden font-display text-[7rem] leading-none font-bold sm:block"
          >
            &ldquo;
          </span>
          <div className="flex items-center gap-3">
            {arrow(-1, "sm:hidden")}
            {counter}
            {arrow(1, "sm:hidden")}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {item.result ? (
              <span className="arc-badge rounded-full px-2.5 py-1 text-micro font-semibold">{item.result}</span>
            ) : null}
          </div>

          <Quote
            key={active}
            text={item.quote}
            expanded={expanded}
            onToggle={() => setExpandedFor(expanded ? null : active)}
            reduce={reduce}
            placeholder={item.placeholder}
          />

          <p className="mt-4 text-lead font-medium">{item.name ?? item.source}</p>
          <p className="text-small text-ink-2">
            {item.role}, {item.company}
          </p>
          <p className="mt-3">
            {item.verifiedVia ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-micro text-ink-2">
                <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 5.2 4 7.2 8 2.8" />
                </svg>
                {item.verifiedVia}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {/* Announce the story when the reader changes it; stay quiet while it plays by itself */}
      <p className="sr-only" aria-live={running ? "off" : "polite"}>
        Testimonial {active + 1} of {n}: {item.name ?? item.source}, {item.company}
      </p>
    </div>
  );
}

function Portrait({
  t,
  index,
  n,
  pos,
  R,
  step,
  vis,
  depth,
  current,
  reachable,
  onSelect,
}: {
  t: Testimonial;
  index: number;
  n: number;
  pos: MotionValue<number>;
  R: MotionValue<number>;
  step: MotionValue<number>;
  vis: MotionValue<number>;
  depth: number;
  current: boolean;
  reachable: boolean;
  onSelect: () => void;
}) {
  // Inputs: [position, radius, step angle, portraits per side]
  const inputs = [pos, R, step, vis];
  const at = (v: number[]) => wrap(index - v[0]!, n);
  const x = useTransform(inputs, (v: number[]) => v[1]! * Math.sin(at(v) * v[2]!));
  const y = useTransform(inputs, (v: number[]) => v[1]! * (1 - Math.cos(at(v) * v[2]!)));
  const scale = useTransform(inputs, (v: number[]) => {
    const a = Math.abs(at(v));
    return a < 1 ? 1 - (1 - SMALL) * a : SMALL * (1 - depth * 0.14 * (a - 1));
  });
  const opacity = useTransform(inputs, (v: number[]) => {
    const a = Math.abs(at(v));
    const shade = 1 - (depth * 0.3 * Math.max(0, a - 1)) / Math.max(1, v[3]! - 1);
    return Math.max(0, Math.min(1, v[3]! + 1 - a)) * shade;
  });
  const zIndex = useTransform(inputs, (v: number[]) => Math.round(100 - Math.abs(at(v)) * 10));

  return (
    <li className="contents">
      <motion.button
        type="button"
        onClick={onSelect}
        tabIndex={reachable ? 0 : -1}
        aria-hidden={reachable ? undefined : true}
        aria-current={current ? "true" : undefined}
        aria-label={`Testimonial from ${t.name ?? t.source}, ${t.company}`}
        className="arc-portrait absolute overflow-hidden rounded-full"
        style={{ x, y, scale, opacity, zIndex, "--p-accent": t.colors.accent } as never}
      >
        {t.photo ? (
          <Image src={t.photo} alt="" fill sizes="120px" draggable={false} className="object-cover" />
        ) : (
          <span aria-hidden="true" className="arc-monogram grid h-full w-full place-items-center font-display font-semibold">
            {t.company.slice(0, 1)}
          </span>
        )}
      </motion.button>
    </li>
  );
}


function Quote({
  text,
  expanded,
  onToggle,
  reduce,
  placeholder,
}: {
  text: string;
  expanded: boolean;
  onToggle: () => void;
  reduce: boolean;
  placeholder: boolean;
}) {
  const [overflows, setOverflows] = useState(false);
  const ro = useRef<ResizeObserver | null>(null);
  // Only offer "Read more" when the clamp actually hides something
  const measure = useCallback((el: HTMLParagraphElement | null) => {
    ro.current?.disconnect();
    if (!el) return;
    ro.current = new ResizeObserver(() => {
      if (!el.classList.contains("line-clamp-4")) return;
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    });
    ro.current.observe(el);
  }, []);
  useEffect(() => () => ro.current?.disconnect(), []);

  const words = text.split(" ");
  const each = Math.min(stagger / 4, 0.4 / words.length);
  return (
    <blockquote className="arc-quote mt-5 w-full">
      <p
        id="arc-quote-text"
        ref={measure}
        className={`text-[clamp(1.25rem,2.6vw,1.75rem)] leading-[1.35] text-balance ${expanded ? "" : "line-clamp-4"} ${placeholder ? "italic" : ""}`}
      >
        {words.map((w, i) => (
          <motion.span
            key={i}
            initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: reduce ? duration.base : duration.deliberate, ease: ease.enter, delay: reduce ? 0 : i * each }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </p>
      {overflows || expanded ? (
        <button
          type="button"
          data-no-drag
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls="arc-quote-text"
          className="arc-more mt-2 rounded-full px-2 py-0.5 text-small font-medium"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </blockquote>
  );
}
