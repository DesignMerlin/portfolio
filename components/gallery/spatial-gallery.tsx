"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { enter, place, type Point, type Space } from "@/components/gallery/layouts";
import { DeviceMockup, type Mockup } from "@/components/ui/device-mockup";
import { ArrowUpRight, CloseIcon } from "@/components/ui/icons";
import { PlaceholderShot, type PlaceholderKind } from "@/components/ui/placeholder-shot";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { gallery as G, type GalleryEntrance, type GalleryLayout, type GalleryMedia } from "@/content/gallery";
import { duration, ease, spring, stagger, tween } from "@/lib/motion";

export type GalleryItem = {
  id: string;
  title: string;
  caption: string;
  summary: string;
  year?: string;
  href: string | null;
  tint: string;
  kind: PlaceholderKind;
  cover: string | null;
  coverAlt: string;
  mockup?: Mockup;
  /** The film recorded as a small looping video, for the floating cards (scripts/gallery-videos.mjs) */
  loop?: { src: string; poster: string };
  media?: GalleryMedia;
  size: number;
  aspect: number;
  focus?: string;
};

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const bezier = (b: readonly [number, number, number, number]) => `cubic-bezier(${b.join(",")})`;
/** The card springs: critically damped, settling like spring.gentle (0.5s) */
const OMEGA = TAU / (spring.gentle.duration * 1.6);
/** Distance from the viewer to the screen, in px: how strongly depth shrinks things */
const PERSPECTIVE = 1500;

/**
 * A floating card's film, as a small muted looping video. It shows its poster until the gallery's loop
 * starts it: only the cards nearest the front play (orbit.playing in content/gallery.ts), so each loads
 * when it first comes round.
 */
function OrbitVideo({ src, poster }: { src: string; poster: string }) {
  return <video data-orbit-video src={src} poster={poster} muted loop playsInline preload="none" aria-hidden="true" className="h-full w-full object-cover" />;
}



/**
 * The project's picture. `live`: the film plays and video runs; otherwise it holds still.
 * `orbit`: a floating card, which plays the film's recording rather than the coded film itself.
 */
function Art({ item, live, sizes, orbit = false }: { item: GalleryItem; live: boolean; sizes: string; orbit?: boolean }) {
  const pos = item.focus ? { objectPosition: item.focus } : undefined;
  const m = item.media;
  if (orbit && !m && item.loop) return <OrbitVideo src={item.loop.src} poster={item.loop.poster} />;
  if (m?.type === "video") {
    return live ? (
      <video src={m.src} poster={m.poster} muted loop playsInline autoPlay aria-label={m.alt} className="h-full w-full object-cover" style={pos} />
    ) : (
      <Image src={m.poster} alt={m.alt} fill sizes={sizes} className="object-cover" style={pos} draggable={false} />
    );
  }
  if (m?.type === "image") return <Image src={m.src} alt={m.alt} fill sizes={sizes} className="object-cover" style={pos} draggable={false} />;
  if (item.mockup) return <DeviceMockup mockup={item.mockup} label={item.title} covered={!live} />;
  if (item.cover) return <Image src={item.cover} alt={item.coverAlt} fill sizes={sizes} className="object-cover" style={pos} draggable={false} />;
  return <PlaceholderShot kind={item.kind} tint={item.tint} label={item.title} className="h-full w-full" />;
}

type Body = { x: number; y: number; z: number; s: number; o: number; vx: number; vy: number; vz: number; vs: number; blur: number };

/** Sizes that depend on the stage: the centre card's width and the floating cards' base width */
function measure(w: number, h: number, aspect: number) {
  const phone = w < 640;
  return {
    phone,
    feature: Math.round(phone ? Math.min(w * 0.58, 280) : Math.min(G.cards.featureWidth, w * 0.3, h * 0.5 * aspect)),
    orbit: Math.round(w * G.cards.size * (phone ? 2 : 1)),
    centerY: -h * (phone ? 0.14 : 0.06),
  };
}

