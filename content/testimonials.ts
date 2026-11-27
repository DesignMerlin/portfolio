/**
 * Testimonials for the arc dial on the home page: the people Samuel worked with, with the photos he supplied
 * (2026-11-27).
 *
 * Every quote here is a DRAFT written for that person to approve, built only from Samuel's documented work
 * with them (content/about.ts). None of them has said these words yet, so each stays hidden on the site
 * (placeholder: true) until Samuel confirms the person has read it and agreed, as written or with their edits.
 * Then: put their wording in quote, set placeholder: false, and verifiedVia if it's also a public LinkedIn
 * recommendation. Never publish a quote the person hasn't given. The message to send is in profile.md.
 */
export type Testimonial = {
  id: string;
  quote: string;
  /** null until the person is confirmed; the dial shows `source` instead */
  name: string | null;
  role: string;
  company: string;
  /** Who this slot is for */
  source: string;
  /** A square face crop in /public/testimonials/, from the photo the person (or Samuel) supplied */
  photo: string | null;
  /** A confirmed result for the project they're talking about */
  result?: string;
  /** Where it can be checked, e.g. "LinkedIn recommendation" */
  verifiedVia?: string;
  /**
   * True until the person has read the quote and said yes (edited or not). Hidden on the site until then.
   * The quotes below were drafted for them to approve, from Samuel's documented work with each.
   */
  placeholder: boolean;
  /** Per-story colours. Mixed with the theme, so one value works in light and dark */
  colors: { accent: string; glow?: string; text?: string };
};

export const testimonials: Testimonial[] = [
  {
    id: "emma-seyi",
    quote:
      "As our founding product designer, Samuel owned the product end to end, on web and mobile. He took immigration casework that was genuinely complicated and turned it into screens our consultants could move through quickly, and he did it while we were raising our pre-seed round.",
    name: "Emma Seyi",
    role: "Co-founder and CEO",
    company: "Immigify",
    source: "Immigify, co-founder and CEO",
    photo: "/testimonials/emma-seyi.jpg",
    result: "$1M pre-seed raised",
    placeholder: true,
    colors: { accent: "#3b6cf6" },
  },
  {
    id: "deji-adesola",
    quote:
      "Samuel built our design system from nothing: more than a hundred tokens, reusable components and accessibility standards, all documented. His annotated specs and Figma prototypes made handoff easy, and he worked through the AI agent interfaces side by side with our engineers.",
    name: "Deji Adesola",
    role: "Co-founder and CTO",
    company: "Immigify",
    source: "Immigify, co-founder and CTO",
    photo: "/testimonials/deji-adesola.jpg",
    result: "100+ design tokens",
    placeholder: true,
    colors: { accent: "#7c4ddb" },
  },
  {
    id: "benjamin-chen",
    quote:
      "Samuel led the UX and UI for HeightGPT from research all the way to launch on the App Store and Google Play, and the app went past 10,000 downloads. He kept the AI features simple to use, and his screens were ready to build.",
    name: "Benjamin Chen",
    role: "Co-founder",
    company: "Boulevard Legacy",
    source: "Boulevard Legacy, co-founder (HeightGPT)",
    photo: "/testimonials/benjamin-chen.jpg",
    result: "10,000+ downloads",
    placeholder: true,
    colors: { accent: "#0ea5e9" },
  },
  {
    id: "gabriele-muratori",
    quote:
      "On Simplexity, Samuel designed the whole web app end to end, turning hours of manual LinkedIn research into a few clear steps. It cut the manual research effort by about a quarter.",
    name: "Gabriele Muratori",
    role: "Co-founder",
    company: "Boulevard Legacy",
    source: "Boulevard Legacy, co-founder (Simplexity)",
    photo: "/testimonials/gabriele-muratori.jpg",
    result: "25% less manual research",
    placeholder: true,
    colors: { accent: "#0ea5a4" },
  },
  {
    id: "iranlowo-jm",
    quote:
      "Samuel designed our landing page and the platform behind it for three very different people: students, sponsors and affiliates. The student dashboard and revision flows cut the time it takes a student to start revising by 30%.",
    name: "Iranlowo JM",
    role: "CEO",
    company: "iExcelo",
    source: "iExcelo, CEO",
    photo: "/testimonials/iranlowo-jm.jpg",
    result: "30% faster time-to-task",
    placeholder: true,
    colors: { accent: "#d99a00" },
  },
];
