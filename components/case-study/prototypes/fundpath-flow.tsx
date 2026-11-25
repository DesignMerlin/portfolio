"use client";

import { BTN, FULL, ICON, ScreenFlow, type Flow, type Spot } from "@/components/case-study/prototypes/screen-flow";
import { fundpath, type FundpathScreen } from "@/content/fundpath";

type S = Spot<FundpathScreen>;

const back = (to: FundpathScreen, label = "Back"): S => ({ label, at: [28, 68], size: ICON, to, move: "back" });
/** The tab bar, with Start a campaign in the middle */
const nav = (current: "home" | "campaigns" | "donations" | "chats", y = 742): S[] =>
  (
    [
      ["Home", "home", 38],
      ["Campaigns", "campaigns", 113],
      ["Donations", "donations", 262],
      ["Chats", "chats", 337],
    ] as const
  )
    .map(([label, to, x]): S => ({ label, at: [x, y], size: [64, 48], to, move: "fade" }))
    .filter((s) => s.to !== current)
    .concat({ label: "Start a campaign", at: [187, y], size: [58, 58], to: "start", move: "sheet" });
const welcome: S[] = [
  { label: "Log in", at: [187, 649], size: [343, 46], to: "home", move: "in" },
  { label: "Sign up", at: [187, 710], size: [343, 46], to: "home", move: "in" },
];
const row = (label: string, y: number): S => ({ label, at: [187, y], size: [343, 100], to: "campaign" });

