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
- Collaboration cursors in the hero only (`components/home/collab-cursors.tsx`), at Samuel's request: Figma, Photoshop, Claude, Illustrator, Jitter, Framer, each its own colour. Each glides to a random spot (x and y on different timings so paths curve), pauses 0.35–1.9s, sometimes "clicks". aria-hidden, pointer-events none, paused off screen / hidden tab. Desktop: they fade out as the intro text arrives (split 0.45–0.85). Reduced motion: they rest in fixed spots.
- Flag: CLAUDE.md limits unprompted ambient motion to one orchestrated moment per page (the intro). These cursors are a second ambient element, added on Samuel's explicit request.

## 2026-10-26 — Glass nav, avatar, favicon, gradient cursors, hydration fix

- Nav rebuilt from Samuel's Figma (MY-CV 628:2320): avatar + name + "Product designer", links, "Get in touch" (Figma orange #f56630 with the top sheen, #fcd2c2 border). Everything from the old nav kept (Work/Shots/About/Contact, Lagos time, Search ⌘K, theme toggle, mobile Menu). Fonts stay ours (Bricolage name, Geist links) rather than Figma's Delight / General Sans.
- Liquid glass (`.glass-nav`): rgb(23 23 23 / .72) (.86 over the light theme), blur 24px + saturate 185%, bright top edge, faint rim, sheen. Floating pill at the top; past 24px of scroll it grows to full width via a Motion layout animation (spring.gentle), and back at the top.
- The header always uses dark tokens (`data-theme="dark"` on it; tokens.css now applies dark to any `[data-theme="dark"]` subtree).
- view-transition-name moved off <header> onto the glass and the content row: a named element is a backdrop root, so the glass couldn't blur the page behind it.
- `--header-h` token (76px, 92px ≥1024) drives sticky offsets (hero, services, reading progress) and scroll-padding.
- Avatar from the Figma file, cropped square around the face: `/public/me/avatar-256.png` (nav), `app/icon.png` 64px favicon, `app/apple-icon.png` 180px. Original 2.8MB export not kept.
- Collab cursors: rounded arrowhead (like Samuel's reference) with a different gradient per collaborator (linear at various angles, one radial, three-stop sweeps); labels use the same gradient.
- Hydration bug fixed: Motion's useReducedMotion reads the media query on the first client render, so components that branch markup on it mismatched the server HTML; React then re-rendered the document and dropped data-theme (reduced-motion visitors got the light theme + error #418). New `components/ui/use-reduced-motion.ts` (useSyncExternalStore, false during hydration) replaces it in all 20 components.
- Nav reverted to the previous content and colours (Samuel): SE monogram + name, links, Lagos time, Search ⌘K, theme toggle, phone Menu; theme-aware paper glass (paper 78% + blur 18px). Kept as a fully rounded pill: compact (1040px) at the top, and on scroll the pill widens to the page's 1320px content container, still rounded (Motion layout animation on the background only). Figma "Get in touch" button and avatar removed; the favicon/apple icon cut from Samuel's Figma photo stay. `--header-h` back to 72px everywhere.
- Nav logo and favicon now use Samuel's hero photo (face crop 1040px square from hero.jpg): `public/me/avatar.jpg` (128px, nav), `app/icon.png` (64px), `app/apple-icon.png` (180px). SE monogram removed.
- Type tracking: -2% (-0.02em) on all Geist and Bricolage text, from Samuel's Figma (-0.32px @16, -0.4px @20, -0.24px @12 = -2%). He wrote "-2px"; a flat -2px would crush body text, so it follows the Figma's proportional value. Set via `:where(body, body *)` so each element computes -2% of its own size (inherited em arrives as px); mono stays at 0. Removed per-element tracking overrides on display type.
- Hero intro ("Hi, I'm Samuel…") now medium (500), not semibold.
- Tracking tightened (Samuel: "tighter between letters"): Bricolage headings/display at a flat -2px; Geist at -4% (a flat -2px was tried on Geist and made small text unreadable: "SamuelEkwenze" merged, chips illegible). Geist-styled headings (`.font-sans`) keep the body value.
- Footer (from a Nikola Radeski reference Samuel shared): kept the existing row (credit, Lagos time, copy email, LinkedIn, Jump anywhere), then "Samuel Ekwenze" huge in a hairline outline sized to span the page (10.6vw), then an endless "✱ Let's work together" marquee linking to /#contact.
  - Outline: 2px text-stroke painted under a paper-coloured fill (`paint-order: stroke fill`), so the font's internal overlapping contours are hidden and a clean 1px outer edge remains, theme-aware. (`-webkit-text-stroke` alone drew the overlaps; an SVG feMorphology filter didn't apply.)
  - Marquee: two identical halves, CSS animation -50% over 38s (off main thread); hover/focus pauses; reduced motion stops it. One link for screen readers, repeats aria-hidden.
  - Footer type tracks at max(-2px, -0.03em), so small phone sizes aren't crushed.
  - Flag: another always-moving element beyond CLAUDE.md's one-ambient-moment rule, added on request.
