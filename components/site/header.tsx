"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeIcon, ThemeToggle } from "@/components/ui/theme-toggle";
import { MenuIcon } from "@/components/ui/icons";
import { MobileMenu } from "@/components/site/mobile-menu";
import { useNavTone } from "@/components/site/use-nav-tone";
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

const ROW = "flex items-center gap-1 rounded-full p-1.5 sm:gap-2";
const BRAND = "flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1 font-display text-[15px] font-semibold tracking-[-0.01em]";
const ITEM = "relative rounded-full px-3.5 py-1.5 text-small";
const MENU = "glass glass-btn gap-2 py-2 pr-4 pl-3 text-small font-medium md:hidden";
const Divider = () => <span aria-hidden="true" className="nav-divider mx-1 hidden h-5 w-px md:block" />;

/**
 * Site nav as one compact glass pill, centred, with the same padding on
 * every side and the same gap between every item: wordmark, divider, links,
 * theme toggle.
 *
 * It reads over anything. The pill is drawn twice, once in dark glass with
 * light words and once in light glass with dark words, and each is cut to the
 * part of the page it suits (use-nav-tone). Scrolling past an edge, or between
 * two cards, splits the nav exactly along it, mid-letter if that's where it
 * falls. The links themselves are one invisible layer on top, so there's one
 * set of controls; hover and focus are drawn on both skins.
 *
 * On the home page it stays out of the way while you're on the hero and
 * drops in (slide + fade) as soon as you start scrolling; back at the top it
 * lifts away again. Keyboard focus inside it always brings it back. Other
 * pages show it from the start.
 *
 * The wordmark's wand is an animated emoji, loaded only once the nav is
 * shown; reduced motion gets the still version.
 */
export function Header({ email }: { email: string }) {
  const pathname = usePathname();
  const home = pathname === "/";
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const header = useRef<HTMLElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const shown = !home || scrolled || menuOpen;
  useNavTone(header, pill, shown, pathname);
  // Load the animated wand the first time the nav appears, not with the page
  const [wand, setWand] = useState(false);
  if (shown && !wand) setWand(true);

  // Which control is hovered or focused, for both skins to show
  const [hot, setHot] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const track = (key: string) => ({
    onPointerEnter: () => setHot(key),
    onPointerLeave: () => setHot(null),
    onFocus: (e: React.FocusEvent) => setFocus(e.target.matches(":focus-visible") ? key : null),
    onBlur: () => setFocus(null),
  });
  const look = (key: string) => ({ "data-hot": hot === key ? "" : undefined, "data-focus": focus === key ? "" : undefined });

  const skin = (tone: "dark" | "light") => (
    // A named element is a "backdrop root" and couldn't blur the page behind it if the name were on the pill
    <div
      key={tone}
      aria-hidden="true"
      data-skin={tone}
      data-theme={tone}
      className={`nav-skin glass-nav ${ROW}`}
      style={{ viewTransitionName: tone === "dark" ? "site-header" : "site-header-glass" }}
    >
      <span {...look("home")} className={`nav-part ${BRAND}`}>
        {/* Face crop of the hero portrait; wobbles left and right on hover */}
        <span className="nav-avatar relative mr-1 size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
          <Image src="/me/avatar.jpg" alt="" fill sizes="32px" className="object-cover" priority />
        </span>
        DesignMerlin
        <picture className="nav-wand size-5 shrink-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-enter)]">
          {wand ? <source srcSet="/brand/magic-wand.webp" type="image/webp" media="(prefers-reduced-motion: no-preference)" /> : null}
          <img src="/brand/magic-wand.svg" alt="" width={20} height={20} className="size-5" />
        </picture>
      </span>
      <Divider />
      <span className="hidden items-center gap-1 md:flex">
        {nav.map((item) => {
          const active = item.match(pathname);
          return (
            <span key={item.href} {...look(item.href)} data-active={active ? "" : undefined} className={`nav-part nav-item ${ITEM}`}>
              {item.label}
              <span className="nav-underline absolute inset-x-3.5 -bottom-px h-px origin-left transition-transform duration-[280ms] ease-[var(--ease-enter)]" />
            </span>
          );
        })}
      </span>
      <Divider />
      <span {...look("theme")} className="nav-part nav-item nav-theme grid size-9 place-items-center rounded-full">
        <ThemeIcon />
      </span>
      <span {...look("menu")} className={`nav-part ${MENU}`}>
        <MenuIcon />
        Menu
      </span>
    </div>
  );

  return (
    <header
      ref={header}
      data-shown={shown ? "" : undefined}
      data-home={home ? "" : undefined}
      className="site-header pointer-events-none sticky top-0 z-50 flex h-[var(--header-h)] items-center justify-center px-3"
    >
      <div ref={pill} className="site-header-pill pointer-events-auto relative rounded-full">
        {skin("dark")}
        {skin("light")}

        {/* The real controls: same shape, drawn by the skins beneath */}
        <div className={`nav-real ${ROW}`}>
          <Link href="/" transitionTypes={home ? undefined : ["nav-back"]} className={BRAND} {...track("home")}>
            <span className="mr-1 size-8 shrink-0" />
            DesignMerlin
            <span className="size-5 shrink-0" />
          </Link>
          <Divider />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.match(pathname) ? "page" : undefined}
                transitionTypes={item.href.startsWith("/#") && home ? undefined : ["nav-forward"]}
                className={ITEM}
                {...track(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Divider />
          <span className="contents" {...track("theme")}>
            <ThemeToggle />
          </span>
          <button type="button" onClick={() => setMenuOpen(true)} aria-haspopup="dialog" aria-expanded={menuOpen} className={MENU} {...track("menu")}>
            <MenuIcon />
            Menu
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={closeMenu} email={email} />
    </header>
  );
}
