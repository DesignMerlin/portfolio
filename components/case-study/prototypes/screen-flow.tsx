"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LiveOverlay } from "@/components/case-study/live/kit";
import { liveScene } from "@/components/case-study/live/scenes";
import { useSlow } from "@/components/case-study/prototype-speed";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { spring, tween } from "@/lib/motion";

/** How a screen arrives. `back` plays the push in reverse; `drop` sends a sheet back down */
export type Move = "push" | "back" | "sheet" | "drop" | "in" | "out" | "fade";
/** Centre and size of the tappable area, in screen points (375×812) */
export type Spot<Id extends string> = { label: string; at: [x: number, y: number]; size: [w: number, h: number]; to: Id; move?: Move };
/** A field that types itself when tapped: the screen's own text, uncovered a character at a time */
export type Field = {
  label: string;
  text: [x: number, y: number, w: number, h: number];
  field: [x: number, y: number, w: number, h: number];
  r: number;
  bg: string;
  chars: number;
  /** An image of the words, typed over a placeholder */
  src?: string;
  /** The placeholder to clear first, when it's wider than the words */
  clear?: [x: number, y: number, w: number, h: number];
};
export type FlowNode<Id extends string> = {
  spots: Spot<Id>[];
  fields?: Field[];
  auto?: { to: Id; after: number; move: Move };
  /** The screen is a bottom sheet, starting this far down (points), over another screen: it slides */
  sheet?: { top: number; over: Id };
};
export type Flow<Id extends string> = Partial<Record<Id, FlowNode<Id>>>;

export const FULL: [number, number] = [375, 812];
export const BTN: [number, number] = [343, 52];
export const ICON: [number, number] = [48, 48];

const enter: Record<Move, Record<string, string | number>> = {
  push: { transform: "translateX(100%) scale(1)", opacity: 1 },
  back: { transform: "translateX(-28%) scale(1)", opacity: 1 },
  sheet: { transform: "translateX(0%) scale(1)", opacity: 0 },
  drop: { transform: "translateX(0%) scale(1)", opacity: 1 },
  in: { transform: "translateX(0%) scale(0.88)", opacity: 0 },
  out: { transform: "translateX(0%) scale(1.1)", opacity: 0 },
  fade: { transform: "translateX(0%) scale(1)", opacity: 0 },
};
const leave: Record<Move, Record<string, string | number>> = {
  push: { transform: "translateX(-28%) scale(1)", opacity: 1 },
  back: { transform: "translateX(100%) scale(1)", opacity: 1 },
  sheet: { transform: "translateX(0%) scale(1)", opacity: 1 },
  drop: { transform: "translateX(0%) scale(1)", opacity: 1 },
  in: { transform: "translateX(0%) scale(1.1)", opacity: 0 },
  out: { transform: "translateX(0%) scale(0.88)", opacity: 0 },
  fade: { transform: "translateX(0%) scale(1)", opacity: 0 },
};
const SHOW = { transform: "translateX(0%) scale(1)", opacity: 1 };

/**
 * An app, clickable, with its real screens. Screens move the way the app
 * means them: forward pushes in from the right and back reverses it, sheets
 * slide up from the bottom, stepping into something zooms in and leaving
 * zooms out, and changing tab or filter crossfades. Tap anywhere else and the
 * tappable areas show themselves. A touch leaves a mark where it landed,
 * buttons darken while they're held, and a tapped field types itself. Every
 * area is a real button, so it works with a keyboard, and focus lands on the
 * new screen.
 * Reduced motion: every change is a crossfade.
 */
