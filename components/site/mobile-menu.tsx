"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { nav } from "@/lib/site";

/**
 * Phone menu: the nav links and an "Email me" liquid glass pill, nothing else
 * (search and the rest of the command menu stay on ⌘K for keyboards).
 * A modal <dialog>, so focus is trapped, Escape closes it and the page
 * behind is inert. Slides down from the nav as a glass sheet; reduced
 * motion fades it. Following a link closes it.
 */
export function MobileMenu({ open, onClose, email }: { open: boolean; onClose: () => void; email: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      // Same width as the nav pill, opening just under it
      const pill = document.querySelector(".site-header-pill")?.getBoundingClientRect();
      if (pill) {
        d.style.left = `${pill.left}px`;
        d.style.top = `${pill.bottom + 8}px`;
        d.style.width = `${pill.width}px`;
      }
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  // It is placed against the pill when it opens, so a resize or rotation (which may also bring the
  // full nav back) closes it rather than leaving it stranded
  useEffect(() => {
    if (!open) return;
    const width = innerWidth;
    const onResize = () => innerWidth !== width && onClose();
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, [open, onClose]);

  // Navigating away closes it
  const last = useRef(pathname);
  useEffect(() => {
    if (last.current !== pathname) onClose();
    last.current = pathname;
  }, [pathname, onClose]);

  return (
    <dialog
      ref={dialog}
      aria-label="Menu"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="mobile-menu pointer-events-auto fixed m-0 h-auto max-h-[calc(100svh-96px)] max-w-none overflow-auto bg-transparent p-0 text-ink backdrop:bg-black/30 backdrop:backdrop-blur-[2px]"
    >
      <div className="glass-panel relative rounded-[24px] p-4">
        <div className="flex items-center justify-between">
          <p className="pl-1 text-small text-ink-2">Menu</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="glass glass-btn size-9 rounded-full"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Main" className="mt-2">
          <ul className="flex flex-col">
            {nav.map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    // Close synchronously, before the route transition snapshots the page
                    onClick={() => dialog.current?.close()}
                    aria-current={active ? "page" : undefined}
                    className={`block border-b border-line px-1 py-3 font-display text-[clamp(1.125rem,5.5vw,1.375rem)] leading-tight font-semibold tracking-[-0.01em] ${active ? "text-ink" : "text-ink-2"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <a href={`mailto:${email}`} className="glass glass-pill mt-5 !h-12 w-full text-[15px]" aria-label={`Email me at ${email}`}>
          <span className="relative z-1">Email me</span>
        </a>
        <p className="mt-2 truncate text-center text-micro text-ink-3">{email}</p>
      </div>
    </dialog>
  );
}
