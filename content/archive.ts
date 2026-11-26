import type { PlaceholderKind } from "@/components/ui/placeholder-shot";
import type { Mockup } from "@/components/ui/device-mockup";

/** Work without a full case study yet. Honest "case study soon" states. Facts from profile.md only. */
export type ArchiveItem = {
  slug: string;
  title: string;
  what: string;
  year?: string;
  note?: string;
  /** Placeholder cover until Samuel exports a real one */
  tint: string;
  kind: PlaceholderKind;
  /** Real screenshots, shown as a laptop + phone motion ad instead of the placeholder */
  mockup?: Mockup;
};

export const archive: ArchiveItem[] = [
  { slug: "heightgpt", title: "HeightGPT", what: "AI mobile app, research to App Store launch", year: "2024–25", note: "10,000 downloads in week one", tint: "#3b82f6", kind: "mobile" },
  // TODO: Samuel to confirm the year (the landing page says 2026; pre-launch)
  { slug: "voxdeed", title: "Voxdeed", what: "AI legal tech: a voice note becomes a signed contract", year: "2026", tint: "#5f0a1a", kind: "web", mockup: { film: "voxdeed", wash: ["#3a0812", "#0b0507"] } },
  { slug: "iexcelo", title: "iExcelo", what: "WASSCE revision platform for students, sponsors and affiliates", year: "2025–26", note: "30% faster time-to-task", tint: "#1f6fe5", kind: "web", mockup: { film: "iexcelo", wash: ["#fde4f2", "#d7e8ff"] } },
  { slug: "simplexity", title: "Simplexity", what: "LinkedIn data extraction web app", year: "2024–25", note: "25% less manual research", tint: "#0ea5a4", kind: "dashboard" },
  { slug: "lagproperties", title: "LAGProperties", what: "Mobile real estate app", year: "2024", note: "10% higher satisfaction", tint: "#e4572e", kind: "mobile" },
  { slug: "powerroute", title: "PowerRoute", what: "EV charging locator app", tint: "#22c55e", kind: "mobile" },
  { slug: "quitbet", title: "QuitBet", what: "Gambling addiction recovery app", tint: "#a855f7", kind: "mobile" },
];
