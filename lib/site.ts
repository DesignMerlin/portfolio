// Site copy, taken from content/profile.md (the canonical source of facts).
// If a fact changes, change it in profile.md first, then here.
// Lines that are DRAFT in profile.md are live drafts here too, for Samuel to edit.

export const site = {
  name: "Samuel Ekwenze",
  shortName: "Samuel",
  role: "Product designer & design engineer",
  email: "psalmuhel.ekwenze@gmail.com",
  location: "Lagos, Nigeria",
  city: "Lagos",
  timeZone: "Africa/Lagos",
  timeZoneLabel: "WAT",
  availability: "Open to full-time product design and design engineering roles",
  availabilityDetail: "Remote, or relocation (including the EU).",
  // TODO(Samuel): add LinkedIn, X, Behance and CV URLs in profile.md, then here.
  links: [] as { label: string; href: string }[],
} as const;

export const hero = {
  statement: "Designing AI products that people trust, and building them myself.",
  lead: "Lead designer behind an AI-powered immigration platform, now shaping how legal tech feels at Voxdeed.",
} as const;

export const now = {
  label: "Now",
  text: "Founding Voxdeed, an AI legal tech product. Pre-launch.",
} as const;

export const about = {
  // profile.md's About opener, split into a headline and a lead.
  headline: "I design for moments where getting it wrong costs people something.",
  lead: "A visa application, a legal document, an exam, someone's savings. That's shaped how I work. I start with the person and the pressure they're under, then work backwards to the interface.",
  paragraphs: [
    "As the first product designer at Immigify, an AI-powered immigration platform, I owned everything a user could touch: the marketing site, the AI agent interfaces, the consultant CRM, and the multi-tenant SaaS dashboards. I built the design system from zero (100+ tokens and a reusable component library) so that a small team could move fast without the product falling apart. During that time the company raised a $1M pre-seed round.",
    "Before that I freelanced and contracted across fintech, edtech, real estate and AI, including HeightGPT, an AI mobile app that hit 10,000 downloads in its first week.",
    "Today I'm doing two things at once: founding Voxdeed, an AI legal tech product, and growing from product designer into design engineer, building interfaces in code with AI as a daily collaborator. This portfolio is part of that. I designed it, and I built it.",
  ],
} as const;

export type Role = {
  period: string;
  company: string;
  place: string;
  title: string;
  lesson: string;
  proof: string[];
  caseStudy?: string;
};

export const experience: Role[] = [
  {
    period: "Now",
    company: "Voxdeed",
    place: "Lagos",
    title: "Founder",
    lesson: "Building an AI legal tech product from zero: brand, product, and go-to-market.",
    proof: ["Pre-launch."],
  },
  {
    period: "2025–2026",
    company: "Immigify Inc.",
    place: "Texas, USA",
    title: "Founding Product Designer",
    lesson:
      "When you're the only designer, the design system is your team. Building 100+ tokens and shared components early meant every new screen got easier, not harder.",
    proof: [
      "Owned end-to-end design across web and mobile as the first product designer.",
      "Built and documented the design system from scratch: 100+ tokens, reusable components, accessibility standards.",
      "Designed conversational AI agent interfaces with the engineering and AI teams.",
      "The company raised a $1M pre-seed round during my tenure.",
    ],
    caseStudy: "immigify",
  },
  {
    period: "2024–2025",
    company: "Boulevard Legacy",
    place: "New York, USA",
    title: "UI/UX Designer, freelance",
    lesson:
      "Launch week tells you the truth. HeightGPT reached 10,000 downloads in its first week, and the real design work started when people began using it.",
    proof: [
      "HeightGPT: led UX and UI from research to App Store and Google Play launch.",
      "Simplexity: end-to-end UX and UI for a LinkedIn data extraction tool; reduced manual research effort by 25%.",
    ],
    caseStudy: "heightgpt",
  },
  {
    period: "2024–2025",
    company: "iExcelo",
    place: "Lagos",
    title: "UI/UX Designer, contract",
    lesson:
      "One product can hold three very different mental models. Students, sponsors and affiliates each needed the platform to make sense in their own way.",
    proof: [
      "Designed the landing page and core platform for a WASSCE exam revision product.",
      "Student dashboard, revision workflows and progress tracking reduced time-to-task by 30%.",
    ],
    caseStudy: "iexcelo",
  },
  {
    period: "2024",
    company: "LAGProperties",
    place: "Lagos",
    title: "UI/UX Designer, contract",
    lesson:
      "Testing early is cheaper than being confident. Usability findings drove the changes that lifted satisfaction scores by 10%.",
    proof: ["End-to-end UI/UX: flows, wireframes, high-fidelity screens, interactive prototypes."],
    caseStudy: "lagproperties",
  },
];

export const principles = [
  {
    title: "Start with the pressure.",
    body: "Who's stressed, what's at stake, and what happens if they get it wrong.",
  },
  {
    title: "Prototype to learn, not to impress.",
    body: "Quick, rough, tested early.",
  },
  {
    title: "Design the system, not just the screen.",
    body: "Tokens and components first, so the product stays consistent as it grows.",
  },
  {
    title: "Make AI earn trust.",
    body: "Show what it's doing, let people correct it, never hide uncertainty.",
  },
  {
    title: "Ship it.",
    body: "A live product teaches more than a perfect mockup.",
  },
] as const;

export const aiProcess =
  "I use Claude and Codex to research faster, explore more directions, and build working prototypes in code. Then I slow down for the parts AI can't do: deciding what matters, and caring how it feels.";

export const recognition = [
  "1st Runner-Up, Axia Africa Design Challenge",
  "Finalist, HNG Internship (Product Design track)",
] as const;

export const tools = [
  "Figma",
  "Figma Make",
  "Framer",
  "Vercel",
  "Adobe Creative Suite",
  "Claude",
  "Codex",
  "Claude Code",
  "Next.js and Tailwind (learning in public)",
] as const;

export const contact = {
  headline: "Got a hard problem? Let's make it make sense.",
} as const;
