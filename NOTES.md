# Notes

Running log of design and technical decisions, so future sessions have context.

## Working with Samuel

- Samuel is a product designer new to engineering. Explain what's happening in plain language and say why for every technical choice.

## 2026-10-05 — Setup

- **Moved the project out of OneDrive** to `C:\dev\portfolio`. OneDrive syncing tens of thousands of `node_modules` files causes slow installs and locked-file errors. GitHub is the backup instead.
- **Node.js v24.21.0** (LTS "Krypton", updated via the nodejs.org installer).
- **pnpm 12.9.1** installed globally via npm (CLAUDE.md's package manager). Version pinned in `package.json` → `packageManager`.
- **Git** initialised on `main`. No GitHub remote yet.
- **Playwright** (`@playwright/test`, dev-only, 0 KB shipped to visitors) with Chromium + WebKit engines. WebKit = Safari/iPhone engine, since many recruiters browse on iPhone.
  - `pnpm shoot <url> [name]` → desktop (1440px, Chromium) and mobile (375px, WebKit) screenshots in `/screenshots` (gitignored).

## Open questions (from first review)

- Phase 0 content: `profile.md`, 3 case studies, Figma token link, domain.
- Hero vs. "no scroll to work" conflict. Proposal: statement + bio + work list share the first screen; Arjun's "motion proves the point" moves to the work preview or case studies. Confirmed by Antonio's mobile screenshot: no work visible in the first viewport.
- One loud moment on the Index: proposal is the work-list → case study morph; drop the stats marquee.
- NDA status of Immigify / client screens.
- Prototype View Transitions + shared-element early in Phase 1.5 (Next.js support is experimental).

## 2026-10-05 — Typography

- **Typefaces: Clash Display + Delight.** Self-hosted as `.woff2` and loaded with `next/font/local` (no layout shift, no third-party request).
- **Landour dropped.** The downloaded copy is a trial: 67 characters only (A–Z, a–z, 0–9, comma, period; no `' ? ! - :`), no kerning, and the licence forbids showcasing designs online with it. Revisit only if Samuel buys the full web licence from Rajesh Rajput.
- **Clash Display** (Indian Type Foundry, via Fontshare). Free for commercial use including web under the Fontshare terms; ITF asks for a credit. 6 weights (Extralight–Bold), full Latin + accents, kerning. The befonts.com zip is a re-upload. Prefer the official Fontshare download, which includes `.woff2` and a variable font.
- **Delight** (Rajesh Rajput). Freeware, commercial use allowed. Full Latin + accents. **Only one weight (Regular), no italic.** Licence bans redistribution; web embedding is assumed fine but unconfirmed (designer's email is in the font file).
- Still open: roles (presumed Clash = display, Delight = body/UI), and whether one Delight weight is enough for body + UI.

## 2026-10-06 — Brand colour + Button

- **Brand colour: blue** from Samuel's token export (`brand 🟦` mode, where `primary/*` aliases the blue `secondary` scale): 50 `#E3EFFC` · 75 `#C6DDF7` · 100 `#B6D8FF` · 200 `#80BBFF` · 300 `#3D89DF` · 400 `#1671D9` · 500 `#0D5EBA` · 600 `#034592` · 700 `#04326B` · 800 `#012657` · 900 `#001633`.
- **Text font: Delight.** Inter is removed everywhere. **No AUL brand** (purple `#5A2058`, its theme.css) anywhere in the portfolio. It's a client project.
- **Button source:** Figma "Rayna UI V2.0 (Copy)", node `7036:3142`, `type=3D` variants. That's a third-party UI kit, so it's a primitive we adapt, not a showcase of Samuel's own system work.
  - 3D look = solid fill + `linear-gradient(180deg, white 20% → brand 20%)` sheen + 1px inner border (lighter tint) + 1px outer ring (`box-shadow 0 0 0 1px`). Radius 8px.
  - Sizes: xs 36px (pad 8), sm 40px (pad 10/12), md 48px (pad 12), lg 56px (pad 16). Icons 20px (xs/sm) / 24px (md/lg). Label 14px (xs/sm) / 16px (md/lg), padding 0 4px (xs) / 0 8px.
  - Figma states: filled hover = **lighter** tint (primary/100 bg, white text), pressed = primary/700, disabled = gray 300 bg + gray 400 text. Outline: white bg + primary/500 ring + primary/400 text; hover/pressed = primary/50 bg. Link: primary/400 text, no box.
- **Contrast check (blue, WCAG AA needs 4.5:1):** white on 400 = 4.77 flat but **4.05 under the 3D sheen** (fails). White on 500 = 5.15 with sheen (passes). Figma's hover (white on blue/100) = **1.4** (fails badly). Blue 400 text on primary/50 = 4.1 (fails); blue 500 = 5.4 (passes). Grey filled with sheen = 3.8 (fails).

## 2026-10-06 — Phase 1 scaffold

- **Next.js 16.3.8** (App Router, Turbopack), React 19.2, TypeScript strict + `noUncheckedIndexedAccess`, Tailwind 4.3, ESLint 9 (next core-web-vitals + typescript + prettier), Prettier 3 with the Tailwind class-sorting plugin.
- **How it was scaffolded:** `create-next-app` refuses non-empty folders, so it was generated in a scratch folder and only the needed files were copied in. Not copied: its `CLAUDE.md` (would have replaced ours), `README.md`, demo SVGs, Geist font. `package.json` and `.gitignore` were merged by hand, not replaced.
- **AGENTS.md exists on purpose.** `next dev` inserts a "read the bundled Next.js docs" block into AGENTS.md, or into CLAUDE.md if AGENTS.md is missing. Keeping AGENTS.md means our CLAUDE.md is never touched. Disable entirely with `agentRules: false` in next.config if wanted.
- **Next 16 differs from older docs.** The real docs ship in `node_modules/next/dist/docs/`. Route props use the global `PageProps<"/route">` / `LayoutProps<"/">` types, generated by `next typegen` (so `pnpm typecheck` runs typegen first).
- **MDX:** `@next/mdx` compiles at build time (no MDX runtime shipped). `remark-frontmatter` + `remark-mdx-frontmatter` (passed by name, required for Turbopack) expose YAML frontmatter as an export. `lib/content.ts` validates it with **zod** (server-only, 0 KB to the browser). A bad field fails the build and names the file and field. Tested both ways.
- **Content rules:** `content/<collection>/<slug>.mdx`. The frontmatter `slug` must equal the file name. Files starting with `_` are never loaded. `_template.mdx` in each folder is a starter **and** is required: Turbopack's dynamic `import()` fails if a folder has zero `.mdx` files. Lab entries need `published: true` to get a page.
- **Routes:** unknown `/work/*` and `/lab/*` slugs 404 (`dynamicParams = false`). `next start` logs `NoFallbackError` for those 404s; that's Next's internal signal, not a crash.
- **Dependencies added and their cost to visitors:** `motion` (0 KB until imported; use `LazyMotion` + `m` to keep the initial cost small), `@next/mdx`/`@mdx-js/*` (build-time compile; tiny provider at runtime), `zod` (server-only, 0 KB). Everything else is dev-only.
- `profile.md` moved to `content/profile.md` (CLAUDE.md path, Ask agent's source).
- Port 3000 is used by another app on Samuel's machine; `next dev` falls back to 3001.

## 2026-10-06 — Reference study (Playwright, desktop 1440 + iPhone 375)

- **antoniopires.design:** display + body in **Delight**, plus **Landour**. Asymmetric split hero (small bio low-left, huge statement right), warm off-white bg, dot-grid band, full-bleed coloured statement section. Motion: CSS transitions, mostly 400ms (also 500/350), ease-out `cubic-bezier(0.25,0.46,0.45,0.94)`, opacity + transform only. Calm, no springs. Mobile stacks bio above statement; no work visible in first viewport.
- **arjun-r.com:** Framer site. Inter Bold display + handwritten Caveat annotations, cream bg, burnt-orange highlight swash. Motion is all springs (Web Animations exported as `linear()` curves, 400ms and 800ms). Hero sentence "I blend my engineering roots with product design to make interfaces that just… make sense", annotations around it, then "Here's how" as you scroll; project cards tilt in.
- **nikolaradeski.com:** **Clash Display** (name) + **General Sans** (UI). 3D hex background, centred photo, floating black pill nav with orange CTA, live local time. Motion: 0.3s `ease` on almost everything (bg, transform, border, blur), 50s infinite marquee. Very long page (18.7k px).
- **Originality problem (flagged to Samuel):** Delight is Antonio's typeface and Clash Display is Nikola's, both on CLAUDE.md's "do not take" list. profile.md's scroll sentence ("I blend … that just… make sense" + "Okay, so…") is Arjun's hero nearly word for word, and its hero note says "Antonio-style split hero". Built as written, the Index would read as a remix of the three references.
