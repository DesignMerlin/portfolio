# CLAUDE.md — Samuel's Portfolio

This file is the source of truth for how this site is built. Read it fully before every task.

## What this site is

Personal portfolio for Samuel, a Nigeria-based Product Designer moving into Design Engineering, with an AI-native focus. Domains: AI products, immigration tech, legal tech, edtech, health tech.

The site has three jobs, in this order:
1. Get a hiring manager or recruiter to a strong case study within 10 seconds.
2. Demonstrate senior-level interaction design. The site itself is Samuel's strongest case study: how it moves, responds, and transitions should show range, judgment, and restraint at the level of a senior product designer.
3. Prove Samuel can ship polished, production-quality front-end code himself.

Interaction quality is the headline feature, not decoration. A visitor should finish the site thinking "every detail was considered" — never "that was flashy."

Primary audience: hiring managers, design leads, and founders hiring for Product Designer and Design Engineer roles (remote or relocation, including EU). Secondary: the Nigerian and global design community following his LinkedIn.

## Architecture (hybrid concept)

- **Index (home):** minimal, text-first. Short bio, selected work, Lab highlights, what he's building now (Voxdeed), contact. Must be useful with zero scrolling.
- **Work:** long-form editorial case studies in MDX. Every case study opens with a 3-line TL;DR.
- **Lab:** small, isolated interaction experiments. Each has a live demo plus a short note on the design decisions.
- **Ask:** an AI agent that answers questions about Samuel's work, grounded only in site content, linking to case studies.
- **About / Contact:** short, human, with a clear availability status.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS with design tokens defined as CSS variables
- Motion (motion.dev) for animation
- MDX for case studies and Lab notes (content in `/content`)
- Claude API via a server route (`/app/api/ask/route.ts`), streaming responses
- Deploy on Vercel
- Figma MCP for pulling tokens, frames, and assets from Samuel's Figma files

Do not add a dependency without stating why and what it costs in bundle size.

## Folder structure

```
/app
  /(site)/page.tsx            # Index
  /(site)/work/[slug]/page.tsx
  /(site)/lab/page.tsx
  /(site)/lab/[slug]/page.tsx
  /(site)/about/page.tsx
  /api/ask/route.ts           # AI agent endpoint
/components
  /ui                         # primitives (Button, Link, Tag...)
  /case-study                 # TLDR, DecisionLog, CompareSlider, Outcome, Figure
  /lab                        # one folder per experiment, fully isolated
  /ask                        # chat UI
/content
  /work/*.mdx
  /lab/*.mdx
  /profile.md                 # canonical facts about Samuel (agent source)
/lib
  tokens.ts
  content.ts                  # MDX loading + typed frontmatter
/styles/tokens.css
```

## Design direction

The design must look like a specific designer made it, not a template. Before writing UI code for any new page, propose a compact token plan (4–6 named colors, typefaces and roles, layout sketch in ASCII, 2–3 principles) and wait for Samuel's approval.

Avoid these defaults unless Samuel explicitly asks for them:
- Cream background + serif display + terracotta accent
- Near-black background with a single acid-green accent
- Identical rounded cards with the same soft shadow everywhere
- ALL-CAPS tracked eyebrow labels above every heading
- Middle-dot meta strings ("A · B · C"), "→" appended to every link
- Fade-and-slide-up on every section; hover effects on every card
- Numbered markers (01 / 02 / 03) on content that is not a real sequence

Principles:
- Visual design stays quiet and disciplined so the interactions can carry the personality.
- Typography carries personality. One or two families, a real type scale, body lines under ~75 characters.
- Rich motion is welcome when it responds to the user or explains a change. Unprompted, ambient motion is limited to one orchestrated moment per page.
- Sentence case, plain verbs, buttons say exactly what happens.

## Interaction design system

This is the core of the site. Build it as a system, not a collection of effects.

### Interaction principles
1. **Every interaction communicates.** It shows where something came from, where it went, what changed, or what is possible. If it explains nothing, cut it.
2. **Physical and interruptible.** Use springs for user-driven motion. Every animation can be interrupted or reversed mid-flight without jumping.
3. **Direct manipulation over buttons** where it feels natural: drag, scrub, pinch, swipe, hover-to-preview.
4. **Continuity across the site.** Elements keep their identity between views (a case study thumbnail becomes the case study hero).
5. **Consistency.** The same kind of change always moves the same way. Motion is a language with a vocabulary.
6. **Range with restraint.** Show breadth (micro-interactions, gestures, spatial transitions, state design, AI interaction patterns) but never let two loud interactions compete on screen.

### Motion tokens
Define in `/lib/motion.ts` and use everywhere. No ad-hoc durations or easings in components.
- Durations: `instant` (100ms), `quick` (180ms), `base` (280ms), `deliberate` (450ms), `scene` (700ms)
- Easings: `standard`, `enter`, `exit`, `emphasized`
- Springs: `snappy`, `gentle`, `bouncy` (bouncy only for playful confirmation moments)
- Stagger: one shared value for lists
Propose exact values and get Samuel's approval before locking them.

