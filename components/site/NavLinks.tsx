"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/#work",
    label: "Work",
    match: (path: string) => path === "/" || path.startsWith("/work"),
  },
  { href: "/lab", label: "Lab", match: (path: string) => path.startsWith("/lab") },
  { href: "/about", label: "About", match: (path: string) => path.startsWith("/about") },
];

// The current section is marked with a short ink underline, not a colour
// change alone, so it reads in both themes and for colour-blind visitors.
export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center">
      {links.map(({ href, label, match }) => {
        const current = match(pathname);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={current ? "page" : undefined}
              className="relative flex h-10 items-center rounded-md px-2.5 text-sm text-muted transition-colors duration-(--dur-quick) hover:text-fg aria-[current=page]:text-fg sm:px-3"
            >
              {label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-2.5 bottom-1.5 h-px origin-left bg-ink transition-transform duration-(--dur-base) ease-standard sm:inset-x-3 ${current ? "scale-x-100" : "scale-x-0"}`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