/**
 * The Projects page as a spatial gallery: one project large in the centre, the rest floating round it in 3D.
 * Settings (layout, entrance, orbit, look) live in content/gallery.ts.
 * - Arrival: the cards come out of the centre (Spiral), the distance (Depth) or the sides (Curtain), staggered.
 * - Idle: the arrangement turns slowly and every card bobs a little. Far cards are smaller, fainter and soft.
 * - Drag (or swipe) turns it; let go and it carries on, slowing to the idle pace. Grab it again to stop it.
 * - Hover or focus a card: it lifts and sharpens and the turning slows, so it's easy to hit.
 * - Click a card, or press the arrow keys: it flies from where it was into the centre, and the old centre
 *   drifts out to take its place. Every card is on a spring, so a change can be interrupted at any point.
 * - Click the centre: the lightbox grows out of it, plays the film and links to the project.
 * Reduced motion (OS or the site's Stop motion button): no arrival, no turning or floating; changes crossfade.
 *
 * Built in two layers: the floating cards, each playing its film, with depth projected in 2D (cheap to draw);
 * and the centre project on a layer in front, where nothing can ever cover it.
 * Only transform and opacity move, from one animation frame loop that stops off screen or in a hidden tab.
 */
export function SpatialGallery({ items, start = 0 }: { items: GalleryItem[]; start?: number }) {
  const reduce = useReducedMotion();
  const n = items.length;
  const [center, setCenter] = useState(start);
  const [said, setSaid] = useState("");
  const [box, setBox] = useState<{ from: DOMRect } | null>(null);
  // The floating cards' videos start with the arrival and stop while the gallery is off screen
  const [rolling, setRolling] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [size, setSize] = useState({ w: 1200, h: 760 });

  const stage = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const feature = useRef<HTMLDivElement>(null);
  const featureButton = useRef<HTMLButtonElement>(null);
  /** Where the new centre card was on screen when it was picked: the centre flies in from there */
  const flyFrom = useRef<DOMRect | null>(null);
  // Which card sits in which orbit slot. The old centre takes the slot of the card that replaced it
  const slots = useRef(items.map((_, i) => i).filter((i) => i !== start));
  // Layout and entrance come from content/gallery.ts. In development only, ?layout=atom&entrance=curtain previews others
  const [look, setLook] = useState<{ layout: GalleryLayout; entrance: GalleryEntrance }>({ layout: G.layout, entrance: G.entrance });
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const q = new URLSearchParams(location.search);
    const layout = q.get("layout") as GalleryLayout | null;
    const entrance = q.get("entrance") as GalleryEntrance | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (layout || entrance) setLook({ layout: layout ?? G.layout, entrance: entrance ?? G.entrance });
  }, []);
  const live = useRef({ center: start, reduce, hover: -1, size, videos: false });
  useLayoutEffect(() => {
    live.current.center = center;
    live.current.reduce = reduce;
    live.current.size = size;
    live.current.videos = rolling && onScreen && !box && !reduce;
  });

  // Stage size → every measurement in the scene
  useEffect(() => {
    const el = stage.current!;
    const ro = new ResizeObserver(([e]) => setSize({ w: e!.contentRect.width, h: e!.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const item = items[center]!;
  const M = measure(size.w, size.h, item.aspect);
  const featureH = M.feature / item.aspect;

  // Off screen, behind the lightbox or with motion stopped: every card video stops (the loop, which starts
  // the front ones, doesn't run while the gallery is off screen, so it can't be the one to stop them)
  const videosOn = rolling && onScreen && !box && !reduce;
  useEffect(() => {
    if (videosOn) return;
    stage.current?.querySelectorAll<HTMLVideoElement>("video[data-orbit-video]").forEach((v) => v.pause());
  }, [videosOn]);

  // The centre changed: fly the centre card in from where the picked card was
  useLayoutEffect(() => {
    const from = flyFrom.current;
    const el = feature.current;
    flyFrom.current = null;
    if (!from || !el) return;
    if (reduce) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration.base * 1000, easing: "ease" });
      return;
    }
    const to = el.getBoundingClientRect();
    el.animate(
      [
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`, opacity: 0.6 },
        { transform: "none", opacity: 1 },
      ],
      { duration: duration.deliberate * 1000, easing: bezier(ease.emphasized) },
    );
  }, [center, reduce]);

  // The animation loop
  useEffect(() => {
    const stageEl = stage.current!;
    let raf = 0;
    let last = 0;
    let shown = false;
    let begun = -1; // when the arrival started
    let arrived = false;
    let angle = 0;
    let fling = 0; // rad/s left over from a drag
    let slowdown = 1;
    let lastPick = 0;
    const bodies: Body[] = items.map(() => ({ x: 0, y: 0, z: 0, s: 1, o: 0, vx: 0, vy: 0, vz: 0, vs: 0, blur: -1 }));

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.034, last ? (now - last) / 1000 : 0.016);
      last = now;
      const { center: c, reduce: still, hover, size: sz } = live.current;
      const me = measure(sz.w, sz.h, items[c]!.aspect);
      const S: Space = { w: sz.w, h: sz.h, r: sz.w * (me.phone ? 0.44 : 0.4) * G.orbit.spacing, d: (me.phone ? 260 : 700) * G.orbit.depth };
      if (begun < 0) {
        // On a fresh page load the arrival waits for the intro curtain to lift, so it isn't played unseen
        if (document.documentElement.dataset.intro === "play") return;
        begun = now;
        setRolling(true);
      }
      const t = (now - begun) / 1000;

      // Turning: the idle pace (slower while a card is hovered), plus whatever a drag left behind
      slowdown += ((hover >= 0 ? 0.2 : 1) - slowdown) * (1 - Math.exp(-dt * 6));
      if (!still) {
        angle += (G.orbit.speed * DEG * G.orbit.direction * slowdown + fling) * dt;
        fling *= Math.exp(-dt * 2.2);
      } else fling = 0;

      // The centre card's own arrival: a fade and a slight grow, first of all
      const fp = still ? 1 : Math.min(1, Math.max(0, t / duration.scene));
      if (!arrived && feature.current) {
        const e = 1 - Math.pow(1 - fp, 3);
        feature.current.style.opacity = e.toFixed(3);
        feature.current.style.transform = fp < 1 ? `scale(${(0.94 + 0.06 * e).toFixed(4)})` : "";
        if (fp >= 1) arrived = true;
      }

      const m = slots.current.length;
      const fade = 1 - Math.exp(-dt / duration.quick);

      // Four times a second: the cards nearest the front play their video, the rest hold their frame
      if (now - lastPick > 250) {
        lastPick = now;
        const n = me.phone ? G.orbit.playing.phone : G.orbit.playing.wide;
        const front = new Set(
          bodies
            .map((b, i) => [i, b.z] as const)
            .filter(([i]) => i !== c)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(([i]) => i),
        );
        cards.current.forEach((el, i) => {
          const v = el?.querySelector<HTMLVideoElement>("video[data-orbit-video]");
          if (!v) return;
          const go = live.current.videos && front.has(i);
          if (go && v.paused) v.play().catch(() => {});
          else if (!go && !v.paused) v.pause();
        });
      }
      items.forEach((item, i) => {
        const el = cards.current[i];
        if (!el) return;
        const b = bodies[i]!;
        const isCenter = i === c;
        const k = slots.current.indexOf(i);
        const base = me.orbit * item.size;
        let to: Point;
        let scale = 1;
        let target = 1;
        if (isCenter) {
          // Kept in the middle, the size of the centre card and unseen, so it rises from there when it next goes out
          to = { x: 0, y: me.centerY, z: 0 };
          scale = me.feature / base;
          target = 0;
        } else {
          to = place(look.layout, k, m, angle, S);
          // The arrangement circles the centre card, not the middle of the stage
          to.y += me.centerY;
          // Depth cues: far cards fade (and, below, go soft)
          target = Math.min(1, Math.max(0.35, 0.45 + (0.55 * (to.z + S.d)) / (S.d * 1.15)));
        }
        if (!still && G.orbit.float) to.y += Math.sin(t * 0.8 + i * 1.7) * G.orbit.float * 0.8;
        if (i === hover && !isCenter) {
          scale = 1.12;
          to.z += S.d * 0.1;
          target = 1;
        }

        // Arrival: each card follows its entrance path, then the spring takes over from where it lands
        const delay = (k + 1) * stagger * 1.6 + duration.quick;
        const raw = still || isCenter ? 1 : Math.min(1, Math.max(0, (t - delay) / (duration.scene * 1.4)));
        if (raw < 1) {
          const p = 1 - Math.pow(1 - raw, 3);
          const e = enter(look.entrance, p, to, S);
          Object.assign(b, { x: e.x, y: e.y, z: e.z, s: e.s, o: e.o * target, vx: 0, vy: 0, vz: 0, vs: 0 });
        } else if (still) {
          Object.assign(b, { ...to, s: scale, o: target, vx: 0, vy: 0, vz: 0, vs: 0 });
        } else {
          // A wrap round the edge of the field jumps rather than sweeping back across the screen
          if (Math.abs(to.x - b.x) > S.w * 0.6) b.x = to.x;
          const step = (x: number, v: number, goal: number) => {
            const a = OMEGA * OMEGA * (goal - x) - 2 * OMEGA * v;
            const nv = v + a * dt;
            return [x + nv * dt, nv] as const;
          };
          [b.x, b.vx] = step(b.x, b.vx, to.x);
          [b.y, b.vy] = step(b.y, b.vy, to.y);
          [b.z, b.vz] = step(b.z, b.vz, to.z);
          [b.s, b.vs] = step(b.s, b.vs, scale);
          b.o += (target - b.o) * fade;
        }

        // Only the farthest cards go soft, and the blur switches on or off rather than animating: a blurred
        // card is redrawn every frame it moves, so the fewer the better (none on phones)
        const soft = me.phone || still || !G.cards.blur || isCenter || i === hover || b.z > -S.d * 0.75 ? 0 : G.cards.blur;
        if (soft !== b.blur) {
          b.blur = soft;
          el.style.filter = soft ? `blur(${soft}px)` : "";
        }
        // Depth is drawn in 2D: each card is projected (nearer is bigger and further out) and stacked by
        // distance. Far cheaper than a real 3D scene, which matters with a film playing in every card
        const f = PERSPECTIVE / (PERSPECTIVE - Math.min(b.z, PERSPECTIVE * 0.8));
        const px = b.x * f;
        const py = me.centerY + (b.y - me.centerY) * f;
        el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) scale(${(b.s * f).toFixed(4)})`;
        const zi = String(Math.round(b.z) + 2000);
        if (el.style.zIndex !== zi) el.style.zIndex = zi;
        el.style.opacity = b.o.toFixed(3);
        el.style.visibility = b.o < 0.01 ? "hidden" : "";
      });
    };

    const run = () => {
      const go = shown && !document.hidden;
      if (go && !raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      } else if (!go && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const io = new IntersectionObserver(([e]) => {
      shown = !!e?.isIntersecting;
      setOnScreen(shown);
      run();
    });
    io.observe(stageEl);
    document.addEventListener("visibilitychange", run);

    // Drag: turns the arrangement, and lets go with momentum
    const drag = { id: -1, x0: 0, lx: 0, lt: 0, v: 0, moved: false };
    const sign = look.layout === "field" ? 1 : -1;
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest("[data-no-drag]")) return;
      Object.assign(drag, { id: e.pointerId, x0: e.clientX, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false });
      fling = 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.lx;
      if (!drag.moved && Math.abs(e.clientX - drag.x0) > 6) {
        drag.moved = true;
        stageEl.setPointerCapture(e.pointerId);
        stageEl.dataset.dragging = "";
      }
      if (!drag.moved) return;
      const perPx = (TAU / (live.current.size.w * 1.2)) * sign;
      angle += dx * perPx;
      const dtm = Math.max(1, e.timeStamp - drag.lt) / 1000;
      drag.v = drag.v * 0.6 + ((dx * perPx) / dtm) * 0.4;
      drag.lx = e.clientX;
      drag.lt = e.timeStamp;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return;
      drag.id = -1;
      if (drag.moved) {
        fling = live.current.reduce ? 0 : Math.max(-6, Math.min(6, drag.v));
        delete stageEl.dataset.dragging;
        // The click that ends a drag doesn't select anything
        const stop = (ev: Event) => ev.stopPropagation();
        stageEl.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => stageEl.removeEventListener("click", stop, { capture: true }), 0);
      }
    };
    stageEl.addEventListener("pointerdown", down);
    stageEl.addEventListener("pointermove", move);
    stageEl.addEventListener("pointerup", up);
    stageEl.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", run);
      stageEl.removeEventListener("pointerdown", down);
      stageEl.removeEventListener("pointermove", move);
      stageEl.removeEventListener("pointerup", up);
      stageEl.removeEventListener("pointercancel", up);
    };
  }, [items, look]);

  const select = useCallback(
    (i: number) => {
      const c = live.current.center;
      if (i === c) return;
      const k = slots.current.indexOf(i);
      if (k >= 0) slots.current[k] = c;
      flyFrom.current = cards.current[i]?.getBoundingClientRect() ?? null;
      live.current.hover = -1;
      setCenter(i);
      setSaid(`${items[i]!.title}, ${i + 1} of ${n}`);
    },
    [items, n],
  );
  const step = (d: number) => select((live.current.center + d + n) % n);

  const capTop = size.h / 2 + M.centerY + featureH / 2 + 18;

  return (
    <>
      <section
        ref={stage}
        aria-roledescription="gallery"
        aria-label="Projects"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            step(e.key === "ArrowRight" ? 1 : -1);
          }
        }}
        className="gallery-stage"
        style={{ "--card-radius": `${G.cards.radius}px`, "--card-shadow": G.cards.shadow } as React.CSSProperties}
      >
        {/* The floating cards, in 3D */}
        <div className="gallery-world">
          <ul className="contents">
            {items.map((it, i) => {
              if (i === center) {
                // Present but unseen: it stays in the middle, ready to drift out when another takes its place
                return (
                  <li key={it.id} ref={(el) => void (cards.current[i] = el)} aria-hidden="true" className="gallery-card" style={cardBox(M.orbit * it.size, it.aspect)}>
                    <span className="gallery-card-button">
                      <span className="gallery-card-art">
                        <Art item={it} live={false} orbit sizes={`${Math.round(M.orbit * it.size * 1.2)}px`} />
                      </span>
                    </span>
                  </li>
                );
              }
              return (
                <li key={it.id} ref={(el) => void (cards.current[i] = el)} className="gallery-card" style={cardBox(M.orbit * it.size, it.aspect)}>
                  <button
                    type="button"
                    aria-label={`Bring ${it.title} to the centre`}
                    onPointerEnter={() => (live.current.hover = i)}
                    onPointerLeave={() => live.current.hover === i && (live.current.hover = -1)}
                    onFocus={() => (live.current.hover = i)}
                    onBlur={() => live.current.hover === i && (live.current.hover = -1)}
                    onClick={() => select(i)}
                    className="gallery-card-button gallery-card-small"
                  >
                    <span className="gallery-card-art">
                      <Art item={it} live={rolling && onScreen && !box && !reduce} orbit sizes={`${Math.round(M.orbit * it.size * 1.2)}px`} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* The centre project, on its own layer in front */}
        <div
          ref={feature}
          className="gallery-feature"
          style={{ width: M.feature, height: featureH, marginLeft: -M.feature / 2, marginTop: -featureH / 2 + M.centerY, opacity: 0 }}
        >
          <div className="gallery-float h-full w-full" data-still={reduce || !G.orbit.float ? "" : undefined} style={{ "--float": `${G.orbit.float}px` } as React.CSSProperties}>
            <button
              ref={featureButton}
              type="button"
              aria-label={`Open ${item.title}`}
              onClick={(e) => setBox({ from: e.currentTarget.getBoundingClientRect() })}
              className="gallery-card-button"
            >
              <span className="gallery-card-art">
                <Art key={item.id} item={item} live={!box} sizes={`${M.feature}px`} />
              </span>
            </button>
          </div>
        </div>

        {/* The centre project's name, under it */}
        <div className="gallery-caption pointer-events-none absolute inset-x-4 text-center" style={{ top: capTop }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: tween("quick", "exit") }}
              transition={tween("base")}
            >
              <p className="leading-tight font-semibold tracking-[-0.02em]" style={{ fontFamily: G.type.titleFont, fontSize: G.type.titleSize, color: G.type.titleColor }}>
                {item.title}
                {item.year ? <span className="ml-2 align-middle text-small font-normal tracking-normal" style={{ color: G.type.captionColor }}>© {item.year}</span> : null}
              </p>
              <p className="mx-auto mt-1 max-w-[40ch] text-small" style={{ color: G.type.captionColor }}>
                {item.caption}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="sr-only" aria-live="polite">
          {said}
        </p>
      </section>

      {box ? <Lightbox item={item} from={box.from} reduce={reduce} onClose={() => setBox(null)} centerEl={() => featureButton.current} /> : null}
    </>
  );
}

