"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";

export type DotGridProps = {
  /** CSS colour for the dots. Defaults to the ink token, so it follows the theme */
  color?: string;
  /** Dot radius, 1–12px */
  size?: number;
  /** Grid spacing, 12–80px */
  spacing?: number;
  /** Off: dots under the cursor only grow and brighten */
  orbit?: boolean;
  /** Radians per second around each dot's orbit */
  speed?: number;
  /** How far the cursor's pull reaches, 20–400px */
  radius?: number;
  /** How much a dot grows at the centre of the pull */
  scale?: number;
  /** Resting dot opacity; dots under the cursor go to full */
  rest?: number;
};

const TAU = Math.PI * 2;
/** Time constants (s) for dots joining and leaving the orbit: in is quick, out winds down */
const PULL_IN = 0.12;
const LET_GO = 0.55;

type Dot = { hx: number; hy: number; inc: number; asc: number; phase: number; pull: number };

/**
 * Hero background: a dot grid on a canvas. Near the cursor, dots leave the
 * grid and orbit it like electrons, each in its own tilted plane (an
 * inclination, a rotation of that plane around the view axis, and a start
 * phase, all fixed per dot). One global clock drives every orbit at the
 * same speed, so the cursor only decides which dots are pulled in, never
 * how fast they go. Leaving lets them wind back to the grid.
 *
 * Canvas at device pixel ratio, rebuilt by ResizeObserver, colour re-read
 * when the theme changes. The loop only runs while something is moving.
 * Reduced motion: no orbit; dots near the cursor grow and brighten in place.
 */
export function DotGrid({
  color,
  size = 1.1,
  spacing = 24,
  orbit = true,
  speed = 1.8,
  radius = 130,
  scale = 2.2,
  rest = 0.3,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let rgb = "236,238,241";
    let raf = 0;
    let last = 0;
    let clock = 0;
    const cursor = { x: 0, y: 0, inside: false };
    const spin = orbit && !reduce;

    const readColor = () => {
      canvas.style.color = color ?? "";
      const m = getComputedStyle(canvas).color.match(/[\d.]+/g);
      if (m) rgb = m.slice(0, 3).join(",");
    };

    const build = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Centre the grid so the margins match on both sides
      const ox = (w % spacing) / 2 + spacing / 2;
      const oy = (h % spacing) / 2 + spacing / 2;
      // Seeded so every dot keeps the same orbit across rebuilds
      let seed = 7;
      const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      dots = [];
      for (let y = oy; y < h; y += spacing) {
        for (let x = ox; x < w; x += spacing) {
          dots.push({ hx: x, hy: y, inc: 0.25 + rand() * 1.15, asc: rand() * TAU, phase: rand() * TAU, pull: 0 });
        }
      }
      draw(0);
    };

    const draw = (dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      let moving = false;
      const kIn = dt > 0 ? 1 - Math.exp(-dt / PULL_IN) : 1;
      const kOut = dt > 0 ? 1 - Math.exp(-dt / LET_GO) : 1;

      for (const d of dots) {
        const dx = d.hx - cursor.x;
        const dy = d.hy - cursor.y;
        const dist = Math.hypot(dx, dy);
        // Smooth falloff: full at the centre, none at the edge of the radius
        let target = 0;
        if (cursor.inside && dist < radius) {
          const t = 1 - dist / radius;
          target = t * t * (3 - 2 * t);
        }
        d.pull += (target - d.pull) * (target > d.pull ? kIn : kOut);
        if (d.pull < 0.002) d.pull = 0;

        let x = d.hx;
        let y = d.hy;
        let depth = 0;
        if (d.pull > 0) {
          moving = true;
          if (spin) {
            // Orbit the cursor at roughly the dot's own distance, in its own tilted plane
            const r = Math.max(dist, spacing * 0.6) * 0.85;
            const th = clock * speed + d.phase;
            const px = r * Math.cos(th);
            const py = r * Math.sin(th) * Math.cos(d.inc);
            depth = Math.sin(th) * Math.sin(d.inc); // -1 (behind) .. 1 (in front)
            const ox = cursor.x + px * Math.cos(d.asc) - py * Math.sin(d.asc);
            const oy = cursor.y + px * Math.sin(d.asc) + py * Math.cos(d.asc);
            x += (ox - x) * d.pull;
            y += (oy - y) * d.pull;
          }
        }

        const grow = 1 + (scale - 1) * d.pull;
        const s = size * grow * (1 + depth * 0.35 * d.pull);
        const a = Math.min(1, rest + (1 - rest) * d.pull * (0.75 + depth * 0.25));
        ctx.fillStyle = `rgba(${rgb},${a.toFixed(3)})`;
        if (s <= 1.6) {
          ctx.fillRect(x - s, y - s, s * 2, s * 2);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, s, 0, TAU);
          ctx.fill();
        }
      }
      return moving;
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(now - last, 40) / 1000;
      last = now;
      clock += dt;
      const moving = draw(dt);
      if (moving || cursor.inside) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (raf || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      if (!inside && !cursor.inside) return;
      cursor.inside = inside;
      if (inside) {
        cursor.x = x;
        cursor.y = y;
      }
      wake();
    };
    const onLeave = () => {
      cursor.inside = false;
      wake();
    };

    readColor();
    build();
    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    // Theme switches change the token behind the colour: re-read it, no remount
    const mo = new MutationObserver(() => {
      readColor();
      draw(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [color, size, spacing, orbit, speed, radius, scale, rest, reduce]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0 -z-10 h-full w-full text-ink"
      />
      {/* Blur layer over the top edge: the grid comes into focus as it fades in */}
      <div aria-hidden="true" className="dot-grid-blur pointer-events-none absolute inset-x-0 top-0 -z-10 h-[56px]" />
    </>
  );
}
