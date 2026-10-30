import type { PlaceholderKind } from "@/components/ui/placeholder-shot";

/** Work without a full case study yet. Honest "case study soon" states. Facts from profile.md only. */
export type ArchiveItem = {
  title: string;
  what: string;
  year?: string;
  note?: string;
  /** Placeholder cover until Samuel exports a real one */
  tint: string;
  kind: PlaceholderKind;
};

export const archive: ArchiveItem[] = [
  { title: "HeightGPT", what: "AI mobile app, research to App Store launch", year: "2024–25", note: "10,000 downloads in week one", tint: "#3b82f6", kind: "mobile" },
  { title: "iExcelo", what: "WASSCE revision platform for students, sponsors and affiliates", year: "2024–25", note: "30% faster time-to-task", tint: "#e0a100", kind: "web" },
  { title: "Simplexity", what: "LinkedIn data extraction web app", year: "2024–25", note: "25% less manual research", tint: "#0ea5a4", kind: "dashboard" },
  { title: "LAGProperties", what: "Mobile real estate app", year: "2024", note: "10% higher satisfaction", tint: "#e4572e", kind: "mobile" },
  { title: "PowerRoute", what: "EV charging locator app", tint: "#22c55e", kind: "mobile" },
  { title: "QuitBet", what: "Gambling addiction recovery app", tint: "#a855f7", kind: "mobile" },
];
