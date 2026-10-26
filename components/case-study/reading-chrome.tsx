"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, CloseIcon } from "@/components/ui/icons";
import { spring, tween } from "@/lib/motion";
import type { WorkSection } from "@/lib/content";

/** Which section is being read: the last one whose top has passed the upper third of the screen */
function useActiveSection(sections: WorkSection[]) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const update = () => {
      const line = window.innerHeight * 0.33;
      let current = els[0]?.id ?? "";
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    const io = new IntersectionObserver(update, { rootMargin: "-33% 0px -60% 0px" });
    els.forEach((el) => io.observe(el));
    update();
    return () => io.disconnect();
  }, [sections]);
  return active;
}

/**
 * Reading chrome for long case studies:
 * - a scroll-linked progress line under the header (sprung, so it glides),
 * - a sticky section navigator on wide screens, with a marker that travels,
 * - on phones, a small pill that names where you are and expands into the
 *   contents (the same surface grows, so you never lose your place).
 */
export function ReadingChrome({ sections }: { sections: WorkSection[] }) {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });
  const active = useActiveSection(sections);

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-14 z-40 h-[2px] origin-left bg-accent"
        style={{ scaleX: reduce ? scrollYProgress : progress }}
      />
      <MobileContents sections={sections} active={active} />
    </>
  );
}

export function SectionNav({ sections }: { sections: WorkSection[] }) {
  const active = useActiveSection(sections);
  const reduce = useReducedMotion();
  return (
    <nav aria-label="Case study sections" className="sticky top-28">
      <p className="mb-3 text-micro text-ink-3">On this page</p>
      <ul className="relative space-y-0.5 border-l border-line">
        {sections.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id} className="relative">
              {isActive ? (
                <motion.span
                  layoutId="section-marker"
                  transition={reduce ? { duration: 0 } : spring.snappy}
                  className="absolute inset-y-1 -left-px w-[2px] rounded-full bg-accent"
                />
              ) : null}
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`block py-1.5 pl-4 text-small transition-colors duration-150 ${isActive ? "text-ink" : "text-ink-3 hover:text-ink-2"}`}
              >
                {s.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileContents({ sections, active }: { sections: WorkSection[]; active: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const trigger = useRef<HTMLButtonElement>(null);
  const index = Math.max(0, sections.findIndex((s) => s.id === active));
  const title = sections[index]?.title ?? "";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  const t = reduce ? { duration: 0 } : spring.gentle;

  return (
    <div className="fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-40 flex justify-center px-4 lg:hidden">
      <AnimatePresence initial={false} mode="popLayout">
        {open ? (
          <motion.div
            key="panel"
            layoutId="contents-surface"
            transition={t}
            className="w-full max-w-sm overflow-hidden rounded-[var(--radius-l)] border border-line bg-surface shadow-[var(--shadow-float)]"
            style={{ borderRadius: 22 }}
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { ...tween("quick"), delay: 0.08 } }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-small font-medium">Contents</p>
                <button
                  type="button"
                  aria-label="Close contents"
                  autoFocus
                  onClick={() => {
                    setOpen(false);
                    trigger.current?.focus();
                  }}
                  className="grid size-8 place-items-center rounded-full text-ink-2 hover:bg-sunken"
                >
                  <CloseIcon />
                </button>
              </div>
              <ul className="max-h-[55svh] overflow-y-auto p-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setOpen(false)}
                      className={`block rounded-[10px] px-3 py-2.5 ${s.id === active ? "bg-sunken text-ink" : "text-ink-2"}`}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        ) : (
          <motion.button
            key="pill"
            ref={trigger}
            type="button"
            layoutId="contents-surface"
            transition={t}
            onClick={() => setOpen(true)}
            aria-expanded={false}
            className="flex items-center gap-2.5 border border-line bg-surface py-2 pr-3 pl-4 text-small shadow-[var(--shadow-float)]"
            style={{ borderRadius: 999 }}
          >
            <motion.span layout="position" className="font-mono text-micro text-ink-3 tabular">
              {index + 1}/{sections.length}
            </motion.span>
            <motion.span layout="position" className="max-w-[48vw] truncate text-ink">
              {title}
            </motion.span>
            <ChevronDown className="rotate-180 text-ink-3" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