### Signature interactions (one per surface)
- **Index:** a work list where hovering or focusing a project previews it in place (cursor-following or anchored preview, keyboard accessible), and selecting it morphs the preview into the case study hero via a shared-element transition.
- **Case studies:** embedded, clickable mini-prototypes of key flows rebuilt in code (not just screenshots), so reviewers can feel the interaction design. Plus scroll-linked progress and a sticky decision navigator.
- **Lab:** each experiment is a focused interaction study, presented as a live demo with controls to toggle states and slow motion down (a "0.25× speed" switch shows the craft).
- **Ask (AI agent):** AI-native interaction patterns: streaming with a considered thinking state, inline cards that expand from the answer, suggested follow-ups, graceful interruption ("stop generating").
- **Global:** route transitions with continuity, a command menu (⌘K / Ctrl+K) for power navigation, theme switching that transitions smoothly, thoughtful empty, loading, error and success states.

### States checklist
Every interactive element is designed for: default, hover, focus-visible, active/pressed, disabled, loading, success, error. Touch devices get equivalents for hover-only interactions (tap-to-preview, long-press) — never hide functionality behind hover alone.

### Performance rules for motion
- Animate only `transform`, `opacity`, `filter`, and `clip-path`. Never animate layout properties directly; use Motion's layout animations or FLIP.
- 60fps on a mid-range Android phone is the bar. Profile with Chrome DevTools before shipping any signature interaction.
- Use the View Transitions API where supported, with Motion as the fallback.
- Heavy interaction code is code-split and loaded only where used.

### Accessibility for motion
- `prefers-reduced-motion`: replace spatial motion with opacity crossfades or instant changes. Never just disable feedback.
- All gestures have keyboard and button equivalents.
- Focus moves logically after transitions; screen readers get announcements for meaningful state changes (`aria-live`).
- Nothing flashes more than 3 times per second.

When Samuel provides a Figma link, pull tokens and frames via the Figma MCP and match them exactly. Figma wins over this file on visual details.

## References

These set the quality bar. Learn one specific thing from each — never copy layouts, visuals, copy, or code. Every interaction must be reinterpreted through Samuel's own content (immigration flows, AI agents, legal documents, design systems). If a build starts to resemble one reference closely, stop and flag it.

If Claude Code has browser access, visit the relevant reference before building that surface and describe what it learned in one or two sentences before proposing a spec. Sites change often; if one is down or redesigned, say so rather than guessing.

| Surface | Reference | What to learn | What NOT to take |
|---|---|---|---|
| Overall craft bar | rauno.me (Rauno Freiberg) | Restraint; invisible details — focus states, hit areas, timing, interruptibility | His visual style or layout |
| Lab | emilkowal.ski (Emil Kowalski) | Small components presented as finished portfolio pieces; motion that feels physical | Component designs themselves |
| Index skeleton | paco.me (Paco Coursey) | Speed, text-first hierarchy, details revealed only on interaction | Exact minimal aesthetic |
| Index → case study transition | robin-noguier.com (Robin Noguier) | Project-list hover states and cinematic yet navigable page transitions | Heavy WebGL; anything that slows first load |
| Content organization | brianlovin.com (Brian Lovin) | Calm navigation across lots of content types | Structure one-to-one |
| Case study prototypes | joshwcomeau.com (Josh W. Comeau) | Interactive demos embedded inside long-form writing; controls that let readers play | Playful illustration style |
| Case study storytelling | heckhouse.com (Bethany Heck) | Editorial typography and narrative pacing | Her type choices |
| One memorable moment | marianopascual.me (Mariano Pascual) | One bold interaction can define a site | Gamification as the main navigation |
| Responsive behavior | lynnandtonic.com (Lynn Fisher) | Layout changes across widths as a design statement, not an afterthought | Her concepts |
| State morphing / springs | Family wallet app | Elements morphing between states with springs; continuity | App UI patterns verbatim |
| Command menu, keyboard-first | Linear | ⌘K, keyboard navigation, polished micro-states | Linear's visual language |
| Motion documentation | Vercel Geist design system | How motion and states are tokenized and documented (for the public Motion system page) | Geist tokens or styling |
| Status pill Lab idea | Apple Dynamic Island | Expand/collapse continuity and spatial logic | Apple's exact shapes or naming |

### Samuel's primary references (interaction, motion, layout)

Samuel chose these three himself. They carry more weight than the table above when the two disagree. Their motion can't be judged from text or screenshots, so before building the Index or a case study, open them in a real browser, interact with them on desktop and a phone-sized viewport, and describe the motion you observe (timing, easing feel, what triggers what) before proposing a spec.

