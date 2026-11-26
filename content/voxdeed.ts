import type { Screen } from "@/content/details";

/**
 * Voxdeed's landing page, from Samuel's Figma file Voxdeed Inc. (Website page): the desktop page at 1.5× and
 * each of its sections, and the mobile page at 1.5× (2× would pass WebP's 16,383px height limit).
 * The film and the project page both read from here. Sizes are in points.
 */
type Sized = Screen & { w: number; h: number };
const F = "/work/voxdeed";
const section = (file: string, h: number, alt: string): Sized => ({ src: `${F}/s-${file}.webp`, w: 1440, h, alt });

export const voxdeed = {
  home: { src: `${F}/d-home.webp`, w: 1440, h: 7241, alt: "The Voxdeed landing page, top to bottom: the future of agreements is automated, three steps and no lawyers, features, questions, pricing, contact, a last call to protect your next deal, and the footer." } as Sized,
  mHome: { src: `${F}/m-home.webp`, w: 375, h: 10489, alt: "The Voxdeed landing page on a phone." } as Sized,
  hero: section("hero", 1236, "The hero: The Future of Agreements Is Automated. Below it, a VoiceContract AI window where a voice note is sent, the AI transcribes and extracts the terms, and a supply agreement comes back ready to sign."),
  steps: section("steps", 912, "How it works, three steps and no lawyers: record or send a voice note, the AI processes it, then both parties sign and it's stored in a vault."),
  features: section("features", 985, "Everything you need to formalize agreements: voice note to signed contract, the AI drafts it in 60 seconds, a fraction of a lawyer's cost, and proof if there's a dispute."),
  faq: section("faq", 748, "Got questions? Five common ones, from whether you need an app to who Voxdeed is built for."),
  pricing: section("pricing", 1019, "Simple, transparent pricing: Basic pay-as-you-go, Premium for freelancers, creators and SMEs, and Enterprise for teams."),
  contact: section("contact", 726, "We'd love to hear from you: an email address to copy and a message form."),
  cta: section("cta", 826, "Ready to protect your next deal? A last call to try it, under a glowing microphone."),
  footer: section("footer", 789, "The footer: product and legal links, socials, and a note that Voxdeed doesn't give legal advice."),
} as const;

export type VxScreen = keyof typeof voxdeed;
