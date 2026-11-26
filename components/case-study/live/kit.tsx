"use client";

import { useEffect, useRef } from "react";
import { filmSrc, play, type Frame } from "@/components/case-study/film/kit";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";

/**
 * Screens that move: a logo arriving, an hourglass turning, a tick landing, a
 * chart filling in. A scene is a list of parts placed over a screen in its own
 * points (375×812, unless it says), each with frames in seconds. The same scene runs inside a
 * film (on the film's clock), in a prototype and on the case study's screens.
 *
 * `--pt` is one point, so a scene fits whatever size its screen is shown at.
 */
export type PtBox = [x: number, y: number, w: number, h: number];

export type Sprite = {
  /** Every frame of the original animation, in a grid, left to right then down */
  src: string;
  cols: number;
  rows: number;
  frames: number;
  fps: number;
  /** Where it sits on its screen */
  box: PtBox;
};

export type Part = {
  id: string;
  box: PtBox;
  frames?: Frame[];
  /** transform-origin */
  origin?: string;
  bg?: string;
  /** Corner radius in points, or "50%" */
  r?: number | string;
  border?: string;
  /** Hide what's outside the box (or outside a clip-path) */
  clip?: boolean | string;
  /** An exact piece of a screen: what's at `sliceAt` (the box, unless it differs) */
  slice?: string;
  sliceAt?: [x: number, y: number];
  /** The slice's whole size, if it isn't the scene's */
  sliceSize?: [w: number, h: number];
  /** A file that fills the box */
  img?: string;
  sprite?: Sprite;
  /** Parts inside this one, placed in the screen's points all the same */
  parts?: Part[];
  /** Anything else. `track(name)` marks an element animated by `inner[name]` */
  node?: (track: (name: string) => { "data-track": string }) => React.ReactNode;
  inner?: Record<string, Frame[]>;
};

export type LiveScene = {
  /** Seconds. A looping scene starts again here; the rest hold their last frame */
  length: number;
  loop?: boolean;
  /** The screen's size in points: 375×812 unless set */
  size?: [w: number, h: number];
  /** Reduced motion and stills show this moment (the end, unless set) */
  still?: number;
  parts: Part[];
};

const PHONE: [number, number] = [375, 812];

export const HOLD = "steps(1, jump-end)";

/** A sprite's frames, one after another, from `t` */
export function spriteFrames(s: Sprite, t = 0): Frame[] {
  return Array.from({ length: s.frames }, (_, i): Frame => {
    const c = i % s.cols;
    const r = Math.floor(i / s.cols);
    return [t + i / s.fps, { transform: `translate(${((-100 * c) / s.cols).toFixed(3)}%, ${((-100 * r) / s.rows).toFixed(3)}%)` }, HOLD];
  });
}

const pt = (n: number) => `calc(${n} * var(--pt))`;

function tracksOf(scene: LiveScene): Record<string, Frame[]> {
  const out: Record<string, Frame[]> = {};
  const walk = (parts: Part[]) =>
    parts.forEach((p) => {
      if (p.frames) out[p.id] = p.frames;
      if (p.sprite) out[`${p.id}-sprite`] = spriteFrames(p.sprite);
      Object.entries(p.inner ?? {}).forEach(([k, f]) => (out[`${p.id}-${k}`] = f));
      if (p.parts) walk(p.parts);
    });
  walk(scene.parts);
  return out;
}

/** The scene's tracks on a film's clock, starting at `t`. A looping scene repeats until `until`. `speed` quickens it */
export function liveTracks(id: string, scene: LiveScene, t: number, until = Infinity, speed = 1): Record<string, Frame[]> {
  const out: Record<string, Frame[]> = {};
  const times = scene.loop && until < Infinity ? Math.ceil(((until - t) * speed) / scene.length) : 1;
  Object.entries(tracksOf(scene)).forEach(([k, frames]) => {
    const all: Frame[] = [];
    for (let n = 0; n < times; n++) {
      const t0 = t + (n * scene.length) / speed;
      frames.forEach(([at, s, e]) => {
        if (t0 + at / speed <= until + 0.001) all.push([t0 + at / speed, s, e]);
      });
    }
    // What it looks like before it starts
    if (all[0]![0] > 0) all.unshift([0, all[0]![1], HOLD]);
    out[`${id}-${k}`] = all;
  });
  return out;
}

