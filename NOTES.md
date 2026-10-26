# Notes

Running log of design and technical decisions, so future sessions have context.

## Working with Samuel

- Samuel is a product designer new to engineering. Explain what's happening in plain language and say why for every technical choice.

## 2026-10-05 — Setup

- **Keep the project out of OneDrive.** OneDrive syncing tens of thousands of `node_modules` files causes slow installs and locked-file errors. GitHub is the backup instead.
  - Location: `C:\Users\psalm\Documents\Projects\portfolio`. This is the local Documents folder, not the OneDrive one (`C:\Users\psalm\OneDrive\Documents`), so it isn't synced. Checked 2026-10-26.
- **pnpm 12.9.1** installed globally via npm (CLAUDE.md's package manager). Version pinned in `package.json` → `packageManager`.
- **Git** initialised on `main`. No GitHub remote yet.
- **Playwright** (`@playwright/test`, dev-only, 0 KB shipped to visitors) with Chromium + WebKit engines. WebKit = Safari/iPhone engine, since many recruiters browse on iPhone.
  - `pnpm shoot <url> [name]` → desktop (1440px, Chromium) and mobile (375px, WebKit) screenshots in `/screenshots` (gitignored).

## Open questions (from first review)

- Phase 0 content: `content/profile.md` (drafted, has TODOs), 3 case studies, Figma token link, domain.
- Hero vs. "no scroll to work" conflict. Proposal: statement + bio + work list share the first screen; Arjun's "motion proves the point" moves to the work preview or case studies. Confirmed by Antonio's mobile screenshot: no work visible in the first viewport.
- One loud moment on the Index: proposal is the work-list → case study morph; drop the stats marquee.
- NDA status of Immigify / client screens.
- Prototype View Transitions + shared-element early in Phase 1.5 (Next.js support is experimental).

## 2026-10-26 — Housekeeping

- Moved `profile.md` to `content/profile.md`, where CLAUDE.md and the Ask agent expect it.
- Ran `pnpm install` and installed Playwright's Chromium + WebKit; `pnpm shoot` verified working.
- `pnpm lint` / `typecheck` / `build` don't exist yet on purpose. Phase 1 adds them with the Next.js scaffold, rather than placeholder scripts that pass without checking anything.
- Reference sites check (status + page title only, no motion review): all 15 online. Exception: marianopascual.me fails over HTTPS; over HTTP it redirects to marianopascual.cargo.site, titled "Mariano Pascual Art". Possibly redesigned: re-check in a real browser before relying on it for the "one memorable moment" reference.

## 2026-10-26 — First full build (Index, 3 case studies, UI shots, About)

Samuel asked for the whole site in one go ("non-negotiable build"), so the usual approval gates (token plan, motion token values, per-interaction specs) were decided here and documented instead. All of it is open to revision.

**Stack added:** next 16.4.3, react 19.3.1, motion 14.6.0, next-mdx-remote 6 (server-only, 0 KB client), tailwindcss 4.3, server-only. Dev: typescript 5.9, eslint 10 + eslint-config-next. No other UI libraries.

**Tokens** (`styles/tokens.css`): cool paper #f2f3f5, ink #111318, ink-2 #565b66, accent violet #4b37d6 (taken from the Figma case-study buttons), signal green for availability. Dark theme from the same names. Type: Bricolage Grotesque (static 400–700) + JetBrains Mono for numbers and time.

**Motion tokens** (`lib/motion.ts`, mirrored as CSS vars): durations 100/180/280/450/700ms. Easings from Emil Kowalski's skills: standard (0.77,0,0.175,1) for on-screen moves, enter/exit (0.23,1,0.32,1), emphasized = iOS drawer (0.32,0.72,0,1). Springs: snappy (0.3s, no bounce), gentle (0.5s, 0.1), bouncy (0.5s, 0.25, confirmations only). Stagger 50ms.

**Emil's skills applied:** no ease-in anywhere; never scale(0); press = scale(0.97); hover gated to real pointers; Motion animations use full transform strings; ⌘K opens with no animation from the keyboard (pointer: 150ms fade/scale, touch: bottom sheet); exits faster than enters; blur bridges crossfades.

**Signature interactions:**
- Intro: 0→100% counter tied to real load signals (fonts + window load), eases to 82% on its own, any key or tap skips. Once per session; `?intro` or ⌘K → "Replay the intro" replays it. Curtain lifts with clip-path, then hero words rise (CSS only).
- Index work list: anchored preview wipes in from the direction you moved; Figma hover state rebuilt in code; click morphs the preview into the case-study hero (React `<ViewTransition>`, no dependency).
- Page transitions: forward slides left, back slides right, header anchored.
- Case studies: reading progress, sticky section nav (phone: pill that grows into contents), personas, filterable user stories, journey map with emotion curve, keyboard IA tree, decision log with rejected options, testing rounds, before/after slider, and one lazy-loaded prototype each with 0.25× and Replay.
- Shots: masonry filter reflow, shared-element lightbox, arrows/swipe/drag-down-to-close.

**Deliberate exceptions:** accordions animate `grid-template-rows` (Emil allows height for accordions; there's no transform equivalent).

**Content honesty:** Room8, FundPath and Immigify case studies are drafts written from the Figma thumbnails and profile.md. Personas, findings and test rounds are plausible drafts, not real research. Every MDX file is `draft: true` (dev-only banner) and has `TODO: Samuel to confirm` comments. Only confirmed numbers are shown (30+ screens, 100+ tokens, $1M pre-seed during tenure, profile.md stats).

**Tooling:** `scripts/review.mjs` (all pages, desktop Chromium + mobile WebKit) and `scripts/interact.mjs` (drives every signature flow, reports console errors). Both expect `pnpm start -p 3100`.

**Open items for Samuel:**
- Confirm or replace all case-study research content; add real outcomes; year/timeline for Room8 and FundPath.
- NDA scope for Immigify; real Immigify cover and screens (currently coded placeholders).
- Export real frames for the 11 placeholder UI shots (drop into /public/shots, set `src` in content/shots.ts).
- LinkedIn, CV and Voxdeed's public one-liner (profile.md TODOs; links hide until set).
- Personal photos for About.
- Check body text weight on a real iPhone: Playwright's Windows WebKit renders Bricolage heavier than Chromium.
- Not built yet: Lab, Ask agent, case-study OG images per page.

## 2026-10-26 — Hero redesign (Samuel's direction, Nikola-style split name)

- Hero is now the name split around a portrait card (`components/home/hero-showcase.tsx`). Pinned for 330vh on desktop: the name halves drift apart and fade, the portrait glides to the left column, services ("What I do", from content/about.ts) arrive on the right and step through with scroll; each has a fill line, and clicking jumps to it. Phones get a stacked, unpinned version. Reduced motion crossfades instead of moving.
- Portrait placeholder until Samuel adds `/public/me/hero.jpg` and sets `heroPhoto.src` in content/about.ts.
- Dark is now the default theme for first visits (Samuel: "keep the dark mode feel"); the toggle still remembers a choice.
- Flag (CLAUDE.md reference rule): this layout deliberately mirrors nikolaradeski.com's hero at Samuel's request. Kept our own dot grid instead of the hexagon texture.
- Trade-off: on desktop the work list now starts after the pinned hero, so it's no longer visible without scrolling (CLAUDE.md's "case study in 10 seconds" goal). The header's Work link and ⌘K still reach it in one step.
- `scripts/hero-frames.mjs` screenshots the hero at several scroll positions.

## 2026-10-26 — Portrait, flip card, Geist

- Samuel's portrait (photo by iJohn, watermark kept) at `public/me/hero.jpg`, set in `content/about.ts`.
- `components/home/flip-portrait.tsx`: back face shows "Samuel Ekwenze / Product Designer". Hover flips on mouse devices; tap on touch; Enter/Space on keyboard. Spring, so it reverses mid-turn. In the desktop hero, scroll adds one full turn while the card glides left (the name side passes by mid-turn).
- Which face shows is computed from the card's angle (cos ≥ 0 → photo) rather than relying on `backface-visibility`; Playwright's WebKit ignored it and painted the back face mirrored. `.card-face` keeps the prefixed property as well.
- Fonts: Geist for all body text (`--font-sans`), Bricolage for h1–h3 and display numbers (`--font-display` / `font-display`). Geist also fixed the heavy small text seen in WebKit.

## 2026-10-26 — Hanging service cards, new statement

- Statement (Samuel's words, now also in profile.md and the OG image): "Designing products people trust, for 3+ years. Work that has generated revenue and helped companies raise pre-seed funding."
- "What I do" is now tags hanging from a rope (`components/home/hanging-cards.tsx`), after a reference Samuel shared. Our fonts (Bricolage title, Geist body and chips), one tint per card.
- Desktop: page scroll slides the row along the rope. Phones: the row is a swipeable snap carousel. In both, the row's velocity feeds an underdamped spring per card (slightly different stiffness each), so cards swing from their pins and settle when movement stops. Reduced motion: slide only, no swing.
- Removed the stepped services list and its fill lines.
- Flip card is held still while it's the hero (Samuel): hover/tap/keyboard flipping switches on only once it has settled beside the cards (`interactive` prop), and the scroll turn now plays during the last part of the move (split 0.55–1) instead of from the first scroll. On phones the card is the hero, so it doesn't flip there.

## 2026-10-26 — Hero intro, services in their own section

- Hero (pinned 220vh): name splits → portrait glides left (turns once as it arrives, flippable only once settled) → a bold two-paragraph intro arrives on the right. Intro text is a DRAFT in Samuel's voice in `content/about.ts` (`heroIntro`), written from profile.md facts; structure inspired by a reference he shared, wording rewritten as he asked. Uses his "3+ years".
- "What I do" moved to its own section (`components/home/services-section.tsx`): desktop pins for 220vh while scroll slides the hanging cards along the rope; phones swipe. Statement heading lives here now.
- All hanging cards are the same height (row stretches to the tallest). Desktop cards 340px wide so the row always has somewhere to travel.
- "Interaction and AI interface design" renamed to "Interaction design" (About page too, same data).
- Hanging cards now use a pendulum simulation instead of springs (Samuel wanted the dangle "fully effected back and forth"): θ'' = -ω²θ - 2ζωθ' + k·a, driven by the rope's acceleration. Period 1.15s, damping ratio ~0.1, 1000 px/s ≈ 16°, capped at 18° so neighbours don't collide. Desktop drives it from page scroll inside the section (both directions); phones from the row's swipe. One rAF loop, values written to motion values. `scripts/swing-test.mjs` measures it: ~18° peak, 5–6 zero crossings, settles in ~3s.
- Rope now threads through the cards (Samuel): rope sits behind the cards (z-0, cards z-[1]); each card has a real hole punched with a CSS mask at the pivot (50% 38px), so the rope only shows between cards and through the holes, and stays in the hole while the card swings. Shadow moved to `filter: drop-shadow` on the swinging wrapper so it follows the cut-out (box-shadow would be clipped by the mask).
- Rope now weaves (Samuel: "zigzag"): the back run (behind all cards) is hidden by each card up to its hole; from the hole, each card adds a front stretch of rope over itself and across the gap, ending where the next card begins, so the cord goes back → through the hole → front → behind the next card. The front stretch lives in the non-rotating `li`, so it stays level while the card swings. Shared `ROPE` style keeps both runs identical.
