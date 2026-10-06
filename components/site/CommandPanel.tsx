"use client";

import { AnimatePresence, LazyMotion, m, MotionConfig } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { duration, ease } from "@/lib/motion";
import { site } from "@/lib/site";
import { setTheme } from "./ThemeToggle";

export type CommandItemData = { title: string; slug: string; domain: string };

type Item = {
  id: string;
  group: "Pages" | "Work" | "Actions";
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
};

// Subsequence match with bonuses for word starts and consecutive letters.
// Small and good enough for ~20 items; no dependency needed.
function score(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 1;
  let total = 0;
  let ti = 0;
  let streak = 0;
  for (const char of q) {
    const found = t.indexOf(char, ti);
    if (found === -1) return 0;
    const wordStart = found === 0 || t[found - 1] === " ";
    streak = found === ti ? streak + 1 : 0;
    total += 1 + (wordStart ? 3 : 0) + streak * 2;
    ti = found + 1;
  }
  return total - t.length * 0.01;
}

type Props = { open: boolean; onClose: () => void; work: CommandItemData[] };

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

// Motion is only needed here, so it loads with the panel (first open), never on page load.
// reducedMotion="user": with reduced motion, transforms drop out and only fades remain.
export default function CommandPanel(props: Props) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <Panel {...props} />
      </MotionConfig>
    </LazyMotion>
  );
}

function Panel({ open, onClose, work }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(open);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => {
      onClose();
      router.push(href);
    };
    return [
      { id: "home", group: "Pages", label: "Home", hint: "/", run: go("/") },
      {
        id: "about",
        group: "Pages",
        label: "About",
        hint: "/about",
        keywords: "experience contact",
        run: go("/about"),
      },
      {
        id: "lab",
        group: "Pages",
        label: "Lab",
        hint: "/lab",
        keywords: "experiments",
        run: go("/lab"),
      },
      ...work.map<Item>((project) => ({
        id: `work-${project.slug}`,
        group: "Work",
        label: project.title,
        hint: project.domain,
        keywords: "case study",
        run: go(`/work/${project.slug}`),
      })),
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: site.email,
        keywords: "contact mail hire",
        run: () => {
          navigator.clipboard?.writeText(site.email).catch(() => {});
          onClose();
        },
      },
      {
        id: "theme",
        group: "Actions",
        label: "Switch theme",
        keywords: "dark light mode",
        run: () => {
          const dark = document.documentElement.dataset.theme === "dark";
          onClose();
          setTheme(dark ? "light" : "dark");
        },
      },
    ];
  }, [work, onClose, router]);

  const results = useMemo(() => {
    if (!query.trim()) return items;
    return items
      .map((item) => ({
        item,
        s: score(query, `${item.label} ${item.keywords ?? ""} ${item.hint ?? ""}`),
      }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s)
      .map(({ item }) => item);
  }, [items, query]);

  // Open: mount, reset, show the native modal dialog (focus trap, inert page, Esc).
  // Close: let the exit animation finish, then close the dialog.
  // Reset happens while rendering (React's "adjust state on prop change" pattern).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMounted(true);
      setQuery("");
      setActive(0);
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (mounted && dialog && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    }
  }, [mounted]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const last = results.length - 1;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i >= last ? 0 : i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? last : i - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(last);
    } else if (event.key === "Enter") {
      event.preventDefault();
      results[active]?.run();
    }
  }

  // Keep the active option scrolled into view during keyboard navigation.
  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  if (!mounted) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search and jump to"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-4 pt-[12vh] backdrop:bg-transparent"
    >
      <AnimatePresence
        onExitComplete={() => {
          dialogRef.current?.close();
          setMounted(false);
        }}
      >
        {open && (
          <>
            <m.div
              key="scrim"
              aria-hidden="true"
              className="fixed inset-0 bg-[rgb(16_25_40/0.32)] backdrop-blur-[2px]"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.standard } }}
              exit={{ opacity: 0, transition: { duration: duration.quick, ease: ease.exit } }}
            />
            <m.div
              key="panel"
              className="relative mx-auto w-full max-w-[34rem] overflow-hidden rounded-lg border border-line bg-raised shadow-(--shadow-float)"
              initial={{ opacity: 0, scale: 0.98, y: -6 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: duration.base, ease: ease.enter },
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
                transition: { duration: duration.quick, ease: ease.exit },
              }}
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <svg
                  viewBox="0 0 20 20"
                  className="size-[18px] shrink-0 text-faint"
                  aria-hidden="true"
                >
                  <circle
                    cx="9"
                    cy="9"
                    r="5.75"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="m13.5 13.5 3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onKeyDown}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
                  aria-autocomplete="list"
                  placeholder="Jump to a project, page or action"
                  className="h-14 w-full bg-transparent text-base text-fg placeholder:text-faint focus:outline-none"
                />
                <kbd className="rounded-sm border border-line px-1.5 font-mono text-meta text-faint">
                  esc
                </kbd>
              </div>

              <ul
                id={listId}
                role="listbox"
                aria-label="Results"
                className="max-h-[min(22rem,55vh)] overflow-y-auto p-2"
              >
                {results.length === 0 && (
                  <li className="px-3 py-8 text-center text-sm text-muted" role="presentation">
                    Nothing matches &ldquo;{query}&rdquo;. Try a project name, or
                    &ldquo;about&rdquo;.
                  </li>
                )}
                {results.map((item, index) => {
                  const showGroup = !query.trim() && item.group !== results[index - 1]?.group;
                  return (
                    <li key={item.id} role="presentation">
                      {showGroup && (
                        <p
                          className="px-3 pt-3 pb-1.5 font-mono text-meta text-faint"
                          aria-hidden="true"
                        >
                          {item.group}
                        </p>
                      )}
                      <div
                        id={`${listId}-${index}`}
                        role="option"
                        aria-selected={index === active}
                        onPointerMove={() => setActive(index)}
                        onClick={() => item.run()}
                        className="flex cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2.5 text-fg aria-selected:bg-ink-soft aria-selected:text-ink"
                      >
                        <span className="truncate">{item.label}</span>
                        {item.hint && (
                          <span className="shrink-0 truncate font-mono text-meta text-faint">
                            {item.hint}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div
                className="flex gap-4 border-t border-line px-4 py-2.5 font-mono text-meta text-faint"
                aria-hidden="true"
              >
                <span>↑↓ move</span>
                <span>↵ open</span>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </dialog>
  );
}
