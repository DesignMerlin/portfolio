/** Public URL. Set NEXT_PUBLIC_SITE_URL in Vercel once the domain is bought. */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const nav = [
  { href: "/#work", label: "Work", match: (p: string) => p.startsWith("/work") },
  { href: "/playground", label: "Playground", match: (p: string) => p.startsWith("/playground") },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
  { href: "/#contact", label: "Contact", match: () => false },
] as const;

/** Opens the command menu from anywhere (header button, footer hint, mobile menu) */
export const OPEN_COMMAND_MENU = "command-menu:open";
/** Fired when the intro curtain has lifted, so the hero can play its entrance */
export const INTRO_DONE = "intro:done";