/** The scene, drawn. Put it inside the screen it belongs to */
export function LiveParts({ id, scene }: { id: string; scene: LiveScene }) {
  return (
    <span className="live" aria-hidden="true">
      <span className="live-in" style={scene.size ? ({ "--pt": `calc(100cqw / ${scene.size[0]})` } as React.CSSProperties) : undefined}>
        {scene.parts.map((p) => (
          <PartView key={p.id} id={id} part={p} from={[0, 0]} size={scene.size ?? PHONE} />
        ))}
      </span>
    </span>
  );
}

function PartView({ id, part: p, from, size }: { id: string; part: Part; from: [number, number]; size: [number, number] }) {
  const [x, y, w, h] = p.box;
  const [sx, sy] = p.sliceAt ?? [x, y];
  const [sw, sh] = p.sliceSize ?? size;
  return (
    <span
      data-track={p.frames ? `${id}-${p.id}` : undefined}
      className="live-part"
      style={{
        left: pt(x - from[0]),
        top: pt(y - from[1]),
        width: pt(w),
        height: pt(h),
        transformOrigin: p.origin,
        background: p.bg,
        border: p.border,
        borderRadius: typeof p.r === "number" ? pt(p.r) : p.r,
        overflow: p.clip === true || p.slice || p.sprite ? "hidden" : undefined,
        clipPath: typeof p.clip === "string" ? p.clip : undefined,
      }}
    >
      {p.slice ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={filmSrc(p.slice)} alt="" draggable={false} style={{ left: pt(-sx), top: pt(-sy), width: pt(sw), height: pt(sh) }} />
      ) : null}
      {p.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={filmSrc(p.img)} alt="" draggable={false} style={{ left: 0, top: 0, width: "100%", height: "100%" }} />
      ) : null}
      {p.sprite ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-track={`${id}-${p.id}-sprite`}
          src={p.sprite.src}
          alt=""
          draggable={false}
          style={{ left: 0, top: 0, width: `${p.sprite.cols * 100}%`, height: `${p.sprite.rows * 100}%` }}
        />
      ) : null}
      {p.node?.((name) => ({ "data-track": `${id}-${p.id}-${name}` }))}
      {p.parts?.map((q) => <PartView key={q.id} id={id} part={q} from={[x, y]} size={size} />)}
    </span>
  );
}

/**
 * A scene over a still screen: plays when it's seen, and again each time it
 * comes back into view. `rate` slows it with the prototype's speed control.
 * Reduced motion: holds on its finished frame.
 */
export function LiveOverlay({ scene, rate = 1 }: { scene: LiveScene; rate?: number }) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLSpanElement>(null);
  const anims = useRef<Animation[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const tracks = tracksOf(scene);
    const all: Animation[] = [];
    el.querySelectorAll<HTMLElement>("[data-track]").forEach((n) => {
      const frames = tracks[n.dataset.track!.slice("live-".length)];
      if (frames) all.push(...play(n, frames, scene.length));
    });
    const end = Math.max(0, (scene.still ?? scene.length) * 1000 - 1);
    all.forEach((a) => {
      a.pause();
      a.effect!.updateTiming({ iterations: scene.loop ? Infinity : 1 });
      a.currentTime = reduce ? end : 0;
    });
    anims.current = all;
    if (reduce) return () => all.forEach((a) => a.cancel());
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        all.forEach((a) => {
          if (e.isIntersecting) {
            if (!scene.loop) a.currentTime = 0;
            a.play();
          } else a.pause();
        });
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      all.forEach((a) => a.cancel());
      anims.current = [];
    };
  }, [scene, reduce]);

  useEffect(() => {
    anims.current.forEach((a) => a.updatePlaybackRate(rate));
  }, [scene, rate, reduce]);

  return (
    <span ref={root} className="live-root">
      <LiveParts id="live" scene={scene} />
    </span>
  );
}
