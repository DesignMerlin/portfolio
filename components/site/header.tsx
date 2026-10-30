"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MenuIcon } from "@/components/ui/icons";
import { nav, OPEN_COMMAND_MENU } from "@/lib/site";

export function openCommandMenu(via: "pointer" | "keyboard") {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_MENU, { detail: { via } }));
}

/** True once the page has scrolled past the top. rAF-throttled, passive. */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [threshold]);
  return scrolled;
}

/**
 * Site nav as one compact glass pill, centred, with the same padding on
 * every side and the same gap between every item: wordmark, divider, links,
 * theme toggle.
 *
 * On the home page it stays out of the way while you're on the hero and
 * drops in (slide + fade) as soon as you start scrolling; back at the top it
 * lifts away again. Keyboard focus inside it always brings it back. Other
 * pages show it from the start.
 *
 * The wordmark's wand is an animated emoji, loaded only once the nav is
 * shown; reduced motion gets the still version.
 */
export function Header() {
  const pathname = usePathname();
  const home = pathname === "/";
  const scrolled = useScrolled();
  const shown = !home || scrolled;
  // Load the animated wand the first time the nav appears, not with the page
  const [wand, setWand] = useState(false);
  if (shown && !wand) setWand(true);

  return (
    // No view-transition-name on the header itself: a named element is a "backdrop root", and the
    // glass could no longer blur the page behind it. The pill carries its own name.
    <header
      data-shown={shown ? "" : undefined}
      className="site-header pointer-events-none sticky top-0 z-50 flex h-[var(--header-h)] items-center justify-center px-3"
    >
      <div
        style={{ viewTransitionName: "site-header" }}
        className="site-header-pill glass-nav pointer-events-auto flex items-center gap-1 rounded-full p-1.5 sm:gap-2"
      >
        <Link
          href="/"
          transitionTypes={home ? undefined : ["nav-back"]}
          className="group flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1 font-display text-[15px] font-semibold tracking-[-0.01em]"
        >
          {/* Face crop of the hero portrait; wobbles left and right on hover */}
          <span className="nav-avatar relative mr-1 size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
            <Image src="/me/avatar.jpg" alt="" fill sizes="32px" className="object-cover" priority />
          </span>
          DesignMerlin
          <picture className="size-5 shrink-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-enter)] group-hover:rotate-[-14deg]">
            {wand ? <source srcSet="/brand/magic-wand.webp" type="image/webp" media="(prefers-reduced-motion: no-preference)" /> : null}
            <img src="/brand/magic-wand.svg" alt="" width={20} height={20} className="size-5" />
          </picture>
        </Link>

        <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-line-strong md:block" />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                transitionTypes={item.href.startsWith("/#") && home ? undefined : ["nav-forward"]}
                className={`relative rounded-full px-3.5 py-1.5 text-small transition-colors duration-150 hover:text-ink ${active ? "text-ink" : "text-ink-2"}`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3.5 -bottom-px h-px origin-left bg-ink transition-transform duration-[280ms] ease-[var(--ease-enter)] ${active ? "scale-x-100" : "scale-x-0"}`}
                />
              </Link>
            );
          })}
        </nav>

        <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-line-strong md:block" />

        <ThemeToggle />
        <button
          type="button"
          onClick={() => openCommandMenu("pointer")}
          className="pressable flex items-center gap-2 rounded-full bg-ink py-2 pr-4 pl-3 text-small font-medium text-paper md:hidden"
        >
          <MenuIcon />
          Menu
        </button>
      </div>
    </header>
  );
}
