"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { setTheme } from "@/components/ui/theme-toggle";
import { ArrowUpRight, CheckIcon, SearchIcon } from "@/components/ui/icons";
import { OPEN_COMMAND_MENU } from "@/lib/site";

type Item = {
  id: string;
  group: "Case studies" | "Pages" | "Actions";
  label: string;
  hint?: string;
  keywords?: string;
} & ({ href: string; type?: "nav-forward" | "nav-back" } | { action: "copy" | "theme" | "intro" });

/** Subsequence match with bonuses for word starts and runs. 0 means no match. */
function score(query: string, text: string) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let s = 0;
  let ti = 0;
  let run = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return 0;
    run = found === ti ? run + 1 : 0;
    s += 1 + run * 2 + (found === 0 || t[found - 1] === " " ? 3 : 0);
    ti = found + 1;
  }
  return s;
}

export function CommandMenu({
  email,
  work,
}: {
  email: string;
  work: { slug: string; title: string; summary: string }[];
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const listId = useId();

  const close = useCallback(() => dialog.current?.close(), []);

  const items = useMemo<Item[]>(
    () => [
      ...work.map<Item>((w) => ({
        id: `work-${w.slug}`,
        group: "Case studies",
        label: w.title,
        hint: w.summary,
        href: `/work/${w.slug}`,
        type: "nav-forward",
      })),
      { id: "home", group: "Pages", label: "Home", keywords: "index start", href: "/", type: "nav-back" },
      { id: "playground", group: "Pages", label: "Playground", keywords: "shots gallery screens images ui", href: "/playground", type: "nav-forward" },
      { id: "about", group: "Pages", label: "About Samuel", keywords: "experience skills cv bio", href: "/about", type: "nav-forward" },
      { id: "contact", group: "Pages", label: "Contact", keywords: "hire email message", href: "/#contact" },
      { id: "copy-email", group: "Actions", label: "Copy email address", hint: email, action: "copy" },
      { id: "theme", group: "Actions", label: "Switch theme", keywords: "dark light mode", action: "theme" },
      { id: "intro", group: "Actions", label: "Replay the intro", keywords: "loader preloader letters", action: "intro" },
    ],
    [work, email],
  );

  const results = useMemo(() => {
    return items
      .map((item) => ({ item, s: score(query, `${item.label} ${item.keywords ?? ""} ${item.hint ?? ""}`) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => (query ? b.s - a.s : 0))
      .map((r) => r.item);
  }, [items, query]);

  const open = useCallback((via: string) => {
    const d = dialog.current;
    if (!d || d.open) return;
    const sheet = via === "pointer" && matchMedia("(pointer: coarse)").matches;
    d.dataset.via = via === "keyboard" ? "keyboard" : sheet ? "sheet" : "pointer";
    setQuery("");
    setActive(0);
    setCopied(false);
    d.showModal();
    // Don't summon the on-screen keyboard over a menu opened by tap
    if (!sheet) input.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) close();
        else open("keyboard");
      }
    };
    const onOpen = (e: Event) => open((e as CustomEvent<{ via: string }>).detail?.via ?? "pointer");
    addEventListener("keydown", onKey);
    addEventListener(OPEN_COMMAND_MENU, onOpen);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener(OPEN_COMMAND_MENU, onOpen);
    };
  }, [open, close]);

  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const select = (item: Item | undefined) => {
    if (!item) return;
    if ("href" in item) {
      router.push(item.href, item.type ? { transitionTypes: [item.type] } : undefined);
      close();
    } else if (item.action === "copy") {
      navigator.clipboard.writeText(email).then(
        () => {
          setCopied(true);
          setTimeout(close, 700);
        },
        () => window.location.assign(`mailto:${email}`),
      );
    } else if (item.action === "theme") {
      close();
      setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    } else {
      // A full reload on purpose: the intro measures a real page load, which client navigation can't give it
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${window.location.origin}/?intro`);
    }
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(results[active]);
    } else if (e.key === "Home") {
      setActive(0);
    } else if (e.key === "End") {
      setActive(results.length - 1);
    }
  };

  let lastGroup = "";

  return (
    <dialog
      ref={dialog}
      aria-label="Command menu"
      className="cmd-menu"
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <SearchIcon className="shrink-0 text-ink-3" />
        <input
          ref={input}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKey}
          placeholder="Search work, pages and actions"
          className="h-14 w-full bg-transparent text-ink outline-none placeholder:text-ink-3"
        />
        <kbd className="hidden rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[11px] text-ink-2 sm:block">Esc</kbd>
      </div>

      <ul ref={list} id={listId} role="listbox" aria-label="Results" className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain p-2">
        {results.length === 0 ? (
          <li className="px-3 py-10 text-center text-small text-ink-2">
            Nothing matches &ldquo;{query}&rdquo;. Try &ldquo;FundPath&rdquo; or &ldquo;email&rdquo;.
          </li>
        ) : (
          results.map((item, i) => {
            const header = item.group !== lastGroup && !query ? item.group : null;
            lastGroup = item.group;
            const isActive = i === active;
            const done = item.id === "copy-email" && copied;
            return (
              <li key={item.id} role="presentation">
                {header ? <p className="px-3 pt-3 pb-1.5 text-micro text-ink-3">{header}</p> : null}
                <div
                  id={`${listId}-${item.id}`}
                  role="option"
                  aria-selected={isActive}
                  data-index={i}
                  onPointerMove={() => setActive(i)}
                  onClick={() => select(item)}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-[10px] px-3 py-2.5 ${isActive ? "bg-sunken" : ""}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-ink">{done ? "Copied" : item.label}</span>
                    {item.hint ? <span className="block truncate text-small text-ink-2">{item.hint}</span> : null}
                  </span>
                  {done ? (
                    <CheckIcon className="shrink-0 text-signal" />
                  ) : isActive ? (
                    <ArrowUpRight className="shrink-0 text-ink-3" />
                  ) : null}
                </div>
              </li>
            );
          })
        )}
      </ul>
      <p aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : `${results.length} results`}
      </p>
    </dialog>
  );
}