- Footer: credit line now sits on one line on desktop (balanced wrap on smaller screens). Outlined name fills on hover: a violet (accent) copy on top, revealed left→right with clip-path (700ms emphasized in, 450ms out), mouse-only; reduced motion crossfades the fill instead.
- Footer credit line removed (Samuel). The top row is now the Lagos time (left) and copy email / LinkedIn / Jump anywhere (right), vertically centred.
- Hydration fix: collab-cursor gradient vectors came from Math.cos/sin, whose last digits differ between Node and the browser (0.21321178182447692 vs …698), so the SVG x1 attribute mismatched. Now rounded with toFixed(4).
- Dev warning fix ("two <ViewTransition> with the same name"): the work list has a cover per row (phones) and an anchored preview (desktop); both carried `cover-<slug>`. Names are now assigned only after mount, to whichever copy the current width uses (`useMediaQueryAfterMount` in components/ui/use-media-query.ts).
- Scroll sentence ("I blend product thinking…") now centre-aligned on all widths (was offset to the right third on desktop).
- Scroll sentence: "AI products" → "digital products" (also in profile.md). Line height raised (1.55 phone / 1.45 tablet / 1.36 desktop) so the spec labels sit in the gap between lines instead of over the line above; measured 0 overlaps at 375, 768, 1024 and 1440px.

## 2026-10-27 — Hero gradient + gravity tag pile (replaces collab cursors)

