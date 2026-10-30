/**
 * Testimonials for the arc dial on the home page.
 *
 * PLACEHOLDERS until Samuel receives real quotes (see the Testimonials block
 * in profile.md for who to ask and the message to send). Never publish a
 * quote, photo or rating that wasn't actually given. When one arrives:
 * set quote, name, role, photo (put it in /public/testimonials/),
 * verifiedVia if it can be checked publicly, and
 * placeholder: false. Results are confirmed numbers from profile.md only.
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
  /**
   * e.g. "/testimonials/ada.jpg". The current photos are stand-in Unsplash portraits
   * (Unsplash licence), 400px face crops, until the real people send theirs. Source IDs:
   * founder 1531123897727-8f129e1688ce, engineer 1507003211169-0a1dd7228f2d,
   * heightgpt 1531384441138-2736e62e0919,
   * iexcelo 1494790108377-be9c29b29330, lagproperties 1500648767791-00dcc994a43e,
   * simplexity 1534528741775-53994a69daeb,
   * collaborator 1472099645785-5658abf4ff4e, community 1438761681033-6461ffad8d80
   * (images.unsplash.com/photo-<id>)
   */
  photo: string | null;
  /** A confirmed result for the project they're talking about */
  result?: string;
  /** Where it can be checked, e.g. "LinkedIn recommendation" */
  verifiedVia?: string;
  placeholder: boolean;
  /** Per-story colours. Mixed with the theme, so one value works in light and dark */
  colors: { accent: string; glow?: string; text?: string };
};

export const testimonials: Testimonial[] = [
  {
    id: "immigify-founder",
    quote:
      "Placeholder. Two or three sentences from Immigify's founder on what it was like having Samuel as the founding designer: owning the product end to end, building the design system from zero, and how that helped a small team move fast while the company raised its round.",
    name: null,
    role: "Founder or CEO",
    company: "Immigify",
    source: "Immigify founder",
    photo: "/testimonials/immigify-founder.jpg",
    result: "$1M pre-seed raised",
    placeholder: true,
    colors: { accent: "#3b6cf6" },
  },
  {
    id: "immigify-engineer",
    quote:
      "Placeholder. An engineer on design handoff, specs, and building the AI agent interfaces together.",
    name: null,
    role: "Engineer or engineering lead",
    company: "Immigify",
    source: "Immigify engineer",
    photo: "/testimonials/immigify-engineer.jpg",
    result: "100+ design tokens",
    placeholder: true,
    colors: { accent: "#7c4ddb" },
  },
  {
    id: "heightgpt-client",
    quote:
      "Placeholder. Boulevard Legacy on HeightGPT: taking an AI mobile app from research to App Store and Google Play launch, and what happened in the first week.",
    name: null,
    role: "Client",
    company: "Boulevard Legacy",
    source: "HeightGPT client",
    photo: "/testimonials/heightgpt-client.jpg",
    result: "10,000 downloads in week one",
    placeholder: true,
    colors: { accent: "#0ea5e9" },
  },
  {
    id: "iexcelo-owner",
    quote:
      "Placeholder. iExcelo's product owner on designing one platform for three very different people, students, sponsors and affiliates, and getting students to what they came for faster. Anything specific about a hard trade-off is better than praise.",
    name: null,
    role: "Founder or product owner",
    company: "iExcelo",
    source: "iExcelo product owner",
    photo: "/testimonials/iexcelo-owner.jpg",
    result: "30% faster time-to-task",
    placeholder: true,
    colors: { accent: "#d99a00" },
  },
  {
    id: "lagproperties-lead",
    quote: "Placeholder. LAGProperties' project lead on the research, and delivering the mobile app on schedule.",
    name: null,
    role: "Project lead",
    company: "LAGProperties",
    source: "LAGProperties project lead",
    photo: "/testimonials/lagproperties-lead.jpg",
    result: "10% higher satisfaction",
    placeholder: true,
    colors: { accent: "#e4572e" },
  },
  {
    id: "simplexity-client",
    quote:
      "Placeholder. Boulevard Legacy on Simplexity: turning LinkedIn data extraction into a web app researchers could actually work in.",
    name: null,
    role: "Client",
    company: "Boulevard Legacy",
    source: "Simplexity client",
    photo: "/testimonials/simplexity-client.jpg",
    result: "25% less manual research",
    placeholder: true,
    colors: { accent: "#0ea5a4" },
  },
  {
    id: "collaborator",
    quote:
      "Placeholder. A developer or PM from PowerRoute, QuitBet or FundPath on collaborating day to day: how Samuel handled feedback, scope changes and a hard problem.",
    name: null,
    role: "Collaborator",
    company: "To confirm",
    source: "A day-to-day collaborator",
    photo: "/testimonials/collaborator.jpg",
    placeholder: true,
    colors: { accent: "#22a35a" },
  },
  {
    id: "community",
    quote:
      "Placeholder. Someone from the design community Samuel has mentored or reviewed work for, on what they took away from it.",
    name: null,
    role: "Designer",
    company: "To confirm",
    source: "Design community",
    photo: "/testimonials/community.jpg",
    placeholder: true,
    colors: { accent: "#d63d8f" },
  },
];