/** A floating card's box: its own size, centred on the stage's middle */
const cardBox = (w: number, aspect: number): React.CSSProperties => ({
  width: w,
  height: w / aspect,
  marginLeft: -w / 2,
  marginTop: -w / aspect / 2,
  opacity: 0,
});

/**
 * The centre card, opened up: it grows from the card into the middle of the screen (and shrinks back
 * into it on close), with the title, a line about it and the way through to the project.
 * Escape, the close button or a click on the backdrop closes it; focus goes back to the card.
 */
function Lightbox({ item, from, reduce, onClose, centerEl }: { item: GalleryItem; from: DOMRect; reduce: boolean; onClose: () => void; centerEl: () => HTMLElement | null }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  // Big as the screen allows, leaving room for the panel under it
  const lbWidth = `min(92vw, calc((100svh - 260px) * ${item.aspect}), 1040px)`;

  const flip = (rect: DOMRect, to: DOMRect) => {
    const s = rect.width / to.width;
    return `translate(${rect.left - to.left}px, ${rect.top - to.top}px) scale(${s})`;
  };

  useLayoutEffect(() => {
    const d = dialog.current!;
    d.showModal();
    // Focus starts on Close (autoFocus fires before the dialog is open, so it is set here)
    d.querySelector<HTMLButtonElement>(".gallery-lightbox-close")?.focus();
    const to = art.current!.getBoundingClientRect();
    if (reduce) {
      d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration.base * 1000, easing: "ease" });
      return;
    }
    art.current!.animate([{ transform: flip(from, to), borderRadius: `${G.cards.radius}px` }, { transform: "none" }], {
      duration: duration.deliberate * 1000,
      easing: bezier(ease.emphasized),
    });
    info.current!.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], {
      duration: duration.base * 1000,
      delay: duration.quick * 1000,
      easing: bezier(ease.enter),
      fill: "backwards",
    });
  }, [from, reduce]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const d = dialog.current!;
    const target = centerEl()?.getBoundingClientRect();
    const done = () => {
      d.close();
      onClose();
    };
    if (reduce || !target) {
      d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: duration.quick * 1000, easing: "ease" }).finished.then(done, done);
      return;
    }
    const to = art.current!.getBoundingClientRect();
    info.current!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: duration.instant * 1000, fill: "forwards" });
    d.classList.add("gallery-lightbox-out");
    art.current!.animate([{ transform: "none" }, { transform: flip(target, to) }], {
      duration: duration.base * 1000,
      easing: bezier(ease.standard),
      fill: "forwards",
    }).finished.then(done, done);
  };

  return (
    <dialog
      ref={dialog}
      aria-label={item.title}
      className="gallery-lightbox"
      style={{ "--lb-backdrop": G.lightbox.backdrop, "--lb-blur": `${G.lightbox.blur}px`, "--lb-radius": `${G.lightbox.radius}px`, "--lb-panel": G.lightbox.panel } as React.CSSProperties}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="gallery-lightbox-body" onClick={(e) => e.target === e.currentTarget && close()}>
        <div ref={art} className="gallery-lightbox-art" style={{ aspectRatio: item.aspect, width: lbWidth }}>
          <Art item={item} live sizes="1040px" />
        </div>
        <div ref={info} className="gallery-lightbox-info" style={{ width: lbWidth }}>
          <div className="min-w-0">
            <p className="font-display text-h3 leading-tight font-semibold">
              {item.title}
              {item.year ? <span className="ml-2 align-middle text-small font-normal text-ink-3">© {item.year}</span> : null}
            </p>
            <p className="mt-1 max-w-[60ch] text-small text-ink-2">{item.summary}</p>
          </div>
          {item.href ? (
            <Link href={item.href} transitionTypes={["nav-forward"]} className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-small font-medium text-paper hover:opacity-90">
              View project
              <ArrowUpRight />
            </Link>
          ) : null}
        </div>
      </div>
      <button type="button" onClick={close} aria-label="Close" className="gallery-lightbox-close pressable">
        <CloseIcon />
      </button>
    </dialog>
  );
}
