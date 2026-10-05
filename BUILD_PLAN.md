# Portfolio Build Plan

Six phases. Phases 0–2 get you job-ready (target: one weekend plus a few evenings). Phases 3–5 add the signature features.

Each phase has a prompt you can paste straight into Claude Code. Put `CLAUDE.md` in the repo root first.

---

## Phase 0 — Prep (before touching code, ~2–3 hours)

Do this yourself; it determines everything else.

- Pick 3 case studies. Suggested: Immigify AI Consultant Platform, Immigify for Business (or the design system), and one from another domain (Voxdeed or a health/edtech project).
- For each, write a rough 3-line TL;DR and list real outcomes you can stand behind.
- Write `content/profile.md`: bio, roles, timeline, skills, tools, availability, contact. This becomes the AI agent's source of truth.
- In Figma, set up a small page with your type scale, color tokens, and one Index layout. Copy the link.
- Buy the domain.

---

## Phase 1 — Foundation (Day 1)

**Prompt:**

```
Read CLAUDE.md fully. Scaffold the project: Next.js App Router, TypeScript strict,
Tailwind, Motion, MDX with typed frontmatter, pnpm. Set up the folder structure from
CLAUDE.md, ESLint, Prettier, and scripts for lint/typecheck/build.

Then pull my design tokens from this Figma file via the Figma MCP: <FIGMA_LINK>.
Generate /styles/tokens.css (CSS variables, light + dark) and wire them into
Tailwind's theme. If the Figma file is missing something, propose values and
ask me before using them.

Finish by running lint, typecheck, and build. Create NOTES.md with what you did.
```

**Done when:** blank site builds, tokens work in both themes, deployed to a Vercel preview.

---

## Phase 1.5 — Interaction foundation (Day 2)

This is what separates the site from every other portfolio. Build the system before any page.

**Prompt:**

```
Read the "Interaction design system" section of CLAUDE.md. Build the foundation:

1. /lib/motion.ts with duration, easing, spring and stagger tokens. Propose exact
   values first and explain the feel of each; wait for my approval.
2. A useReducedMotion-aware wrapper so every component gets its fallback for free.
3. Route transitions using the View Transitions API with a Motion fallback,
   including a shared-element pattern I can reuse (thumbnail -> hero).
4. A command menu (Ctrl/Cmd+K) with keyboard navigation, fuzzy search across
   pages and case studies, and a considered open/close motion.
5. A /playground page (dev only) showing every token and pattern side by side,
   with a slow-motion toggle.

Write a short interaction spec for each before building. Profile the route
transition on a throttled CPU and report the frame rate.
```

**Done when:** every motion on the site will draw from one token file, and the playground looks like a mini motion design system you could show in an interview.

---

## Phase 2 — Index + case studies (Days 2–3) — job-ready milestone

**Prompt A (Index):**

```
Build the Index page per CLAUDE.md. Before coding, show me a token/layout plan with
an ASCII wireframe for desktop and mobile, and review it against the "avoid these
defaults" list. Wait for my approval.

Content: my bio and status from content/profile.md, 3 featured case studies, a
"Currently building" line for Voxdeed, and contact links. Recruiters must reach a
case study without scrolling on desktop.

Signature interaction: hovering or focusing a project previews it in place;
selecting it morphs the preview into the case study hero (shared-element
transition from Phase 1.5). On touch, tap previews and a second tap opens.
Write the interaction spec first, then build. Screenshot desktop and 375px
mobile, record the transition, and critique before finishing.
```

**Prompt B (case study system):**

```
Build the case study template and components: TLDR, Figure (with caption and
zoom), CompareSlider (before/after, keyboard accessible), DecisionLog (decision,
alternatives rejected, why), Outcome. Render content/work/*.mdx at
/work/[slug] with prev/next navigation and OG images.

Add a scroll-linked reading progress indicator and a sticky decision navigator
that highlights the current section.

Convert my draft for <CASE_STUDY_NAME> into MDX using these components. Do not
invent metrics; mark gaps with TODO comments and list them for me at the end.
```