/** The app's real flow, as a map of its real screens. Signing in is skipped: those screens aren't published */
const FLOW: Flow<FundpathScreen> = {
  heart: { spots: [{ label: "Start", at: [187, 406], size: FULL, to: "splash", move: "fade" }], auto: { to: "splash", after: 1200, move: "fade" } },
  splash: { spots: [{ label: "Start", at: [187, 406], size: FULL, to: "welcome1", move: "fade" }], auto: { to: "welcome1", after: 2700, move: "fade" } },
  welcome1: { spots: [{ label: "Next", at: [187, 290], size: [375, 400], to: "welcome2" }, ...welcome] },
  welcome2: { spots: [{ label: "Next", at: [187, 290], size: [375, 400], to: "welcome3" }, ...welcome] },
  welcome3: { spots: [{ label: "Back to the first", at: [187, 290], size: [375, 400], to: "welcome1", move: "back" }, ...welcome] },
  home: {
    spots: [
      { label: "Search fundraisers", at: [187, 125], size: [343, 40], to: "campaigns", move: "fade" },
      { label: "Browse causes", at: [187, 372], size: [343, 136], to: "campaigns", move: "fade" },
      { label: "View all campaigns", at: [328, 475], size: [80, 40], to: "campaigns", move: "fade" },
      { label: "Open Jane's kidney transplant bills", at: [126, 602], size: [210, 204], to: "campaign" },
      ...nav("home"),
    ],
  },
  campaigns: {
    spots: [
      { label: "Filter", at: [342, 74], size: ICON, to: "filter", move: "sheet" },
      row("Open Education for kids in slums", 205),
      row("Open John's prostate cancer treatment", 317),
      row("Open Shelter for stray dogs in Lagos", 429),
      row("Open Jack's prosthetic leg implant", 541),
      ...nav("campaigns"),
    ],
  },
  filter: {
    spots: [
      { label: "Close filter", at: [28, 68], size: ICON, to: "campaigns", move: "fade" },
      { label: "Show campaigns", at: [187, 745], size: BTN, to: "campaigns", move: "fade" },
    ],
  },
  campaign: {
    spots: [
      back("campaigns"),
      { label: "Share", at: [316, 66], size: [40, 44], to: "share", move: "sheet" },
      { label: "Transparency report", at: [92, 447], size: [154, 40], to: "report" },
      { label: "View organiser profile", at: [322, 522], size: [84, 40], to: "profile" },
      { label: "Chat", at: [78, 742], size: [124, 48], to: "chat" },
      { label: "Donate now", at: [254, 742], size: [209, 48], to: "amount", move: "sheet" },
    ],
  },
  amount: {
    sheet: { top: 318, over: "campaign" },
    spots: [
      { label: "Close", at: [187, 159], size: [375, 318], to: "campaign", move: "drop" },
      { label: "Back", at: [28, 369], size: ICON, to: "campaign", move: "drop" },
      { label: "Proceed", at: [187, 743], size: BTN, to: "payMethod" },
    ],
    fields: [{ label: "Donation amount", text: [157, 414, 63, 30], field: [144.7, 409, 86.7, 40], r: 2, bg: "#fff", chars: 5 }],
  },
  share: { sheet: { top: 664, over: "campaign" }, spots: [{ label: "Close share", at: [187, 332], size: [375, 664], to: "campaign", move: "drop" }] },
  payMethod: { spots: [back("campaign"), { label: "Proceed", at: [187, 678], size: BTN, to: "card" }] },
  card: {
    spots: [back("payMethod"), { label: "Pay now", at: [187, 680], size: BTN, to: "processing", move: "fade" }],
    fields: [
      { label: "Card number", text: [27, 166, 198, 26], field: [16, 159, 343, 40], r: 8, bg: "#fff", chars: 25 },
      { label: "Expiration date", text: [28, 248, 43, 26], field: [17, 241, 163, 40], r: 8, bg: "#fff", chars: 5 },
      { label: "CVV", text: [206, 248, 30, 26], field: [195, 241, 163, 40], r: 8, bg: "#fff", chars: 3 },
      { label: "Full name", text: [28, 330, 74, 26], field: [17, 323, 343, 40], r: 8, bg: "#fff", chars: 8 },
    ],
  },
  processing: {
    spots: [{ label: "Continue", at: [187, 406], size: FULL, to: "success", move: "fade" }],
    auto: { to: "success", after: 2400, move: "fade" },
  },
  success: {
    spots: [
      { label: "Leave a comment", at: [187, 647], size: [343, 46], to: "campaign", move: "fade" },
      { label: "Back to home", at: [187, 707], size: [343, 46], to: "home", move: "out" },
    ],
  },
  report: {
    spots: [back("campaign"), { label: "Chat with the organiser", at: [341, 166], size: ICON, to: "chat" }],
  },
  profile: { spots: [back("campaign")] },
  chat: { spots: [back("chats"), ...nav("chats", 730)] },
  chats: { spots: [{ label: "Open Marcus Brown", at: [187, 205], size: [343, 68], to: "chat" }, ...nav("chats", 730)] },
  donations: {
    spots: [back("home"), { label: "See donation details", at: [187, 468], size: [343, 72], to: "receipt", move: "fade" }, ...nav("donations", 725)],
  },
  receipt: {
    spots: [
      { label: "Close", at: [312, 84], size: ICON, to: "donations", move: "fade" },
      { label: "Donate again", at: [280, 732], size: [114, 46], to: "campaign" },
    ],
  },
  start: { spots: [back("home"), { label: "Preview", at: [187, 731], size: BTN, to: "preview" }] },
  preview: { spots: [back("start"), { label: "Publish", at: [187, 731], size: BTN, to: "review", move: "fade" }] },
  review: {
    spots: [{ label: "Back to home", at: [187, 651], size: [160, 48], to: "home", move: "out" }],
    auto: { to: "live", after: 3000, move: "fade" },
  },
  live: {
    spots: [
      { label: "Go to my campaigns", at: [187, 430], size: [300, 56], to: "myCampaigns" },
      { label: "Back to home", at: [187, 628], size: BTN, to: "home", move: "out" },
    ],
  },
  myCampaigns: {
    spots: [back("home"), { label: "Open Help Sarah battle liver cancer", at: [187, 250], size: [343, 124], to: "fundUpdate" }],
  },
  fundUpdate: { spots: [back("myCampaigns")] },
};

/** FundPath, clickable, with the app's real screens */
export default function FundpathFlow() {
  return <ScreenFlow name="FundPath" screens={fundpath} flow={FLOW} start="heart" island tint="#7c4ddb" />;
}
