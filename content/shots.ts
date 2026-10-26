/**
 * UI shots gallery. `src: null` renders a coded placeholder until Samuel
 * exports the real frame from Figma (drop the PNG in /public/shots and set src).
 */
export type ShotKind = "mobile" | "web" | "dashboard" | "brand";

export type Shot = {
  id: string;
  title: string;
  project: string;
  kind: ShotKind;
  src: string | null;
  /** width / height */
  ratio: number;
  tint: string;
  note: string;
  caseStudy?: string;
};

export const shotFilters: { id: ShotKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mobile", label: "Mobile" },
  { id: "web", label: "Web" },
  { id: "dashboard", label: "Dashboards" },
  { id: "brand", label: "Brand" },
];

export const shots: Shot[] = [
  {
    id: "room8-home",
    title: "Room8 home and onboarding",
    project: "Room8",
    kind: "mobile",
    src: "/work/room8.png",
    ratio: 1184 / 1032,
    tint: "#2f9e5b",
    note: "Listings lead with price and roommate count, the two things people filter on first.",
    caseStudy: "room8",
  },
  {
    id: "fundpath-overview",
    title: "FundPath campaign flows",
    project: "FundPath",
    kind: "mobile",
    src: "/work/fundpath.png",
    ratio: 1184 / 1032,
    tint: "#7c4ddb",
    note: "Raised-versus-goal sits on every campaign card, so trust is visible before the tap.",
    caseStudy: "fundpath",
  },
  {
    id: "immigify-agent",
    title: "AI agent conversation",
    project: "Immigify",
    kind: "web",
    src: null,
    ratio: 16 / 10,
    tint: "#3157d5",
    note: "Placeholder. The agent's working steps stay visible while it answers.",
    caseStudy: "immigify",
  },
  {
    id: "immigify-crm",
    title: "Consultant CRM pipeline",
    project: "Immigify",
    kind: "dashboard",
    src: null,
    ratio: 16 / 10,
    tint: "#3157d5",
    note: "Placeholder. Cases grouped by next action, not by status code.",
    caseStudy: "immigify",
  },
  {
    id: "iexcelo-dashboard",
    title: "Student revision dashboard",
    project: "iExcelo",
    kind: "dashboard",
    src: null,
    ratio: 4 / 3,
    tint: "#e0782f",
    note: "Placeholder. Three personas, one dashboard that rearranges around each.",
  },
  {
    id: "lagproperties-app",
    title: "Property search",
    project: "LAGProperties",
    kind: "mobile",
    src: null,
    ratio: 3 / 4,
    tint: "#0f8a8a",
    note: "Placeholder.",
  },
  {
    id: "simplexity-web",
    title: "LinkedIn research workspace",
    project: "Simplexity",
    kind: "web",
    src: null,
    ratio: 16 / 10,
    tint: "#2b2f3a",
    note: "Placeholder.",
  },
  {
    id: "powerroute",
    title: "EV charging locator",
    project: "PowerRoute",
    kind: "mobile",
    src: null,
    ratio: 3 / 4,
    tint: "#1f9d6c",
    note: "Placeholder.",
  },
  {
    id: "voxdeed-landing",
    title: "Voxdeed landing page",
    project: "Voxdeed",
    kind: "web",
    src: null,
    ratio: 16 / 10,
    tint: "#5a3fd0",
    note: "Placeholder. Pre-launch.",
  },
  {
    id: "quitbet",
    title: "Recovery check-in",
    project: "QuitBet",
    kind: "mobile",
    src: null,
    ratio: 3 / 4,
    tint: "#c2410c",
    note: "Placeholder.",
  },
  {
    id: "pentatech-brand",
    title: "Pentatech identity",
    project: "Pentatech",
    kind: "brand",
    src: null,
    ratio: 1,
    tint: "#1d4ed8",
    note: "Placeholder.",
  },
  {
    id: "roamify-brand",
    title: "Roamify Travels identity",
    project: "Roamify Travels",
    kind: "brand",
    src: null,
    ratio: 1,
    tint: "#db2777",
    note: "Placeholder.",
  },
  {
    id: "fysi-web",
    title: "Fysi storefront",
    project: "Fysi",
    kind: "web",
    src: null,
    ratio: 16 / 10,
    tint: "#9a6b2f",
    note: "Placeholder.",
  },
];