- **New dependency: matter-js 0.20.0** (+@types/matter-js). 25.8KB gzipped. Needed for real rigid-body collisions, rotation and stacking. Loaded with dynamic import in the browser only, after the hero mounts, so it isn't in the first-load bundle.
- `components/home/hero-gradient.tsx`: lavender / periwinkle / cyan-white blobs (from Samuel's reference) drifting via CSS animation, leaning towards the cursor (sprung), plus a cursor glow. Dark theme uses the same hues as low glows. Optional dotted/grid pattern. Built from radial gradients, no blur filter: the first version used blur(60px) and dropped the page to 9fps.
- `components/home/tag-pile/`: `pile-engine.ts` (physics, kept out of React), `tag-pile.tsx` (DOM tags), `pile-controls.tsx` ("Play with the pile" popover), `settings.ts`. Content and themes in `content/tag-pile.ts`: 19 tags (branding/visual-identity heavy), 5 themes (Paper, Midnight, Candy default, Mono, Forest) defining fills, inks, font, weight, padding, image size, gloss, border, shadow. Tags can have an image, colour override and link.
- Features: gravity/collisions/stacking; drag & throw (spring constraint, throw = pointer velocity × throw strength); cursor push (mouse only); squash on hard landings; click pops (and opens linked tags); entrance random / in sequence / all at once; Drop again, Replay, Reset; replay when scrolling back (toggle); sliders for gravity, bounce, friction, throw strength.
- Real-time fixed-step loop (1/60s steps from elapsed time, max 4 per frame), paused off screen. Tags are buttons: Enter pops/opens, arrow keys nudge. Reduced motion: pile appears already settled, no squash/push; drag still works.
- Desktop: pile fills the pinned hero and fades out as the intro arrives. Phones: own 480px area under the intro.
- Flag: CLAUDE.md "one ambient motion" rule. The gradient drift is ambient; the pile only moves on entrance or when touched.
- Hero gradient sped up (Samuel): drift 7–10s per sweep (was 18–26s); cursor lean and glow follow faster (stiffer springs).
- Hero name/photo overlap fixed: the name used 6.2vw up to 7.75rem while the hero container caps at 1500px, so from ~1680px EKWENZE ran into the portrait (-58px at 1920). Name size is now min(6.2vw, space beside the portrait / 4.8) via .hero-name-size; gap ≥54px at 1024–2560px, unchanged at ≤1536px.

## 2026-10-28 — "What I do" becomes a rope curved carousel (replaces hanging cards)
- Removed the "Open to full-time roles" availability pill from the hero (desktop + mobile). The contact section's availability line stays.
- Services are now notebook pages pegged along a hanging rope (`components/home/rope-carousel/`), after a reference Samuel shared. The pinned 220vh scroll section and `hanging-cards.tsx` / `scripts/swing-test.mjs` are gone.
- Rope: two half-parabolas meeting at the lowest point (`sag` as a fraction of width, `curve` moves the dip). Cards tilt with the rope's slope × `follow`, plus their own resting lean, plus the same pendulum sway as before, driven by the flow's acceleration.
- One velocity drives everything: autoplay (38px/s left), drag with fling momentum that coasts back to autoplay speed (0.9s), horizontal wheel/trackpad (captured), vertical wheel (page still scrolls; rope drifts along with it so the section never traps the reader), arrow keys and prev/next buttons (snap one card). Any input can take over mid-flight.
- Autoplay pauses on mouse hover and while focus is inside. A pause/play button satisfies WCAG 2.2.2. Reduced motion: no autoplay, no sway, steps jump; drag still works.
- Endless loop renders enough copies to cover the stage plus a card each side; only the first set is exposed to screen readers. Loop sleeps when off screen or at rest.
- All options in `settings.ts`: speed, direction, autoplay, pauseOnHover, clip (peg / binder / tape), sag, curve, top, thickness, color, braid, shadow, follow, width, mobileWidth, gap, ratio, radius, cardShadow, tilt. Pass overrides via `<RopeCarousel settings={…}>`.
- Notebook paper stays light in both themes (it's an object, not chrome): perforated top edge (mask), ruled lines, red margin, highlighter stroke behind the title, tick-box list of the first three tools. Sized in container units so text sits on the lines at any width.
- Follow-up: pause/play button removed at Samuel's request (autoplay still pauses on hover and focus; prev/next remain). Notebook text much larger (title 10cqw, line 6.6cqw, list 6cqw on a 10.6cqw ruled grid), cards 330px / 272px on phones, ratio 0.76. Paper now follows the theme: dark paper with faint blue rules and a softer highlighter in dark, light paper in light. Tick boxes are filled green with a white check. Tool items wrap instead of truncating.
- Fix: autoplay felt stuck after a drag. Causes: the mouse was still hovering (pause on hover), clicking the rope focused it (focus pause), and the 0.9s coast. Now a drag release resumes autoplay even while hovered (until the mouse leaves and comes back), only keyboard focus (:focus-visible) pauses, a fling bleeds off in 0.2s and autoplay picks up from a standstill in 0.08s.

## 2026-10-28 — Hero background: orbiting dot grid (replaces the moving gradient)
- `components/home/dot-grid.tsx`, hero only (desktop + mobile). Canvas at device pixel ratio (capped at 2), ResizeObserver rebuild, colour from the `--ink` token re-read on theme change via MutationObserver (no remount).
- Each dot gets a fixed inclination, ascension and phase (seeded, so they survive resizes). One global clock drives every orbit at the same speed; the cursor only decides which dots are pulled in (smoothstep falloff over the impact radius). Pulled dots orbit the cursor at about their own distance, in their tilted plane, with depth shading (size and opacity). Joining takes 0.12s; leaving winds down over ~0.55s (exponential ease-out).
- Props: color, size (1.1), spacing (24), orbit, speed (1.8 rad/s), radius (130), scale (2.2), rest opacity (0.3). Reduced motion or orbit off: dots only grow and brighten.
- The loop only runs while the cursor is inside or dots are still settling. Bottom 30% fades out with a mask.
- Removed `hero-gradient.tsx`, its CSS, and the pile panel's Background (clean/dotted/grid) option, which the dot grid makes redundant.
- Follow-up: "What I do" label removed; the statement is now the section heading, 72px on desktop (clamps to 40px on phones), centred and balanced. Rope carousel prev/next buttons removed (arrow keys still work once the rope has focus). Dot grid now fades in at the top too (mask) with a 6px backdrop-blur strip, mirroring the bottom fade. The top fade is a fixed 40px (blur strip 56px) so the grid appears right under the nav; percentages put it too low, especially on the much taller mobile hero.

## 2026-10-28 — Selected work as squishy peel stickers; Shots renamed Playground
- Selected work is now a 2-column grid of six sticker cards (`components/home/sticker-grid/`), replacing the hover-preview work list and the "More work" list. Order: the three case studies (Room8, FundPath, Immigify), then HeightGPT, iExcelo, Simplexity (case study soon → "Enter playground"). LAGProperties, PowerRoute and QuitBet are no longer on the home page; they stay in `content/archive.ts`.
- Peel model (`peel-engine.ts`): the corner C is peeled towards a point D. The fold is the perpendicular bisector of C→D; the front keeps the far side (clip-path polygon), the flap is the near side mirrored across the fold with a CSS reflection matrix, so its corner lands on D. The flap's back is a gradient running from the fold (shaded) to the tip, with a drop shadow. D rides a spring (k 190, c 21) towards rest / open / the pointer, so everything is interruptible.
- Rest: the corner curls up ~22% of the short side and flutters in a breeze (two sines on length and angle; `wind` and `windSpeed` settings). Mouse hover lifts it to ~30% as a hint. Pressing squishes the card to 98.5%.
- Drag follows the pointer 1:1; release opens past 42% of the diagonal or on a throw > 700px/s. Click/tap toggles. Open = D pushed past the opposite corner, so the whole sticker leaves the card.
- Underneath ("image-text" mode): the cover behind frosted glass (22px backdrop blur, darkening to the bottom), meta, title, summary, confirmed result, and the CTA: "Read case study", or "Enter playground" plus a "Case study soon" chip. "image-only" mode shows only the picture. A "Stick it back" button closes; Escape too.
- The revealed cover carries the `cover-<slug>` view-transition name (only after hydration), so it still morphs into the case study hero.
- A caption under each card (title, domain, status) keeps the grid scannable without peeling — job #1 is still reaching a case study fast.
- Keyboard: the sticker is a button with aria-expanded; Enter/Space peels it and moves focus to the CTA; closing returns focus to the sticker. Underneath is `inert` while covered. Reduced motion: no breeze, instant state change.
- Placeholders: projects without a cover use `PlaceholderShot` (tint + kind added to archive items), labelled "Placeholder".
- Shots → Playground: route `/playground` (permanent redirect from `/shots`), nav, command menu, sitemap, page title and scripts updated.

## 2026-10-29 — Metrics roll in like an odometer

- `components/ui/rolling-number.tsx`: every digit in a value is a column that spins one full turn of 0–9 and lands on its digit, left to right on the shared stagger (new `--stagger: 50ms` token mirrors `lib/motion.ts`). `--dur-scene` + `--ease-emphasized`. Symbols and words ($, %, +, "downloads…") stay still.
- Used on the home impact stats and case-study outcomes (play once on scroll into view), and on the green result line under coming-soon stickers (plays each time the sticker is peeled; resets instantly when it's stuck back).
- Transforms only. Final value is in the server HTML and in an sr-only span, so no-JS and screen readers never see zeros. Columns get 0.15em headroom (cancelled by negative margin) and a masked edge, because the tight display leading clipped glyphs mid-roll.
- Reduced motion: no roll, the number fades in over `--dur-base`.
- Rejected a JS count-up (0 → 10,000): "$1M" would jump from $0M to $1M with nothing in between, and it re-renders text every frame.

## 2026-10-29 — Arc dial testimonials; Voxdeed and home contact removed

- `components/home/arc-dial/`: portraits sit on the top of a circle; the one at the top is the story, inside a ring that fills during autoplay (7s). One continuous position (motion value) drives every portrait's x/y/scale/opacity, so drag, swipe, horizontal wheel, arrows, arrow keys and picking a portrait all turn the dial the same way, on `spring.gentle`. Releases snap to the nearest portrait; throws carry up to 2 more.
- Geometry is measured: radius `clamp(150, 44% width, 480)`, written to `--R/--S/--arrow-*` so CSS (dotted guide, accent stretch between the arrows, ring) and JS agree. Phones show 2 per side and move the arrows into the counter row, because on the arc they'd collide with the neighbours.
- Per-story colours are registered `@property` colours, so accent, glow and rating cross-fade instead of snapping. Badge/text colours are `color-mix` with the theme ink, so one accent works in light and dark.
- Quote resolves word by word out of a blur; "Read more" appears only when the 4-line clamp actually hides text (ResizeObserver).
- Autoplay pauses on hover, keyboard focus, drag, expanded quote, off-screen, and has an explicit pause button (WCAG 2.2.2: moving content > 5s needs one). Reduced motion: no autoplay, dial jumps, quote fades.
- Content: 8 slots in `content/testimonials.ts`, all PLACEHOLDERS, clearly labelled on the page ("Placeholder, quote not received yet", monogram instead of a face, unfilled stars). Asked for real photos and 8 people, but no testimonials exist yet, and profile.md says never publish one that wasn't given. Must be filled or the section hidden before launch.
- Removed the "Building now: Voxdeed" card and the home contact section (composer, Ask AI links). Footer now carries `id="contact"` so nav/⌘K "Contact" lands on the footer's copy-email; the "Let's work together" marquee is now a mailto link.
- Follow-up: monogram circles replaced with illustrated avatars (Notionists by Zoish, CC0), generated once into `public/testimonials/*.svg`; no runtime dependency. Not photos of real people, deliberately: the quotes are still placeholders, and a real face next to an invented quote would read as a real endorsement. Swap in real photos as quotes arrive.
- Removed the star rating, the pause button in the counter pill, and the "Placeholder, quote not received yet" pill (Samuel's call). Autoplay still pauses on hover, keyboard focus, drag, expanded quote and off-screen, and is off under reduced motion; there's no explicit pause control now (WCAG 2.2.2 risk, flagged).
- Follow-up: illustrated avatars replaced with 8 Unsplash portraits (Samuel's call), saved locally as 400px face crops in `public/testimonials/*.jpg` and served through next/image. Source IDs are listed in content/testimonials.ts. These are strangers' faces standing in for real clients: they must be swapped for the real people's photos, with their permission, before launch, along with the quotes.
- Follow-up: the glow is now a full-width wash in the active story's ring colour (a strong ellipse around the ring plus a soft top-down tint), masked so it fades into the page on every side, and it cross-fades between stories through the registered `--t-glow`. Gotcha: Chrome drops a whole radial-gradient if its size uses `min()`, which silently killed the first version. A faint accent-tinted quote mark sits beside the quote (desktop only).
- Active stretch of the dial is 2.5px and runs ~3× the arrow angle (capped at 40° each side), fading out along the arc instead of stopping at the arrows.
- Follow-up: wash was too wide. Now a single soft pool behind the ring and quote only (min(780px, 100%) × 720px, 500px on phones), drawn as a `closest-side` radial with eased stops that reach transparent at 92%, so it has no edges anywhere and reads like a blurred light. No full-width tint, no masks. Cheaper than a real `filter: blur()` layer, which would repaint a large area on every colour change.
- 2026-10-30: section headings resized. "Selected work samples" 58px and "What people say" 56px (both `clamp(2.25rem, 5vw, …)`, so 36px on phones), subtexts 20px, all copy from Samuel. The "Peel a sticker…" hint was replaced by the new subtext; the resting curl is now the only peel affordance.
- Fix (2026-10-30): on wider phones (~420–640px) and narrow desktops the outer portraits hung into the quote, because their drop scales with the radius while the text started at a fixed offset. The fit step now computes, for every visible portrait whose circle reaches into the text column, how low it hangs, and sets `--content-top` so the badge and quote start below it. Measured zero portrait/text overlap across all 8 stories at 360, 414, 572, 639, 700, 820, 1024 and 1280px.

## 2026-10-30 — Preloader: falling letters

- Replaced the 0 → 100% counter intro (`components/site/intro.tsx`). The first name is set huge as a faint ghost (ink at 7%) on the page colour, so it follows the theme. Its letters drop in one by one from above the screen in a fixed, shuffled order, each in its own colour and spinning, and land in their ghost slot.
- Motion: the fall is gravity (accelerating ease-in), then two small bounces sized in `em` (0.14em, then 0.03em) so the bounce scales with the letter, not the drop height. A first version used a spring sampled into `linear()`, but its overshoot was a percentage of the whole 110vh fall, so letters dipped far below the word. A short squash (scale 1.12 × 0.82 from the baseline) on impact. All WAAPI on transforms, no JS per frame.
- Same plumbing as before: covers the page before JS (letters wait off-screen in CSS so nothing flashes), leaves once every letter has landed plus a beat AND fonts and window load are done (hard cap 3.6s), then the curtain lifts and the hero rises in. Any key or tap skips (~0.6s). Once per session; `?intro` or ⌘K "Replay the intro" replays it.
- Reduced motion: no fall; letters fade in over the ghost, then the overlay fades.
- Status line reads "Getting things up", then "Ready" as it leaves. The "Skip intro" pill is visual; the real skip is any key or tap anywhere.
- Follow-up (Samuel: slower, bigger, smoother exit): letters now let go over ~0.95s (was 0.47s), fall for 1.05s and bounce for 0.85s, then hold 0.7s on the finished word; hard cap 6s. The word is sized in JS to span the screen inside the side padding (16px phones, 32px desktop), re-fitted once the display font loads and on resize, capped at 62% of the viewport height for very wide, short screens. Exit is now a 1.1s opacity dissolve (standard ease) while the word swells to 1.06×, so the hero, already rising in, shows through; the clip-path curtain is gone. Skip still dissolves in 0.5s. Whole intro ≈ 5s on a fast connection.
- Follow-up: the loader now always runs 5s before it fades (`RUN_MS`, measured 4.92–4.97s from the first letter moving), with the drops stretched to fill it (letters let go over 1.4s, fall 1.3s, bounce 1s), then a 1.1s dissolve. Reduced motion keeps a short ~1.2s version, since there's nothing to watch. Kerning: very tight (-0.055em per letter). Note: `letter-spacing` had no visible effect because every letter is its own inline-block (needed for the drop), so the tightening is a negative margin between letter boxes, applied identically to the ghost so the landing spots still match. -0.075em made S/a and e/l overlap; -0.055em keeps them a hairline apart.
- Follow-up (2026-10-30): bouncier landing (three bounces, 0.26em → 0.1em → 0.03em, each with its own squash), then the finished word keeps hopping in a left-to-right wave until it leaves. Exit is no longer a dissolve: at 5s the letters leave one by one, left to right (75ms apart, 560ms each, accelerating), shooting up 75vh and fading, while the paper layer fades by opacity underneath so the hero shows through. Skipping does the same, faster. The page colour now sits on its own `[data-intro-paper]` layer so the exit animates opacity only.
- The intro now plays on every full page load (Samuel: "whenever the site is reloaded"); the sessionStorage once-per-session flag is gone. Client-side navigation never shows it.
- The hero tag pile used to drop on mount, under the preloader, so on a reload it was already settled when the page appeared. It now drops again on INTRO_DONE, so every reload ends with the pile falling as the letters fly off.
- Pile tags: removed "Hi, I'm Samuel", "Art direction", "Campaign design"; Interaction design, Usability testing and Design systems are no longer links (no ↗), since the pile isn't navigation.
- Follow-up: the post-landing hop now plays once (a single wave through the letters, 0.25s after the last one lands, 0.1em high) instead of repeating until exit. Measured one hop per letter.

## 2026-10-30 — "Say hello" contact block, liquid glass

- `components/site/say-hello.tsx`, at the top of the footer on every page (the footer carries `id="contact"`, so nav/⌘K "Contact" lands here). Heading "Your turn. Say hello" (56px, display face, not the reference's pixel serif), 20px subtext in our own words. Row: X, Instagram, [Email me], Dribbble, LinkedIn; on phones the pill takes its own row on top and the circles sit below.
- Email pill: hover/focus lifts "Email me" away and the address rises from below (CSS transitions on transform/opacity, `--dur-base` / `--ease-enter`); click opens mail. Touch screens get the address printed under the pill, since they can't hover. Replaced the footer's old copy-email button and LinkedIn text link.
- Social circles: icon lifts, the network name rises from below in a small glass tag. Networks still TODO in profile.md (all four, for now) render as inert circles with a muted icon and "…, coming soon" instead of a dead link. Add `x_twitter`, `instagram`, `dribbble`, `linkedin` URLs in profile.md to switch them on.
- Liquid glass (`.glass`): translucent tint + `backdrop-filter: blur(14px) saturate(180%)`, a lens rim (gradient border, bright top and bottom, thin at the sides), inner top/bottom highlights, a glint that follows the pointer (CSS vars set on pointermove), springy lift on hover (overshooting cubic-bezier) and sink on press. Tuned separately for light and dark. A faint dot grid sits behind the row so the glass has something to frost. Skipped true refraction (SVG displacement in backdrop-filter): Chromium-only.
- Reduced motion: swaps cross-fade, nothing slides or lifts.
- Follow-up: Dribbble swapped for Behance. Real links from Samuel are now in profile.md (X, Instagram, Behance, LinkedIn), so all four circles are live links opening in a new tab; the "coming soon" inert state remains for any future network left as TODO. Because `linkedin` is no longer TODO, anything else reading `profile.linkedin` (and the Ask agent's source) now sees the real URL too.

## 2026-10-30 — Nav: hidden over the hero, DesignMerlin wordmark

- Header is now one compact, centred glass pill that hugs its content with equal 6px padding on every side and an even gap between items: wordmark | links | theme toggle (phones: wordmark, theme, Menu). The scroll-widening layout animation, search button, header clock and avatar + "Samuel Ekwenze" are gone. ⌘K / Ctrl+K still opens the command menu everywhere; the phone "Menu" button still opens it too.
- Home: hidden while you're on the hero (translated up + transparent, pointer-events off), drops in after 8px of scroll (`--dur-deliberate` / `--ease-enter`), lifts away again back at the top. `:focus-within` reveals it, so keyboard users tabbing in always see it. Other pages show it from the start. The header keeps its sticky 72px slot, so nothing in the hero shifts. Reduced motion: opacity only.
- Wordmark "DesignMerlin" (nav only; the name stays everywhere else) with the animated magic wand emoji 🪄 (Google Noto animated emoji, CC BY 4.0, saved in /public/brand). The 150KB animated webp is only requested once the nav first appears; reduced motion and first paint use the static SVG. Wand tilts on hover.
- Follow-up: avatar is back at the start of the nav pill, before "DesignMerlin" (sits 7px from the pill's top, bottom and left edges, so the padding stays even). Hovering or focusing the wordmark plays a 600ms wobble: tilts left (-12°), right (9°), settles (CSS keyframes on `rotate`, `--ease-standard`); replays on each hover. Reduced motion: no wobble.
- Follow-up: nav first, then the hero moves. The nav now appears after 8px of scroll, and the hero's split (name apart, portrait to the left, pile clearing, intro in) waits through a `HOLD` of 12% of the pinned scroll (≈125px at 720px tall, ≈190px at 1080px) before starting. The section grew 220vh → 245vh and the intro window shifted (0.38–0.62) so the rest of the choreography keeps its pace. Measured: portrait still at 0px moved at 160px of scroll with the nav fully in.

## 2026-10-30 — Hero portrait: illustration by default, pixel reveal of the real photo

- `components/home/pixel-portrait.tsx` replaces the flip card everywhere in the hero (centred, settled on the left, reduced-motion copy, mobile). The scroll-driven 360° turn and the name-card back are gone; `flip-portrait.tsx` deleted.
- Default face is the illustration (`heroPhoto.stylized`). Under the cursor, tiles of an 18-column grid switch to the real photo in steps (2×2 mosaic → single-tile mosaic → sharp), with a per-tile jitter so the edge dissolves instead of drawing a circle; tiles rise in 70ms and drift back over ~550ms, leaving a pixel trail. Canvas at DPR ≤2, mosaic colours pre-averaged once per size, loop only runs while tiles change or the pointer is over it. Keyboard (Enter/Space) and tap dissolve the whole card to the photo and back (random order over ~0.5s). Reduced motion: plain crossfade on hover/focus/tap.
- Two hit-testing bugs found while testing: the tag-pile layer (`inset-0 z-20`) and the invisible intro block both sat over the centred portrait and swallowed the pointer. The pile layer is now pointer-events: none (tags and controls opt back in); the intro takes the pointer only once it's more than half visible.
- The hero waits on a real Ghibli-style render. `public/me/hero-ghibli.jpg` is a STAND-IN made locally with sharp (smoothing + small palette), because generating a style transfer of Samuel's photo needs Weave, which isn't linked to his Figma account. Drop the real render at that path (same framing as the photo, ideally 1080px wide) and it's live; nothing else changes.
- Watermark: the "iJohn" signature is the photographer's credit, so it was left on the real photo (`public/me/hero-real.jpg`, 1080px resize of hero.jpg). The illustration has no mark. Remove it from the real photo only with iJohn's okay, and keep a credit somewhere (e.g. "Photo: iJohn" on the About page).
- Follow-up (2026-10-30): Samuel supplied the real Ghibli-style render; it replaces the sharp stand-in as `public/me/hero-art.jpg` (1080×1350). The "iJohn" signature is retouched out at Samuel's request (feathered patches of the surrounding backdrop), and `public/me/hero.jpg` is overwritten with that clean version so no copy with the mark ships; the untouched original is in git history. The photographer credit stays in code comments ("photo by iJohn"); consider a visible credit on About.
- The render isn't framed like the photo (figure ~18% larger, a little higher), so the reveal would have shown the real face offset from the drawn one. `public/me/hero-photo.jpg` is the clean photo cropped (x 222, y 187, 2440×3050 of the 2880×3600 original) and scaled to 1080×1350, which lines up eyes, smile, shirt and hands with the render; checked with a 50/50 overlay.
- Files renamed (hero-ghibli → hero-art, hero-real → hero-photo) because next/image's optimiser cache kept serving the old stand-in under the same URL.
- Follow-up: grains are now tiny (56 across, ~4–6px on the hero card, was 18 / ~14px), matching the reference GIF. The reveal eases after the cursor (50ms follow) so sweeps are fluid, and the art returns faster: grains settle back in ~0.7s after the cursor leaves (FALL 0.55s → 0.24s), with sharp → mosaic in ~0.1s. The sharp region is now one clipped drawImage per frame instead of one per grain, which keeps the finer grid at 60fps (median 16.7ms frames measured during a sweep).
- Follow-up: "Drop again" / "Play with the pile" moved out of the pile layer into their own bar floating at the hero's bottom left (z above the tags), a size smaller (13px text, 14px icons, tighter padding); the settings panel now opens upward from them (`placement="above"`). They fade out over the first ~12% of the hero's move (gone by ~280px of scroll at 800px tall, just after the nav-first hold), well before the pile itself clears, and come back when you return to the top. Phones keep the bar above their own pile floor, also smaller.

## 2026-10-30 — Liquid glass nav, bigger hero name, full-height dot grid

- Nav pill now uses the same liquid glass material as the contact pills (`--glass-*` tokens): mostly clear tint, `blur(16px) saturate(180%)` of whatever scrolls under it, lens rim (gradient border, bright top/bottom), soft drop shadow. Light and dark tuned through the tokens.
- Hero name: `.hero-name-size` now fills the space between the portrait and the page edge: ~116px from 1600px wide up (container widened 1500 → 1600px, side inset 6% → 3%, -0.02em tracking), ~91px at 1280, ~72px at 1024, always ≥45px clear of the portrait (measured). Kickers ("Product designer", "Design engineer, AI-native") are 20px. Phones: name `clamp(3.5rem, 17.5vw, 8rem)` (66px at 375), kicker 20px.
- Dot grid reaches the top of the page: on home the header no longer reserves its 72px strip (negative margin; it's hidden there until you scroll anyway), the pinned hero is full `100svh` from y=0, and the content layer keeps the old offset so nothing in the composition moved. Removed the top fade and the blur strip that used to sit under the nav. Phones: mobile hero gets the header height back as top padding.
- Follow-up (2026-10-30): preloader word is now Geist (bold) instead of Bricolage, and each falling letter is coloured glass (`.intro-glass`): its colour as a translucent text fill (background-clip: text) lit from the top with a white highlight, so the faint ghost word reads through it, a hairline pale rim and a soft glow in its own colour. The rim is a tight drop-shadow, not -webkit-text-stroke: a stroke traced Geist's overlapping contours and left notches inside the letters. Tight kerning re-tuned for Geist at -0.018em per letter (Geist's own spacing is already tight; -0.055em overlapped). Word sized to /3.2 of the width, still fit to the side padding in JS.
- Follow-up: glass letters reverted to solid colours (Geist stays). Kerning tightened to -0.038em per letter: letters sit edge to edge without cutting into each other (-0.045em clipped the tail of the "a" under the "m").
- Follow-up: preloader word is fitted and centred on its visible ink, not its letter boxes (the "S" starts inside its box and the "l" ends past its own, which left ~33px on the left and ~10–17px on the right). Each glyph is drawn into an offscreen canvas at its box position, the outermost inked columns are found, then the size is set so the ink spans the width minus the side padding and the word is shifted to centre the ink. Measured margins: 33/32px at 1280, 32/31px at 1920, 17/15px at 375 (within 1–2px, antialiasing).
- Fix (phones): the tag pile used to live only in its own 480px floor at the bottom of the mobile hero, so the tags appeared mid-page instead of falling from the top. The pile layer now spans the whole mobile hero (pointer-events off, tags opt in), so tags drop from above the top edge, fall past the name, portrait and intro, and settle on the 480px floor kept at the bottom (measured: start ~-150px, settle 1457–1703px of a 1744px hero on iPhone 13). The pile buttons sit above the layer.
- Follow-up (phones): text-to-pile gap cut from ~240–290px to ~100–125px. The floor under the intro is now just tall enough for the settled pile, `max(280px, calc(580px - 57vw))` (the same tags pile taller on narrower screens), and the intro's bottom padding dropped from 56px to 16px. The pile is physics with random entry, so the gap varies by drop: measured over 3 drops each on iPhone 13 (116–128), Pixel 7 (71–128), iPhone SE (102–104), iPhone 15 Pro Max (69–114).
- Fix (phones): the "Play with the pile" panel opened downward into the pile floor and was cut off by the hero's overflow clip (Replay/Reset and part of the presets hidden). On phones the buttons now sit on the left, stacked ("Drop again" above "Play with the pile", new `stacked` prop), and the panel opens upward over the intro text, where the hero has room. Checked on iPhone 13 and iPhone SE: the whole panel is inside the hero and Reset is hit-testable.
- Fix: "Drop again" glitch. Each tag was made visible a frame before its new position was painted, so it flashed where it had been resting; and on phones the drop started from the top of the (1700px) hero, far above the viewport, so after a tap the old pile vanished and nothing appeared for a while. Now each tag is moved to its start point before it's shown, drops begin at the top of what's on screen, and the first tag goes at once (random spread 0–1.1s, was 0–1.4s). Measured: first tag visible 39ms after the tap, falling from the top of the phone screen.
- "Play with the pile" panel is now liquid glass (`.glass-panel`, same `--glass-*` tokens as nav and contact): tinted paper at 64%, blur(28px) saturate(190%), lens rim, inner top sheen, deep soft shadow, 24px radius; light and dark. Phones get a thicker 88% frost: mobile Chromium blurs a surface this tall too weakly, and the panel opens over the intro paragraph.
- Follow-up: Replay, Reset (pile panel) and the phone nav "Menu" button now use the contact section's liquid glass (`.glass` + new `.glass-btn` row layout): translucent tint, backdrop blur/saturate, lens rim, glint, springy lift on hover, sink on press. Replay is set semibold to stay the primary action. Menu still opens the command menu and is still hidden from 768px up.

## 2026-10-30 — Phone menu

- The phone "Menu" button no longer opens the command menu. It opens `components/site/mobile-menu.tsx`: a modal `<dialog>` glass sheet (`.glass-panel`) with only the nav items (Work, Playground, About, Contact, large display type, current page marked) and a liquid glass "Email me" pill with the address under it, like the footer. Close button, Escape, backdrop tap and following a link all close it; links close it synchronously so the route transition doesn't snapshot a half-closed modal. Drops in from the nav; reduced motion fades. The header passes `email` from the layout. Needed `pointer-events-auto`: the header is pointer-events: none outside the pill.
- "Replay the intro" removed from the ⌘K command menu (the intro plays on every load now). ⌘K keeps search, case studies, pages, copy email and theme for keyboard users.
- Known, pre-existing: on phones, /about → /playground logs "Transition was aborted… Viewport size changed" from the View Transitions API. Navigation still completes; happens without the menu too. Not fixed yet.
- Follow-up: the phone menu is now exactly the nav pill's width and opens 8px under it (measured from the pill when it opens: matched at 37–353px on iPhone 13, 2–318 on iPhone SE, 48–364 on Pixel 7). Type scaled to the narrower sheet: links `clamp(18px, 5.5vw, 22px)`, 48px Email me pill, address at micro size, 24px corners, 16px padding; scrolls inside if a screen is very short.

## 2026-11-20 — iExcelo thumbnail as a device motion ad

- `components/ui/device-mockup.tsx`: a laptop and an iPhone drawn in CSS (no device PNGs), sized in container units so they fit the sticker. Real iExcelo screenshots (`public/work/iexcelo-desktop.webp` 1600px, `iexcelo-mobile.webp` 520px, from Samuel's exports) on a lavender-to-pink wash taken from the site's own palette.
- Motion: when the card is first seen the laptop rises in and the phone slides up beside it with a small turn; then both screens browse slowly up and down (desktop 10s, phone 8s, offset so they don't move in step), holding at each end. CSS animations on transforms only; paused while the card is off screen; reduced motion shows the still devices.
- Wired through `ArchiveItem.mockup` → `StickerWork.mockup`: any archive project with screenshots gets the same treatment instead of the placeholder. It's the sticker's face, so it plays before peeling; the frosted reveal underneath shows the same ad.
- Next.js 16.4.3 → 16.4.6 (and eslint-config-next to match): `next build` started refusing with SecurityFatalError for a known vulnerability in 16.4.3.
- Follow-up: Room8 and FundPath get the same motion-ad thumbnail. They're phone-only apps, so `Mockup` gained a `phones` variant: three CSS phones (one front, two angled behind) that take turns at the front on one 12s loop, each phone 4s apart, 1s glides, z-order switched at the start of each move so the incoming phone passes in front. Screens are 600px captures of the coded prototypes in each case study (Room8: listings, match detail, nearby; FundPath: campaign, receipts ledger, donate sheet), not the old composed covers. Washes from each brand (green, violet). Mockups for case studies live in `content/mockups.ts` and take precedence over the still cover on the sticker; the case study hero still uses the cover image.

## 2026-11-24 — Codebase review and fixes

- Portrait (`pixel-portrait.tsx`): keyboard/tap dissolve often stalled on its first frame (no grain was due yet, so the loop stopped), and a resize wiped the photo while it was switched on. It now runs until the last grain's turn and keeps its state on resize.
- Frame timestamps can predate the event that wakes a loop: the portrait and `dot-grid.tsx` clamp dt, so the first frame no longer runs backwards or jumps to the end.
- Playground → "Viewport size changed" transition abort on phones fixed (the known issue above). The gallery's first client render guessed 3 columns, which overflowed phones by 7px; the column count is now right from the first render and the project label truncates.
- Testimonial dial: after a touch swipe the next tap was swallowed. Dial and stickers also no longer start a drag with no button held (press near an edge, release outside).
- Phone menu closes on a width change instead of staying open over the desktop layout.
- Device mockups: the copy behind an unpeeled sticker (and the sticker copy once peeled) holds still; trio label says "three phones"; the trio starts already fanned.
- Smaller: theme switch interrupted by a page change no longer throws; unique gradient ids on the rope pegs; `profile.md` parses with CRLF endings.
- Device mockups are `isolate`d: the trio's z-index steps escaped the covered copy, so its phones showed through the peel flap and over the revealed title.
