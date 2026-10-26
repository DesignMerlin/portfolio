"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocalTime } from "@/components/ui/local-time";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MenuIcon, SearchIcon } from "@/components/ui/icons";
import { useShortcutLabel } from "@/components/ui/use-shortcut-label";
import { nav, OPEN_COMMAND_MENU } from "@/lib/site";

export function openCommandMenu(via: "pointer" | "keyboard") {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_MENU, { detail: { via } }));
}

export function Header({ name }: { name: string }) {
  const pathname = usePathname();
  const shortcut = useShortcutLabel();
  const home = pathname === "/";

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/"
          transitionTypes={home ? undefined : ["nav-back"]}
          className="group flex items-center gap-2.5 text-small font-semibold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-full bg-ink text-[11px] font-bold text-paper transition-transform duration-200 ease-[var(--ease-enter)] group-hover:rotate-[-8deg]"
          >
            SE
          </span>
          {name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                transitionTypes={item.href.startsWith("/#") && home ? undefined : ["nav-forward"]}
                className={`relative rounded-full px-3 py-1.5 text-small transition-colors duration-150 hover:text-ink ${active ? "text-ink" : "text-ink-2"}`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 -bottom-px h-px origin-left bg-ink transition-transform duration-[280ms] ease-[var(--ease-enter)] ${active ? "scale-x-100" : "scale-x-0"}`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <span className="mr-2 hidden lg:inline">
            <LocalTime />
          </span>
          <button
            type="button"
            onClick={() => openCommandMenu("pointer")}
            className="pressable hidden items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-2 pl-3 text-small text-ink-2 transition-colors duration-150 hover:border-line-strong hover:text-ink md:flex"
          >
            <SearchIcon />
            Search
            <kbd className="rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[11px] text-ink-2">{shortcut}</kbd>
          </button>
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
      </div>
    </header>
  );
}