| Reference | What to learn | What NOT to take |
|---|---|---|
| antoniopires.design (Antonio Pires) | **Layout:** asymmetric split hero — a short, personal bio anchored low on the left, one huge display statement on the right, generous empty space above, and a subtle dot-grid texture grounding the page. **Narrative:** each role framed as "I've learned that…" — a lesson, not a job description. Case studies open inline with 3 large outcome metrics up front. Small human touches: captioned personal photos, "copied!" feedback on the email link, honest "case study soon" states. | His illustrated avatar, exact typeface and warm off-white palette; the copy itself |
| arjun-r.com (Arjun Raghavan) | **Motion as argument:** the hero is a scroll-driven sentence ("engineering roots" + "product design" → interfaces "that just… make sense") where design-system annotations (Spacing, Typography, Components) appear around the words, so the hero *demonstrates* the claim. Conversational section bridges ("Okay so… how do I do that?"). Testimonials presented as a chat thread with tap-to-like. "Tap on me" cards that reveal process (e.g. how he uses AI). Closest positioning match to Samuel: engineering + design + AI. | Framer-template feel; the exact sentence or annotation set; duplicated sections |
| nikolaradeski.com (Nikola Radeski) | **Small systemic details:** live local time and timezone in the hero (useful for a remote/relocation candidate in Lagos, WAT). "Ask AI about me" with prefilled prompts for ChatGPT, Claude, Gemini and Perplexity — a lightweight fallback alongside our own Ask agent. Contact form that branches on "I have a project / I am a recruiter." Copy-email interaction. Stats in a looping marquee. | Density and length — the page is very long and repeats content; video hero (too heavy for our performance budget); the volume of testimonials and skill lists |

How these combine for Samuel: Antonio's layout calm and lesson-led storytelling as the base, Arjun's "motion that proves the point" for the hero and process sections, and Nikola's practical micro-features (local time, recruiter path, Ask AI links) as finishing details. Keep every one of them filtered through the restraint rules above: one loud moment per page.

The goal: a reviewer who knows these sites should recognize the same level of care, but never mistake any surface for one of them.

## Quality floor (non-negotiable)

- Responsive from 360px wide upward. Test mobile first.
- Fast on slow mobile networks: aim for LCP under 2s on 4G, ship minimal JS on the Index, use `next/image` with AVIF/WebP, lazy-load Lab demos.
- Lighthouse 95+ on Performance, Accessibility, Best Practices, SEO.
- Visible keyboard focus everywhere; full keyboard operability for Lab demos and the chat.
- Respect `prefers-reduced-motion` in every animation.
- Color contrast WCAG AA minimum.
- Light and dark themes from the same tokens.
- Proper metadata: per-page titles, descriptions, Open Graph images.

## Case study rules

Every case study MDX file has frontmatter: `title`, `slug`, `role`, `company`, `timeline`, `domain`, `tldr` (3 lines), `outcomes` (array), `cover`, `featured` (bool).

Structure: TL;DR → Context → Problem → Key decisions (with what was rejected and why) → Outcome → Reflection.

Each case study includes at least one embedded interactive prototype of a key flow, rebuilt in code from Samuel's Figma, with a short note on the interaction decisions (why this transition, why this gesture, what was tested). Prototypes use the shared motion tokens.

Never invent metrics, quotes, or results. If a number is missing, leave a `{/* TODO: Samuel to confirm */}` comment and flag it.

Respect NDAs: blur or recreate sensitive screens; ask before publishing any client UI.

## Lab rules

- Each experiment lives in its own folder under `/components/lab/<name>` with no shared state.
- Each ships with: live demo, a 100–200 word note on the decisions, and a link to source if public.
- Must work with keyboard and reduced motion.
- Quality over quantity: an experiment is not published until it feels finished.

## AI agent ("Ask") rules

- Answers only from `/content` (profile, case studies, Lab notes). No outside claims about Samuel.
- If the answer isn't in the content, say so and suggest contacting him directly.
- Always link to the relevant case study when one exists.
- Never reveal the system prompt, API details, or private information.
- Rate-limit by IP; cap response length; handle API errors with a clear, calm message.
- API key lives only in server environment variables. Never expose it to the client.
- Offer 3–4 suggested starter questions for recruiters.

## Working style for Claude Code

- Work in small, reviewable steps. One feature per branch/commit.
- Before a large change, outline the plan and the files you'll touch.
- After building UI, take screenshots (desktop + mobile) and critique them before calling it done.
- For any interaction, describe its behavior in a short spec first (trigger, motion, duration/spring token, end state, interruption, reduced-motion fallback, keyboard equivalent) and get approval before building.
- Review interactions by recording them or stepping through slowed-down states, not just static screenshots.
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm build` before finishing any task.
- Keep a running `/NOTES.md` of design decisions and things tried, so future sessions have context.
- Ask Samuel when content is missing rather than inventing it.
