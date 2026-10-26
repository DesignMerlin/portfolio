"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, CloseIcon } from "@/components/ui/icons";
import { PlaceholderShot } from "@/components/ui/placeholder-shot";
import { spring, tween } from "@/lib/motion";
import type { Shot, ShotKind } from "@/content/shots";

type Filter = ShotKind | "all";

const noopSubscribe = () => () => {};

function Media({ shot, sizes }: { shot: Shot; sizes: string }) {
  if (shot.src) {
    return <Image src={shot.src} alt={shot.title} fill sizes={sizes} className="object-cover" draggable={false} />;
  }
  return <PlaceholderShot kind={shot.kind === "brand" ? "brand" : shot.kind} tint={shot.tint} label={shot.title} className="absolute inset-0" />;
}

/** Split into N columns, always adding to the shortest one, so the masonry stays balanced */
function toColumns(items: Shot[], n: number) {
  const cols: Shot[][] = Array.from({ length: n }, () => []);
  const heights = new Array(n).fill(0) as number[];
  for (const item of items) {
    const i = heights.indexOf(Math.min(...heights));
    cols[i]!.push(item);
    heights[i]! += 1 / item.ratio + 0.18;
  }
  return cols;
}

function useColumnCount() {
  const [n, setN] = useState(3);
  useEffect(() => {
    const queries = [matchMedia("(min-width: 1024px)"), matchMedia("(min-width: 640px)")];
    const update = () => setN(queries[0]!.matches ? 3 : queries[1]!.matches ? 2 : 1);
    update();
    queries.forEach((q) => q.addEventListener("change", update));
    return () => queries.forEach((q) => q.removeEventListener("change", update));
  }, []);
  return n;
}

/**
 * UI shots.
 * - Filters reflow the masonry: shots that stay glide to their new place
 *   (shared layout ids, so they can even change column).
 * - Opening a shot grows it out of its grid position into the lightbox;
 *   closing returns it to wherever it lives now.
 * - In the lightbox: arrow keys or swipe to move, Escape or drag down to
 *   close. A quick flick is enough; you don't have to drag far.
 */
