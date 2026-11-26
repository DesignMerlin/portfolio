"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { spring, tween } from "@/lib/motion";

type View = "gallery" | "list";
const KEY = "projects-view";
const VIEWS: { id: View; label: string }[] = [
  { id: "gallery", label: "Gallery" },
  { id: "list", label: "List" },
];

/**
 * Gallery or List, side by side in one switch. The pill slides to the choice (snappy spring) and the
 * views crossfade. The choice is remembered on this device. Only the shown view is mounted, so the
 * gallery's films and animation loop don't run behind the list.
 */
export function ProjectsViews({ gallery, list }: { gallery: React.ReactNode; list: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>("gallery");
  useEffect(() => {
    try {
      // Reading the remembered view after hydration, so the server and first client render agree
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(KEY) === "list") setView("list");
    } catch {}
  }, []);
  const choose = (v: View) => {
    setView(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  };

  return (
    <>
      <div role="group" aria-label="View projects as" className="mt-8 inline-flex rounded-full border border-line p-1">
        {VIEWS.map((v) => {
          const active = view === v.id;
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={active}
              onClick={() => choose(v.id)}
              className={`pressable relative rounded-full px-4 py-1.5 text-small transition-colors duration-[var(--dur-quick)] ${active ? "text-paper" : "text-ink-2 hover:text-ink"}`}
            >
              {active ? <motion.span layoutId="projects-view" transition={reduce ? { duration: 0 } : spring.snappy} className="absolute inset-0 rounded-full bg-ink" /> : null}
              <span className="relative">{v.label}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: tween("quick", "exit") }} transition={tween("base")}>
          {view === "gallery" ? <div className="mt-6">{gallery}</div> : list}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
