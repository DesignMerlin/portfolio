"use client";

import type { PointerEvent, ReactNode } from "react";

type Social = { label: string; href: string | null; icon: ReactNode };

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
} as const;

const XIcon = () => (
  <svg {...iconProps} fill="currentColor">
    <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z" />
  </svg>
);
const InstagramIcon = () => (
  <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
    <circle cx="12" cy="12" r="4.1" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const BehanceIcon = () => (
  <svg {...iconProps} fill="currentColor">
    <path d="M16.97 16.93a2.56 2.56 0 0 0 1.9.68 2.5 2.5 0 0 0 1.53-.48c.36-.23.64-.58.78-.99h2.59a5.09 5.09 0 0 1-1.9 2.9 5.29 5.29 0 0 1-3.09.88 5.84 5.84 0 0 1-2.28-.43 4.87 4.87 0 0 1-1.73-1.21 5.66 5.66 0 0 1-1.08-1.88 7.06 7.06 0 0 1-.38-2.39c0-.8.13-1.6.4-2.35a5.31 5.31 0 0 1 5.09-3.6 4.87 4.87 0 0 1 2.37.56c.66.36 1.23.87 1.67 1.49.45.64.77 1.37.94 2.13.2.82.27 1.67.21 2.51h-7.7c-.07.79.18 1.57.68 2.19ZM6.95 4.08c.65 0 1.3.06 1.93.2.53.12 1.04.33 1.49.64.42.3.75.71.96 1.18.24.58.36 1.2.34 1.83a3.5 3.5 0 0 1-.5 1.96 3.73 3.73 0 0 1-1.51 1.29 3.59 3.59 0 0 1 2.03 1.44c.46.75.7 1.61.67 2.49a4.6 4.6 0 0 1-.42 2.03 3.95 3.95 0 0 1-1.17 1.41 5.11 5.11 0 0 1-1.68.81 7.14 7.14 0 0 1-1.93.26H0V4.08h6.95Zm-.24 12.9c.31.01.62-.03.92-.1.27-.06.53-.17.77-.33.22-.16.41-.37.53-.62.14-.32.21-.66.19-1.01a2.08 2.08 0 0 0-.64-1.71 2.62 2.62 0 0 0-1.7-.51H3.24v4.28h3.47Zm13.64-5.96a2.13 2.13 0 0 0-1.66-.62c-.4-.01-.8.08-1.16.26-.28.16-.53.37-.74.62-.17.24-.31.5-.4.79-.07.24-.12.49-.13.73h4.77a3.24 3.24 0 0 0-.68-1.78Zm-13.82-.65c.51.02 1.02-.13 1.43-.43.4-.36.6-.88.56-1.42 0-.31-.05-.61-.18-.89a1.3 1.3 0 0 0-.5-.53 1.85 1.85 0 0 0-.71-.28 3.97 3.97 0 0 0-.83-.07H3.24v3.63h3.29ZM21.62 5.12h-5.97v1.53h5.97V5.12Z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg {...iconProps} fill="currentColor">
    <path d="M4.98 3.5a2.48 2.48 0 1 1 0 4.96 2.48 2.48 0 0 1 0-4.96ZM3 9.75h3.96V21H3V9.75Zm6.46 0h3.8v1.54h.05c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.07V21h-3.96v-5.13c0-1.22-.02-2.8-1.7-2.8-1.71 0-1.97 1.33-1.97 2.71V21H9.46V9.75Z" />
  </svg>
);

/** Liquid glass catches the light where the pointer is: the highlight follows it across the surface */
const followLight = (e: PointerEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
  el.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
};

/**
 * Contact block at the top of the footer, on every page. A row of liquid
 * glass controls: social circles either side of a wide "Email me" pill.
 * - Email pill: hovering or focusing swaps the label upward and brings the
 *   address up from below, so you see exactly where the email goes before
 *   clicking. On touch screens the address is always shown under the pill.
 * - Social circles: the icon lifts and the network's name rises from below
 *   the circle. A network without a link yet (TODO in profile.md) stays
 *   visible but inert and says "coming soon" instead of going nowhere.
 * - Glass: frosted, saturated backdrop, a bright rim and a specular highlight
 *   that follows the pointer. Hover lifts the surface; press sinks it.
 * Reduced motion: the swaps cross-fade instead of sliding.
 */
export function SayHello({
  email,
  x,
  instagram,
  behance,
  linkedin,
}: {
  email: string;
  x: string | null;
  instagram: string | null;
  behance: string | null;
  linkedin: string | null;
}) {
  const before: Social[] = [
    { label: "X", href: x, icon: <XIcon /> },
    { label: "Instagram", href: instagram, icon: <InstagramIcon /> },
  ];
  const after: Social[] = [
    { label: "Behance", href: behance, icon: <BehanceIcon /> },
    { label: "LinkedIn", href: linkedin, icon: <LinkedInIcon /> },
  ];

  const circle = (s: Social) => {
    const body = (
      <>
        <span className="glass-icon">{s.icon}</span>
        <span aria-hidden="true" className="glass-tip">
          {s.href ? s.label : `${s.label}, coming soon`}
        </span>
      </>
    );
    return (
      <li key={s.label}>
        {s.href ? (
          <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} onPointerMove={followLight} className="glass glass-circle">
            {body}
          </a>
        ) : (
          <span role="img" aria-label={`${s.label}, link coming soon`} onPointerMove={followLight} className="glass glass-circle" data-inert="">
            {body}
          </span>
        )}
      </li>
    );
  };

  return (
    <section aria-labelledby="say-hello-title" className="say-hello relative isolate px-4 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-20">
      {/* Something for the glass to bend: our dot grid, fading out at the edges */}
      <div aria-hidden="true" className="say-hello-dots pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-[1320px] text-center">
        <h2 id="say-hello-title" className="font-display text-[clamp(2.25rem,5vw,56px)] leading-[1.05] font-semibold text-balance">
          Your turn. Say hello
        </h2>
        <p className="mx-auto mt-3 max-w-[44ch] text-[20px] leading-[1.5] text-balance text-ink-2">
          Got a role, a project worth building together, or just want to say hi?
        </p>

        <ul className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:mt-16 sm:gap-6">
          {before.map(circle)}
          <li className="order-first w-full sm:order-none sm:w-auto">
            <a href={`mailto:${email}`} onPointerMove={followLight} className="glass glass-pill" aria-label={`Email me at ${email}`}>
              <span className="glass-swap" aria-hidden="true">
                <span className="glass-swap-a">Email me</span>
                <span className="glass-swap-b">{email}</span>
              </span>
            </a>
            <p className="mt-2 text-small text-ink-3 [@media(hover:hover)]:hidden">{email}</p>
          </li>
          {after.map(circle)}
        </ul>
      </div>
    </section>
  );
}
