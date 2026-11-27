/** About page content, mirrored from content/profile.md (DRAFT lines are Samuel's to edit there and here). */

/**
 * Hero intro, shown in bold beside the portrait. DRAFT in Samuel's voice, written from profile.md facts
 * (the structure was inspired by a reference he shared; the wording is his own). Samuel to edit freely.
 */
export const heroIntro = [
  "Hi, I'm Samuel. I design and build products, websites, and the odd idea that started with “what if it could just…”. For over 3 years I've been turning complicated, high-stakes processes into things that feel simple, useful and a little more human.",
  "I care about clear typography, small interactions done well, ambitious teams, and software people genuinely enjoy using. Along the way I've designed for an AI immigration platform, fintech and edtech startups, real estate, a legal tech product I'm co-founding, and my own side projects. This site is a bit of all of it.",
];

/**
 * Hero portrait (photo by iJohn). `stylized` is the Ghibli-style render shown by default; hovering
 * reveals `src`, the real photo. The two are aligned for the tile-by-tile reveal: hero-photo.jpg is
 * hero.jpg (signature retouched out) cropped and scaled so the face, shirt and hands sit where the
 * render draws them. Both 1080×1350. Replacing either means re-aligning the other.
 */
export const heroPhoto: { src: string | null; stylized: string; alt: string } = {
  src: "/me/hero-photo.jpg",
  stylized: "/me/hero-art.jpg",
  alt: "Samuel Ekwenze smiling with arms crossed, wearing a blue plaid shirt",
};

export const bio = [
  "I design for moments where getting it wrong costs people something: a visa application, a legal document, an exam, someone's savings. That's shaped how I work. I start with the person and the pressure they're under, then work backwards to the interface.",
  "As the first product designer at Immigify, an AI-powered immigration platform, I owned everything a user could touch: the marketing site, the AI agent interfaces, the consultant CRM, and the multi-tenant SaaS dashboards. I built the design system from zero, 100+ tokens and a reusable component library, so that a small team could move fast without the product falling apart. During that time the company raised a $1M pre-seed round.",
  "Before and alongside that I freelanced and contracted across fintech, edtech, real estate and AI, including HeightGPT, an AI mobile app that hit 10,000 downloads in its first week.",
  "Today I'm doing two things at once: co-founding Voxdeed, an AI legal tech product, and growing from product designer into design engineer, building interfaces in code with AI as a daily collaborator. This portfolio is part of that. I designed it, and I built it.",
];

export type Role = { when: string; company: string; where: string; title: string; lesson: string; proof: string[] };

export const experience: Role[] = [
  {
    when: "Now",
    company: "Voxdeed",
    where: "Lagos",
    title: "Co-founder",
    lesson: "Building an AI legal tech product from zero: brand, product, and go-to-market.",
    proof: ["Pre-launch."],
  },
  {
    when: "Apr 2025 to Sep 2026",
    company: "Immigify Inc.",
    where: "Texas, USA",
    title: "Founding product designer",
    lesson: "I've learned that when you're the only designer, the design system is your team.",
    proof: [
      "First product designer; owned end-to-end design across web and mobile.",
      "Built and documented the design system from scratch: 100+ tokens, reusable components, accessibility standards.",
      "Turned complex immigration compliance workflows into task-focused interfaces for consultants handling high-volume casework.",
      "Designed conversational AI agent interfaces with engineering and AI teams to reduce onboarding friction and improve task completion.",
      "Ran user research, usability testing and design reviews; delivered annotated specs and Figma prototypes.",
      "The company raised a $1M pre-seed round during my tenure.",
    ],
  },
  {
    when: "Nov 2025 to Feb 2026",
    company: "iExcelo",
    where: "Lagos",
    title: "UI/UX designer, contract",
    lesson: "I've learned that one product can hold three very different mental models.",
    proof: [
      "Designed the landing page and core platform for a Nigerian edtech product (WASSCE exam revision).",
      "Student dashboard, revision workflows and progress tracking reduced time-to-task by 30%.",
      "Multi-persona UX across three journeys: students, sponsors, affiliates.",
    ],
  },
  {
    when: "2024 to 2025",
    company: "Boulevard Legacy",
    where: "NYC, USA",
    title: "UI/UX designer, freelance",
    lesson: "I've learned that launch week tells you the truth.",
    proof: [
      "HeightGPT: led UX and UI for an AI-powered mobile app from research to App Store and Google Play launch; 10,000+ downloads.",
      "Simplexity: end-to-end UX and UI for a LinkedIn data extraction web app; reduced manual research effort by 25%.",
      "Budget tracker: turned complex financial data into accessible dashboards.",
    ],
  },
  {
    when: "2024",
    company: "LAGProperties",
    where: "Lagos",
    title: "UI/UX designer, contract",
    lesson: "I've learned that testing early is cheaper than being confident.",
    proof: [
      "End-to-end UI/UX for a mobile real estate app: flows, wireframes, high-fidelity screens, interactive prototypes.",
      "Research and usability testing improved user satisfaction scores by 10%.",
      "Delivered specs and assets on schedule without slowing engineering.",
    ],
  },
];

/**
 * Home page work experience: the CV's "Work experiences" list (Samuel E.O UX CV.pdf), in years only, newest first.
 * Samuel corrected iExcelo to Nov 2025 - Feb 2026 and added Voxdeed (co-founder, present; no start date given).
 * Links and logos only where the CV links to the company's site.
 */
export type Job = { company: string; role: string; years: string; href?: string; logo?: string };

