"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, ReplayIcon } from "@/components/ui/icons";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { pileThemes, type PileThemeName } from "@/content/tag-pile";
import type { Entrance, PileSettings } from "@/components/home/tag-pile/settings";
import { tween } from "@/lib/motion";

const sliders: { key: "gravity" | "bounce" | "friction" | "throwStrength"; label: string; min: number; max: number; step: number }[] = [
  { key: "gravity", label: "Gravity", min: 0, max: 2.5, step: 0.05 },
  { key: "bounce", label: "Bounce", min: 0, max: 0.95, step: 0.05 },
  { key: "friction", label: "Friction", min: 0, max: 1, step: 0.05 },
  { key: "throwStrength", label: "Throw strength", min: 0.3, max: 3, step: 0.1 },
];

const entrances: { id: Entrance; label: string }[] = [
  { id: "random", label: "Random" },
  { id: "sequence", label: "In sequence" },
  { id: "together", label: "All at once" },
];

/**
 * "Play with the pile": a small popover of physics and look controls.
 * Opens from its button (origin-aware scale), closes on Escape or outside
 * click and returns focus to the button.
 */
export function PileControls({
  settings,
  update,
  replay,
  reset,
  className = "",
}: {
  settings: PileSettings;
  update: (patch: Partial<PileSettings>) => void;
  replay: () => void;
  reset: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={root} className={`pointer-events-auto ${className || "relative"}`}>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={replay}
          className="pressable inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-small text-ink-2 backdrop-blur hover:text-ink"
        >
          <ReplayIcon />
          Drop again
        </button>
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="pressable inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-small text-ink-2 backdrop-blur hover:text-ink"
        >
          <SlidersIcon />
          Play with the pile
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={id}
            role="dialog"
            aria-label="Pile controls"
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.96)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.96)", transition: tween("instant", "exit") }}
            transition={tween("quick")}
            className="absolute top-[calc(100%+8px)] right-0 z-50 w-[min(320px,calc(100vw-32px))] origin-top-right rounded-[var(--radius-l)] border border-line bg-surface p-4 text-small text-ink shadow-[var(--shadow-float)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-medium">Play with the pile</p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => {
                  setOpen(false);
                  trigger.current?.focus();
                }}
                className="grid size-7 place-items-center rounded-full text-ink-2 hover:bg-sunken hover:text-ink"
              >
                <CloseIcon />
              </button>
            </div>

            <fieldset className="space-y-3">
              <legend className="mb-2 text-micro text-ink-3">Physics</legend>
              {sliders.map((s) => (
                <label key={s.key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
                  <span className="text-ink-2">{s.label}</span>
                  <span className="font-mono text-micro text-ink-3 tabular">{settings[s.key].toFixed(2)}</span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={settings[s.key]}
                    onChange={(e) => update({ [s.key]: Number(e.target.value) })}
                    className="col-span-2 accent-[var(--accent)]"
                  />
                </label>
              ))}
              <Toggle label="Squash on landing" checked={settings.squash} onChange={(v) => update({ squash: v })} />
            </fieldset>

            <Choice
              legend="Theme"
              value={settings.theme}
              options={(Object.keys(pileThemes) as PileThemeName[]).map((k) => ({ id: k, label: pileThemes[k].label, swatch: pileThemes[k].fills }))}
              onChange={(v) => update({ theme: v })}
            />
            <Choice legend="Entrance" value={settings.entrance} options={entrances} onChange={(v) => update({ entrance: v })} />
            <div className="mt-3">
              <Toggle
                label="Drop again when I scroll back"
                checked={settings.replayOnRevisit}
                onChange={(v) => update({ replayOnRevisit: v })}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={replay}
                className="pressable flex-1 rounded-full bg-ink px-3 py-2 text-small font-medium text-paper"
              >
                Replay
              </button>
              <button
                type="button"
                onClick={reset}
                className="pressable flex-1 rounded-full border border-line px-3 py-2 text-small text-ink-2 hover:text-ink"
              >
                Reset
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Choice<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: { id: T; label: string; swatch?: string[] }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="mb-2 text-micro text-ink-3">{legend}</legend>
      <div role="radiogroup" aria-label={legend} className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            onClick={() => onChange(o.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-micro transition-colors duration-150 ${
              value === o.id ? "border-ink bg-ink text-paper" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
            }`}
          >
            {o.swatch ? (
              <span aria-hidden="true" className="flex">
                {o.swatch.slice(0, 3).map((c, i) => (
                  <span key={c + i} className="-ml-1 size-2.5 rounded-full border border-black/10 first:ml-0" style={{ background: c }} />
                ))}
              </span>
            ) : null}
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-ink-2">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ${checked ? "bg-accent" : "bg-sunken"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform duration-[180ms] ease-[var(--ease-enter)] ${checked ? "translate-x-4" : ""}`}
        />
      </button>
    </label>
  );
}

function SlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M2.5 4.5h7M12.5 4.5h1M2.5 11.5h2M7.5 11.5h6" />
      <circle cx="11" cy="4.5" r="1.5" />
      <circle cx="6" cy="11.5" r="1.5" />
    </svg>
  );
}
