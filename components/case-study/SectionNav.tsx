"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content";

// Sticky navigator for the case study's sections. The current section is the
// last heading that has scrolled past the top third of the viewport.
export function SectionNav({ headings }: { headings: Heading[] }) {
  const [current, setCurrent] = useState(headings[0]?.id);

  useEffect(() => {
    const elements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      () => {
        const line = window.innerHeight / 3;
        let latest = elements[0]?.id;
        for (const el of elements) if (el.getBoundingClientRect().top < line) latest = el.id;
        setCurrent(latest);
      },
      { rootMargin: "0px 0px -66% 0px", threshold: [0, 1] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  function jump(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    // Move focus so keyboard and screen reader users land in the section too.
    target.focus({ preventScroll: true });
    history.replaceState(null, "", `#${id}`);
  }

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Sections" className="sticky top-8">
      <p className="mb-3 font-mono text-meta text-faint">On this page</p>
      <ul className="border-l border-line">
        {headings.map(({ id, text }) => {
          const active = id === current;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(event) => {
                  event.preventDefault();
                  jump(id);
                }}
                aria-current={active ? "location" : undefined}
                className={`-ml-px block border-l py-1.5 pl-4 text-sm transition-colors duration-(--dur-quick) ${active ? "border-ink text-fg" : "border-transparent text-muted hover:text-fg"}`}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