export function ScreenFlow<Id extends string>({
  name,
  screens,
  flow,
  start,
  island = false,
  tint = "#4b37d6",
}: {
  name: string;
  screens: Record<Id, { src: string; alt: string }>;
  flow: Flow<Id>;
  start: Id;
  /** Draw the Dynamic Island, for screens that don't already include it */
  island?: boolean;
  /** The app's colour, for the focused field */
  tint?: string;
}) {
  const { speed, t, ms } = useSlow();
  const reduce = useReducedMotion();
  const [view, setView] = useState<{ id: Id; move: Move }>({ id: start, move: "fade" });
  const [hint, setHint] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [touch, setTouch] = useState<{ x: number; y: number; n: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const focusNext = useRef(false);
  const node = flow[view.id]!;
  const live = liveScene(screens[view.id].src);

  const go = (to: Id, move: Move = "push") => {
    setHint(0);
    setTyped([]);
    setView({ id: to, move });
  };

  // Splash screens, loaders and the like move on by themselves
  useEffect(() => {
    const auto = flow[view.id]?.auto;
    if (!auto) return;
    const timer = setTimeout(() => setView({ id: auto.to, move: auto.move }), ms(auto.after));
    return () => clearTimeout(timer);
  }, [view.id, ms, flow]);

  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    panel.current?.focus({ preventScroll: true });
  }, [view.id]);

  const move = reduce ? "fade" : view.move;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const springy = move !== "fade";

  return (
    <div
      role="group"
      aria-label={`${name} prototype`}
      className="tour-phone relative aspect-[375/812] w-full max-w-[320px] bg-[#0c0d10]"
      style={{ "--field": tint } as React.CSSProperties}
      onPointerDown={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTouch((p) => ({ x: e.clientX - r.left, y: e.clientY - r.top, n: (p?.n ?? 0) + 1 }));
      }}
    >
      <AnimatePresence initial={false} custom={move}>
        <motion.div
          key={view.id}
          className="absolute inset-0"
          custom={move}
          variants={{
            // A sheet's own layers do the moving, so its page stays put
            enter: (m: Move) => (node.sheet && m === "sheet" ? { ...SHOW } : enter[m]),
            show: SHOW,
            leave: (m: Move) => leave[m],
          }}
          initial="enter"
          animate="show"
          exit="leave"
          transition={t(springy ? spring.gentle : tween("base"))}
          // Going back, the old screen slides off on top; otherwise the new one arrives on top
          style={{ zIndex: move === "back" || move === "drop" ? 0 : 1 }}
        >
          {node.sheet ? (
            <SheetScreen
              src={screens[view.id].src}
              under={screens[node.sheet.over].src}
              top={node.sheet.top}
              move={move}
              transition={t(springy ? spring.gentle : tween("base"))}
            />
          ) : (
            <Image src={screens[view.id].src} alt="" fill sizes="320px" priority={view.id === start} draggable={false} className="object-cover" />
          )}
          {live ? <LiveOverlay scene={live} rate={speed} /> : null}
          {node.fields?.map((f) =>
            typed.includes(f.label) ? <TypedField key={f.label} field={f} instant={reduce} duration={ms(f.chars * 60)} active={typed.at(-1) === f.label} /> : null,
          )}
        </motion.div>
      </AnimatePresence>
      {island ? <span aria-hidden="true" className="flow-island" /> : null}

      <div
        ref={panel}
        tabIndex={-1}
        role="group"
        aria-label={screens[view.id].alt}
        className="absolute inset-0 z-10 outline-none"
        onPointerDown={(e) => e.target === e.currentTarget && setHint((h) => h + 1)}
      >
        {node.fields?.map((f) => (
          <button
            key={`${view.id}-${f.label}`}
            type="button"
            aria-label={`${f.label}, type into it`}
            data-hint={hint || undefined}
            className="flow-spot absolute z-[1] cursor-text"
            style={{ left: pct(f.field[0], 375), top: pct(f.field[1], 812), width: pct(f.field[2], 375), height: pct(f.field[3], 812) }}
            onClick={() => setTyped((p) => [...p.filter((x) => x !== f.label), f.label])}
          >
            {hint ? <span key={hint} aria-hidden="true" /> : null}
          </button>
        ))}
        {node.spots.map((s) => (
          <button
            key={`${view.id}-${s.label}`}
            type="button"
            aria-label={s.label}
            data-hint={hint || undefined}
            className="flow-spot absolute"
            style={{
              left: pct(s.at[0] - s.size[0] / 2, 375),
              top: pct(s.at[1] - s.size[1] / 2, 812),
              width: pct(s.size[0], 375),
              height: pct(s.size[1], 812),
            }}
            onClick={(e) => {
              focusNext.current = e.detail === 0;
              go(s.to, s.move);
            }}
          >
            {hint ? <span key={hint} aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
      {touch ? <span key={touch.n} aria-hidden="true" className="flow-touch" style={{ left: touch.x, top: touch.y }} /> : null}
    </div>
  );
}

/** Characters arriving one by one, with a caret and a lit field while it has focus */
function TypedField({ field: f, duration, instant, active }: { field: Field; duration: number; instant: boolean; active: boolean }) {
  const place = ([x, y, w, h]: Field["text"]) => ({
    left: `${(x / 375) * 100}%`,
    top: `${(y / 812) * 100}%`,
    width: `${(w / 375) * 100}%`,
    height: `${(h / 812) * 100}%`,
  });
  const timing = { animationDuration: `${duration}ms`, animationTimingFunction: `steps(${f.chars}, jump-end)`, animationDelay: "220ms" };
  return (
    <>
      {f.clear ? <span className="flow-typed" style={{ ...place(f.clear), background: f.bg }} /> : null}
      <span className="flow-typed" style={{ ...place(f.text), background: f.src ? f.bg : undefined }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {f.src ? <img src={f.src} alt="" draggable={false} /> : null}
        {instant ? null : <span style={{ background: f.bg, ...timing }} />}
      </span>
      {active ? (
        <>
          <span className="flow-focus" style={{ ...place(f.field), borderRadius: f.r * 0.85 }} />
          {instant ? null : (
            <span className="flow-caret" style={place(f.text)}>
              <span style={timing}>
                <i />
              </span>
            </span>
          )}
        </>
      ) : null}
    </>
  );
}

/** One exported screen split at the sheet's edge: the page under it dims, the sheet slides */
function SheetScreen({ src, under, top, move, transition }: { src: string; under: string; top: number; move: Move; transition: object }) {
  const edge = (top / 812) * 100;
  const slides = move === "sheet";
  return (
    <>
      <Image src={under} alt="" fill sizes="320px" draggable={false} className="object-cover" />
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(rgb(52 64 84 / 0.6), rgb(52 64 84 / 0.6))" }}
        initial={slides ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        variants={{ leave: (m: Move) => ({ opacity: m === "drop" ? 0 : 1 }) }}
        exit="leave"
        transition={transition}
      />
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 ${100 - edge}% 0)` }}
        initial={slides ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        variants={{ leave: (m: Move) => ({ opacity: m === "drop" ? 0 : 1 }) }}
        exit="leave"
        transition={transition}
      >
        <Image src={src} alt="" fill sizes="320px" draggable={false} className="object-cover" />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: `inset(${edge}% 0 0 0)` }}
        initial={slides ? { transform: `translateY(${100 - edge}%)` } : false}
        animate={{ transform: "translateY(0%)" }}
        variants={{ leave: (m: Move) => ({ transform: `translateY(${m === "drop" ? 100 - edge : 0}%)` }) }}
        exit="leave"
        transition={transition}
      >
        <Image src={src} alt="" fill sizes="320px" draggable={false} className="object-cover" />
      </motion.div>
    </>
  );
}
