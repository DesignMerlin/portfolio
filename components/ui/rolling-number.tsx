"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";

const noop = () => () => {};
/** Each digit rolls through one full turn of 0–9 before landing, so even a "1" reads as a count */
const STRIP = [..."01234567890123456789"];

/**
 * A number that rolls into place like an odometer. Every digit in `value` is
 * a column that spins up from 0 and settles on its digit, left to right on
 * the shared stagger; everything else ($, %, +, words) stays still. Plays
 * once when it scrolls into view, or whenever `play` turns true if given
 * (and resets, out of sight, when it turns false).
 *
 * Transforms only. The final value is in the DOM before hydration and for
 * screen readers at all times, so nothing depends on the animation.
 * Reduced motion: no roll; the number fades in.
 */
export function RollingNumber({ value, play, className }: { value: string; play?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  const controlled = play !== undefined;

  useEffect(() => {
    if (controlled || seen) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [controlled, seen]);

  const playing = controlled ? play : seen;
  // Before hydration everything sits at its final value; after, it waits at 0 until it plays
  const settled = !mounted || playing;

  if (reduce) {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          opacity: settled ? 1 : 0,
          transition: settled ? "opacity var(--dur-base) var(--ease-enter)" : undefined,
        }}
      >
        {value}
      </span>
    );
  }

  let column = 0;
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {[...value].map((ch, i) => {
          if (ch < "0" || ch > "9") return <span key={i}>{ch}</span>;
          const end = 10 + Number(ch);
          const style: CSSProperties = {
            transform: `translateY(${(-(settled ? end : 0) * 100) / STRIP.length}%)`,
            // Only the roll in is animated; resetting to 0 is instant
            transition: settled && mounted
              ? `transform var(--dur-scene) var(--ease-emphasized) calc(var(--stagger) * ${column++})`
              : undefined,
          };
          return (
            // A little headroom (cancelled by negative margin) so tight display leading doesn't clip glyphs; edges fade
            <span key={i} className="rolling-digit relative -my-[0.15em] inline-block overflow-hidden py-[0.15em] align-bottom">
              <span className="invisible">{ch}</span>
              <span className="absolute inset-x-0 top-0 flex flex-col text-center will-change-transform" style={style}>
                {STRIP.map((d, j) => (
                  <span key={j} className="py-[0.15em]">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
