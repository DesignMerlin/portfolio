/** Work without a full case study yet. Honest "case study soon" states. Facts from profile.md only. */
export type ArchiveItem = { title: string; what: string; year?: string; note?: string };

export const archive: ArchiveItem[] = [
  { title: "HeightGPT", what: "AI mobile app, research to App Store launch", year: "2024–25", note: "10,000 downloads in week one" },
  { title: "iExcelo", what: "WASSCE revision platform for students, sponsors and affiliates", year: "2024–25", note: "30% faster time-to-task" },
  { title: "Simplexity", what: "LinkedIn data extraction web app", year: "2024–25", note: "25% less manual research" },
  { title: "LAGProperties", what: "Mobile real estate app", year: "2024", note: "10% higher satisfaction" },
  { title: "PowerRoute", what: "EV charging locator app" },
  { title: "QuitBet", what: "Gambling addiction recovery app" },
];
