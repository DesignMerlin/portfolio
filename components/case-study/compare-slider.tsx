"use client";

import { useRef, useState } from "react";
import { PlaceholderShot, type PlaceholderKind } from "@/components/ui/placeholder-shot";

/**
 * Before/after by direct manipulation. Drag anywhere on the image (pointer
 * captured, so the drag survives leaving the frame), or focus the handle and
 * use arrow keys. The top layer is clipped with clip-path, which is
 * composited, so dragging never triggers layout.
 */
export function CompareSlider({
  before,
  after,
  tint = "#4b37d6",
  kind = "mobile",
  ratio = "16 / 10",
}: {
  before: string;
  after: string;
  tint?: string;
  kind?: PlaceholderKind;
  ratio?: string;
}) {
  const [pos, setPos] = useState(50);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fromPointer = (x: number) => {
    const rect = frame.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100)));
  };

  return (
    <figure className="my-10 lg:-mr-[12%]">
      <div
        ref={frame}
        className="relative touch-pan-y overflow-hidden rounded-[var(--radius-l)] border border-line select-none"
        style={{ aspectRatio: ratio }}
        onPointerDown={(e) => {
          if (dragging.current) return; // ignore a second finger
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <PlaceholderShot kind="wireframe" tint={tint} label={before} className="absolute inset-0" showBadge={false} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <PlaceholderShot kind={kind} tint={tint} label={after} className="absolute inset-0" showBadge={false} />
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-surface/85 px-2.5 py-0.5 text-micro text-ink-2 backdrop-blur">
          Before
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-surface/85 px-2.5 py-0.5 text-micro text-ink-2 backdrop-blur">
          After
        </span>
        <div className="absolute inset-y-0 w-px bg-ink/70" style={{ left: `${pos}%` }}>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Compare before and after"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}% showing the earlier version`}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 10 : 2;
              if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - step));
              else if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + step));
              else if (e.key === "Home") setPos(0);
              else if (e.key === "End") setPos(100);
              else return;
              e.preventDefault();
            }}
            className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full border border-line bg-surface shadow-[var(--shadow-float)]"
          >
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="text-ink-2">
              <path d="M5 1 1 5l4 4M13 1l4 4-4 4" />
            </svg>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex justify-between gap-4 text-small text-ink-2">
        <span>{before}</span>
        <span className="text-right">{after}</span>
      </figcaption>
    </figure>
  );
}