**Prompt C (embedded prototype, one per case study):**

```
From this Figma frame via the Figma MCP: <FIGMA_LINK>, rebuild the key flow of
<CASE_STUDY_NAME> as an embedded, clickable prototype component. Real states
(empty, loading, error, success), shared motion tokens, keyboard operable,
reduced-motion fallback. Add a "replay" and a "0.25× speed" control, plus a
short caption explaining the interaction decisions. Keep it lazy-loaded.
```

**Done when:** Index + 3 case studies live on your domain, Lighthouse 95+, tested on a real phone on mobile data. Start sending applications from here.

---

## Phase 3 — Lab (ongoing, one experiment a week)

**Prompt (per experiment):**

```
Create a new Lab experiment: <IDEA>. Isolated in /components/lab/<name>, with a
live demo page and an MDX note (100–200 words) explaining the design decisions.
Write the interaction spec first. Add demo controls: replay, 0.25× speed, and
toggles for each state. Keyboard operable, respects reduced motion,
lazy-loaded. Record and critique the interaction before finishing.
```

Aim to cover a range of interaction types across the Lab, since range is the senior signal:

- **Micro-interactions:** a button that morphs through idle → loading → success → error without layout shift
- **Gestures:** a swipe-to-triage queue for immigration case reviews, with springy undo
- **Spatial / navigation:** a dynamic-island-style status pill that expands into a task panel
- **Data interaction:** a scrubbable timeline of a visa application's progress
- **AI-native:** streaming answers with a "thinking" state that isn't a spinner, plus citations that expand inline
- **Legal tech (Voxdeed):** select a contract clause and watch AI annotations attach to it
- **Forms & states:** document upload with progressive verification and recoverable errors
- **Systems:** a live theme/token switcher that reflows your design system in real time

Turn each one into a LinkedIn post the same week.

---

## Phase 4 — "Ask" AI agent (Days 6–8)

**Prompt:**

```
Build the Ask feature per the AI agent rules in CLAUDE.md. Server route at
/app/api/ask using the Claude API with streaming. Ground answers only in
/content (profile, case studies, Lab notes) — load and include them as context.
If something isn't in the content, the agent says so and points to contact.

UI: a clean chat panel, 4 suggested recruiter questions, full keyboard support,
clear error states. Treat this as an AI interaction design showcase: a considered
thinking state, smooth token streaming without layout jank, case study cards
that expand out of the answer (shared-element into the case study page),
suggested follow-ups that animate in after the answer settles, and a
"stop generating" control that interrupts gracefully.
Add IP rate limiting and a response length cap. API key only in env vars.

Then write 15 test questions (including tricky ones like "what's his salary?" or
"did he work at Google?") and show me how the agent answers each.
```

**Done when:** it never fabricates, handles off-topic questions gracefully, and costs are capped.

---

## Phase 5 — Polish + launch (Days 9–10)

**Prompt:**

```
Do a full launch audit: Lighthouse on every page (mobile), accessibility pass
(axe), keyboard-only walkthrough, reduced-motion check, broken links, OG images,
sitemap, robots.txt, analytics (privacy-friendly), and a 404 page.

Then an interaction audit: list every interactive element, confirm it uses motion
tokens, has all states, is interruptible, has a keyboard path and a reduced-motion
fallback, and hits 60fps on a throttled mid-range mobile profile. Flag any two
loud interactions competing on one screen. Fix issues and give me a report.
```

Showcase the interaction work directly:
- Add an "Interaction principles" section to the About page (your six principles, briefly)
- Make the /playground public as a "Motion system" page — it's a portfolio piece in itself

Launch plan:
- LinkedIn post about the build itself ("I built my portfolio with Claude Code + Figma MCP — here's how")
- Short screen recording of the Ask agent and one Lab experiment
- Update headline, resume, and job-board profiles with the new URL

---

## Ongoing

- New Lab experiment weekly.
- Update `content/profile.md` whenever your status changes, so the agent stays accurate.
- Add a case study when Voxdeed has something real to show.