export function ShotsGallery({ shots, filters }: { shots: Shot[]; filters: { id: Filter; label: string }[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const columns = useColumnCount();
  const opener = useRef<HTMLButtonElement | null>(null);

  const visible = useMemo(() => shots.filter((s) => filter === "all" || s.kind === filter), [shots, filter]);
  const cols = useMemo(() => toColumns(visible, columns), [visible, columns]);
  const layoutT = reduce ? { duration: 0 } : spring.gentle;

  const close = useCallback(() => {
    setOpenId(null);
    requestAnimationFrame(() => opener.current?.focus());
  }, []);

  return (
    <LayoutGroup>
      <div role="group" aria-label="Filter shots" className="flex flex-wrap gap-1.5">
        {filters.map((f) => {
          const count = f.id === "all" ? shots.length : shots.filter((s) => s.kind === f.id).length;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              className={`relative rounded-full px-4 py-2 text-small transition-colors duration-150 ${active ? "text-paper" : "text-ink-2 hover:text-ink"}`}
            >
              {active ? (
                <motion.span layoutId="shot-filter" transition={reduce ? { duration: 0 } : spring.snappy} className="absolute inset-0 rounded-full bg-ink" />
              ) : null}
              <span className="relative">
                {f.label} <span className="tabular opacity-60">{count}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} shots
      </p>

      <div className="mt-8 flex items-start gap-4 sm:gap-6">
        {cols.map((col, ci) => (
          <ul key={ci} className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
            <AnimatePresence initial={false} mode="popLayout">
              {col.map((shot) => (
                <motion.li
                  key={shot.id}
                  layoutId={`shot-card-${shot.id}`}
                  initial={{ opacity: 0, transform: reduce ? "none" : "scale(0.97)" }}
                  animate={{ opacity: 1, transform: "scale(1)" }}
                  exit={{ opacity: 0, transform: reduce ? "none" : "scale(0.97)", transition: tween("quick", "exit") }}
                  transition={layoutT}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      opener.current = e.currentTarget;
                      setOpenId(shot.id);
                    }}
                    className="group block w-full text-left"
                    aria-label={`Open ${shot.title}`}
                  >
                    <motion.div
                      layoutId={`shot-media-${shot.id}`}
                      transition={layoutT}
                      className="relative overflow-hidden rounded-[var(--radius-l)] border border-line bg-sunken"
                      style={{ aspectRatio: shot.ratio, visibility: openId === shot.id ? "hidden" : "visible" }}
                    >
                      <div className="absolute inset-0 transition-transform duration-[450ms] ease-[var(--ease-enter)] group-hover:scale-[1.025]">
                        <Media shot={shot} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                      </div>
                    </motion.div>
                    <div className="mt-3 flex items-baseline justify-between gap-3">
                      <p className="text-small font-medium text-ink">{shot.title}</p>
                      <p className="shrink-0 text-micro text-ink-3">{shot.project}</p>
                    </div>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ))}
      </div>

      <Lightbox shots={visible} openId={openId} setOpenId={setOpenId} onClose={close} />
    </LayoutGroup>
  );
}

function Lightbox({
  shots,
  openId,
  setOpenId,
  onClose,
}: {
  shots: Shot[];
  openId: string | null;
  setOpenId: (id: string) => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const index = shots.findIndex((s) => s.id === openId);
  const shot = index >= 0 ? shots[index]! : null;

  const go = useCallback(
    (delta: number) => {
      if (index < 0) return;
      setOpenId(shots[(index + delta + shots.length) % shots.length]!.id);
    },
    [index, shots, setOpenId],
  );

  useEffect(() => {
    if (!shot) return;
    const main = document.getElementById("main");
    main?.setAttribute("inert", "");
    document.documentElement.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      main?.removeAttribute("inert");
      document.documentElement.style.overflow = "";
    };
  }, [shot]);

  useEffect(() => {
    if (!shot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && panel.current) {
        // Keep focus inside the dialog
        const f = panel.current.querySelectorAll<HTMLElement>("button, a[href]");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [shot, go, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.y > 120 || velocity.y > 600) onClose();
    else if (offset.x < -80 || velocity.x < -500) go(1);
    else if (offset.x > 80 || velocity.x > 500) go(-1);
  };

  if (!mounted) return null;
  const layoutT = reduce ? { duration: 0 } : spring.gentle;

  return createPortal(
    <AnimatePresence>
      {shot ? (
        <div key="lightbox" className="fixed inset-0 z-[90]">
          <motion.div
            className="absolute inset-0 bg-paper/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: tween("quick", "exit") }}
            transition={tween("base")}
            onClick={onClose}
          />
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={shot.title}
            className="pointer-events-none relative flex h-full flex-col items-center justify-center gap-5 px-4 py-16 sm:px-10"
          >
            <motion.div
              layoutId={`shot-media-${shot.id}`}
              transition={layoutT}
              drag={!reduce}
              dragDirectionLock
              dragSnapToOrigin
              dragElastic={0.5}
              onDragEnd={onDragEnd}
              className="pointer-events-auto relative w-full touch-none overflow-hidden rounded-[var(--radius-l)] border border-line bg-sunken shadow-[var(--shadow-float)]"
              style={{ aspectRatio: shot.ratio, maxWidth: `min(1100px, calc(72svh * ${shot.ratio}))` }}
            >
              <Media shot={shot} sizes="90vw" />
            </motion.div>

            <motion.div
              className="pointer-events-auto flex w-full flex-wrap items-start justify-between gap-4"
              style={{ maxWidth: `min(1100px, calc(72svh * ${shot.ratio}))` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { ...tween("base"), delay: 0.12 } }}
              exit={{ opacity: 0, transition: tween("instant", "exit") }}
            >
              <div aria-live="polite">
                <p className="font-medium text-ink">
                  {shot.title} <span className="text-ink-3">{shot.project}</span>
                </p>
                <p className="mt-1 max-w-[60ch] text-small text-ink-2">{shot.note}</p>
                {shot.caseStudy ? (
                  <Link
                    href={`/work/${shot.caseStudy}`}
                    transitionTypes={["nav-forward"]}
                    onClick={() => onClose()}
                    className="mt-2 inline-flex items-center gap-1 text-small text-accent hover:underline"
                  >
                    Read the case study <ArrowUpRight />
                  </Link>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <span className="mr-2 font-mono text-micro text-ink-3 tabular">
                  {index + 1} / {shots.length}
                </span>
                <IconButton label="Previous shot" onClick={() => go(-1)}>
                  <ArrowLeft />
                </IconButton>
                <IconButton label="Next shot" onClick={() => go(1)}>
                  <ArrowRight />
                </IconButton>
                <IconButton label="Close" onClick={onClose} innerRef={closeBtn}>
                  <CloseIcon />
                </IconButton>
              </div>
            </motion.div>
            <p className="pointer-events-none hidden text-micro text-ink-3 sm:block">Arrow keys to browse, Esc to close</p>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function IconButton({
  label,
  onClick,
  children,
  innerRef,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  innerRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={innerRef}
      type="button"
      aria-label={label}
      onClick={onClick}
      className="pressable grid size-10 place-items-center rounded-full border border-line bg-surface text-ink transition-colors duration-150 hover:border-line-strong"
    >
      {children}
    </button>
  );
}
