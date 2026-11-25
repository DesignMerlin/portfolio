"use client";

import { BTN, FULL, ICON, ScreenFlow, type Flow, type Spot } from "@/components/case-study/prototypes/screen-flow";
import { caseTracker, type CaseTrackerScreen } from "@/content/case-tracker";

type S = Spot<CaseTrackerScreen>;

const back = (to: CaseTrackerScreen, at: [number, number] = [21, 74]): S => ({ label: "Back", at, size: ICON, to, move: "back" });
const skip = (to: CaseTrackerScreen): S => ({ label: "Skip", at: [326, 70], size: [64, 44], to });
const nav = (current: "home" | "cases" | "consultants" | "community"): S[] =>
  (
    [
      ["Home", "home", 40],
      ["My cases", "cases", 114],
      ["Consultants", "consultants", 187],
      ["Community", "community", 261],
    ] as const
  )
    .map(([label, to, x]): S => ({ label, at: [x, 742], size: [68, 52], to, move: "fade" }))
    .filter((s) => s.to !== current);
const start = (next: CaseTrackerScreen): S[] => [
  { label: "Next", at: [187, 240], size: [375, 300], to: next },
  { label: "Get started", at: [187, 703], size: [343, 48], to: "status" },
  { label: "Skip", at: [351, 64], size: [56, 44], to: "home", move: "in" },
];

/** The app's real flow, as a map of its real screens */
const FLOW: Flow<CaseTrackerScreen> = {
  splash: { spots: [{ label: "Start", at: [187, 406], size: FULL, to: "welcome1", move: "fade" }], auto: { to: "welcome1", after: 2500, move: "fade" } },
  welcome1: { spots: start("welcome2") },
  welcome2: { spots: start("welcome3") },
  welcome3: { spots: start("welcome1") },
  status: { spots: [back("welcome3"), skip("interests"), { label: "Continue", at: [187, 736], size: BTN, to: "interests" }] },
  interests: { spots: [back("status"), skip("addCase"), { label: "Continue", at: [187, 736], size: BTN, to: "addCase" }] },
  addCase: {
    spots: [back("interests"), skip("home"), { label: "Finish", at: [187, 736], size: BTN, to: "fetching", move: "fade" }],
    fields: [
      { label: "Receipt number", text: [31, 267, 139, 24], field: [16, 255, 343, 47], r: 8, bg: "#fafafa", chars: 13, src: "/work/case-tracker/receipt.webp" },
    ],
  },
  fetching: {
    spots: [{ label: "Skip ahead", at: [187, 406], size: FULL, to: "home", move: "in" }],
    auto: { to: "home", after: 2800, move: "in" },
  },
  home: {
    spots: [
      { label: "View all cases", at: [334, 150], size: [72, 44], to: "cases", move: "fade" },
      { label: "Open your case", at: [187, 310], size: [311, 44], to: "cases", move: "fade" },
      ...nav("home"),
    ],
  },
  cases: {
    spots: [
      { label: "Add a case", at: [338, 68], size: ICON, to: "addCase", move: "sheet" },
      { label: "Add new case", at: [187, 410], size: [343, 56], to: "addCase", move: "sheet" },
      ...nav("cases"),
    ],
  },
  community: {
    spots: [
      { label: "Messages", at: [344, 66], size: ICON, to: "groups", move: "fade" },
      { label: "Open a post's timeline", at: [187, 420], size: [343, 320], to: "timelinePost" },
      { label: "Join the conversation", at: [187, 670], size: [343, 64], to: "createPost", move: "sheet" },
      ...nav("community"),
    ],
  },
  createPost: {
    spots: [
      back("community"),
      { label: "Write something", at: [200, 170], size: [300, 120], to: "writePost", move: "fade" },
      { label: "Add a timeline", at: [262, 751], size: [100, 44], to: "timeline" },
    ],
  },
  writePost: { spots: [back("createPost"), { label: "Close the keyboard", at: [22, 786], size: ICON, to: "createPost", move: "fade" }, { label: "Add a timeline", at: [187, 300], size: [343, 120], to: "timeline" }] },
  timeline: { spots: [back("writePost"), { label: "Done", at: [300, 71], size: [56, 44], to: "timelinePost" }] },
  timelinePost: { spots: [{ label: "Groups", at: [344, 66], size: ICON, to: "groups", move: "fade" }, ...nav("community")] },
  groups: {
    spots: [
      { label: "For you", at: [86, 184], size: [160, 44], to: "community", move: "fade" },
      { label: "Open a group", at: [187, 430], size: [343, 260], to: "group" },
      ...nav("community"),
    ],
  },
  group: { spots: [back("groups", [34, 72])] },
  consultants: {
    spots: [{ label: "View Maria Alvarez", at: [187, 273], size: [343, 92], to: "book" }, ...nav("consultants")],
  },
  book: { spots: [back("consultants", [34, 78]), { label: "Confirm and pay $120", at: [187, 737], size: BTN, to: "pay" }] },
  pay: {
    spots: [back("book", [34, 78]), { label: "Pay $120", at: [187, 698], size: [307, 48], to: "confirmed", move: "fade" }],
    fields: [
      { label: "Card number", text: [47, 461, 152, 22], field: [34, 450, 307, 44], r: 12, bg: "#fafafa", chars: 19 },
      { label: "Expiry", text: [47, 540, 50, 22], field: [34, 529, 144, 44], r: 12, bg: "#fafafa", chars: 5 },
      { label: "CVC", text: [202, 540, 27, 22], field: [189, 529, 152, 44], r: 12, bg: "#fafafa", chars: 3 },
      { label: "Cardholder name", text: [47, 629, 119, 22], field: [34, 618, 307, 44], r: 12, bg: "#fafafa", chars: 17 },
    ],
  },
  confirmed: { spots: [{ label: "View my appointments", at: [187, 671], size: BTN, to: "consultants", move: "out" }, { label: "Back to home", at: [187, 721], size: [180, 44], to: "home", move: "out" }] },
};

/** Immigify Case Tracker+, clickable, with the app's real screens */
export default function CaseTrackerFlow() {
  return <ScreenFlow name="Case Tracker+" screens={caseTracker} flow={FLOW} start="splash" island tint="#dc143c" />;
}