export const workExperience: Job[] = [
  { company: "Voxdeed", role: "Co-founder", years: "Present", href: "https://www.voxdeed.com/", logo: "/brand/voxdeed.webp" },
  { company: "Immigify Inc.", role: "Founding Product Designer", years: "2025 — 2026", href: "https://immigify.com/", logo: "/brand/immigify.webp" },
  { company: "iExcelo", role: "UI/UX Designer", years: "2025 — 2026", href: "https://iexcelo.com/", logo: "/brand/iexcelo.webp" },
  { company: "Boulevard Legacy", role: "UI/UX Designer", years: "2024 — 2025" },
  { company: "LAGProperties", role: "UI/UX Designer", years: "2024", logo: "/brand/lagproperties.webp" },
];

export type Skill = { name: string; line: string; detail: string; tools: string[] };

export const skills: Skill[] = [
  {
    name: "Interaction design",
    line: "I design how AI products behave, not just how they look.",
    detail: "Conversational agents, streaming states, and flows people can trust when the stakes are high.",
    tools: ["AI agent and conversational interfaces", "Interaction design and prototyping", "User research and usability testing", "Accessibility"],
  },
  {
    name: "Product design",
    line: "I turn rough ideas into products people can actually use.",
    detail: "MVPs, investor decks, and the thinking that holds them together.",
    tools: ["MVP design", "Pitch decks", "Storyboards", "Figma, Figma Make"],
  },
  {
    name: "Design systems",
    line: "I build the system so the team can move fast without breaking things.",
    detail: "Tokens, components, and documentation that make design-to-dev handoff boring in the best way.",
    tools: ["Design tokens (100+ shipped at Immigify)", "Component libraries", "Accessibility standards", "Developer handoff and specs"],
  },
  {
    name: "Website design",
    line: "I build sites that ship, not mockups that wait.",
    detail: "From first sketch to live URL, no handoff required.",
    tools: ["Framer", "Figma", "Vercel", "AI-assisted build workflows"],
  },
  {
    name: "Visual design",
    line: "I make brands look like they mean it.",
    detail: "Identity, campaigns, and the details that make a brand feel expensive.",
    tools: ["Adobe Creative Suite", "Logo and brand identity", "Social media visuals", "Campaign design"],
  },
];

export const principles = [
  { title: "Start with the pressure.", body: "Who's stressed, what's at stake, and what happens if they get it wrong." },
  { title: "Prototype to learn, not to impress.", body: "Quick, rough, tested early." },
  { title: "Design the system, not just the screen.", body: "Tokens and components first, so the product stays consistent as it grows." },
  { title: "Make AI earn trust.", body: "Show what it's doing, let people correct it, never hide uncertainty." },
  { title: "Ship it.", body: "A live product teaches more than a perfect mockup." },
];

export const aiProcess = [
  { step: "Research faster", detail: "Claude helps me map a domain, summarise interviews and find the questions I haven't asked yet." },
  { step: "Explore more directions", detail: "I generate and discard more options than I could by hand, so the one I keep has competition." },
  { step: "Build it for real", detail: "With Claude Code and Codex I turn designs into working prototypes in code, like this site." },
  { step: "Then slow down", detail: "For the parts AI can't do: deciding what matters, and caring how it feels." },
];

export const tools = ["Figma", "Figma Make", "Framer", "Vercel", "Adobe Creative Suite", "Claude", "Codex", "Claude Code", "Next.js and Tailwind (learning in public)"];

/** From the CV (Samuel E.O UX CV.pdf): the professional headline and its summary */
export const headline = {
  title: "Product and Visual Designer",
  /** Each domain previews the project behind it */
  domains: [
    { name: "immigration technology", slug: "immigify-case-tracker" },
    { name: "edtech", slug: "iexcelo" },
    { name: "fintech", slug: "fundpath" },
    { name: "real estate", slug: "lagproperties" },
  ],
  summary:
    "Lead designer on an AI-powered immigration SaaS platform, responsible for the website, AI agent interfaces, CRM and consultant dashboards, and a design system of 100+ tokens and reusable components.",
};

export const cvNumbers = [
  { value: "10,000+", label: "active users across shipped products" },
  { value: "10,000", label: "downloads in week one for an AI mobile app" },
  { value: "500+", label: "users on an AI community platform" },
  { value: "100+", label: "design tokens in one system" },
  { value: "25%", label: "less manual effort for users" },
  { value: "10%", label: "better task completion" },
];

export const education = [
  { what: "Associate Degree, Computer Science", where: "University of the People, USA", when: "2024 to present" },
  { what: "Diploma in Product Design, Distinction", where: "Vephla University, United Kingdom", when: "2023 to 2024" },
  { what: "BSc Business Administration and Management", where: "University of Lagos, Akoka", when: "2015 to 2019" },
];

export const certifications = [
  "Google UX Design Professional Course, Coursera",
  "Graphics Design Course, Wootlab Foundation",
  "Product Design, Vephla University",
  "Certificate of National Service, NYSC",
];

export const achievements = [
  { title: "1st runner-up, Axia Africa Design Challenge", detail: "Placed ahead of hundreds of designers across the continent." },
  { title: "Finalist, HNG Internship, product design track", detail: "Stood out from thousands of participants in a fast-paced, collaborative programme." },
];

export const cvSkills = [
  "User research",
  "Information architecture",
  "Wireframing",
  "Prototyping",
  "Interaction design",
  "Design systems",
  "Accessibility",
  "Developer handoff",
  "Agile and Scrum",
  "AI-native design with Claude and Codex",
];
