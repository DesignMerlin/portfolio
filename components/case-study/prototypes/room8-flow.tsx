"use client";

import { BTN, FULL, ICON, ScreenFlow, type Flow, type Spot } from "@/components/case-study/prototypes/screen-flow";
import { room8, type Room8Screen } from "@/content/room8";

type S = Spot<Room8Screen>;

const back = (to: Room8Screen, at: [number, number] = [32, 68]): S => ({ label: "Back", at, size: ICON, to, move: "back" });
const nav = (current: "home" | "explore" | "chats" | "saved", xs: [number, number, number, number]): S[] =>
  (
    [
      ["Home", "home"],
      ["Explore", "explore"],
      ["Chats", "chats"],
      ["Saved", "saved"],
    ] as const
  )
    .map(([label, to], i): S => ({ label, at: [xs[i]!, 768], size: ICON, to, move: "fade" }))
    .filter((s) => s.to !== current);
const actions = (): S[] => [
  { label: "Contact", at: [98, 774], size: [164, 48], to: "conversation" },
  { label: "Book a tour", at: [278, 774], size: [164, 48], to: "bookVisit", move: "sheet" },
];

/** The app's real flow, as a map of its real screens */
const FLOW: Flow<Room8Screen> = {
  splash: { spots: [{ label: "Start", at: [187, 406], size: FULL, to: "onboarding1", move: "fade" }], auto: { to: "onboarding1", after: 2500, move: "fade" } },
  onboarding1: {
    spots: [
      { label: "Next", at: [290, 743], size: [72, 48], to: "onboarding2" },
      { label: "Skip", at: [58, 743], size: [72, 48], to: "getStarted" },
    ],
  },
  onboarding2: {
    spots: [
      { label: "Next", at: [290, 743], size: [72, 48], to: "onboarding3" },
      { label: "Skip", at: [57, 743], size: [72, 48], to: "getStarted" },
    ],
  },
  onboarding3: {
    spots: [
      { label: "Get started", at: [268, 743], size: [120, 48], to: "getStarted" },
      { label: "Skip", at: [56, 743], size: [72, 48], to: "getStarted" },
    ],
  },
  getStarted: { spots: [{ label: "Continue", at: [187, 765], size: BTN, to: "questions" }] },
  questions: { spots: [back("getStarted", [26, 72]), { label: "Continue", at: [187, 773], size: BTN, to: "preferences" }] },
  preferences: { spots: [back("questions", [26, 72]), { label: "Continue", at: [187, 773], size: BTN, to: "home" }] },
  home: {
    spots: [
      { label: "Search by location", at: [187, 141], size: [343, 42], to: "explore", move: "fade" },
      { label: "Open Sunlit Studio", at: [134, 630], size: [238, 180], to: "room" },
      ...nav("home", [107, 173, 236, 289]),
    ],
  },
  explore: {
    spots: [
      { label: "Filters", at: [341, 74], size: ICON, to: "filters", move: "sheet" },
      { label: "Open Steph Campbell", at: [187, 219], size: [343, 117], to: "roommate" },
      { label: "Open Karoline Lee", at: [187, 345], size: [343, 117], to: "roommate" },
      { label: "Open Melissa Randy", at: [187, 471], size: [343, 117], to: "roommate" },
      { label: "Map", at: [296, 707], size: [84, 44], to: "exploreMap", move: "fade" },
      ...nav("explore", [77, 163, 244, 297]),
    ],
  },
  exploreMap: {
    spots: [
      { label: "Filters", at: [341, 74], size: ICON, to: "filters", move: "sheet" },
      { label: "List", at: [315, 610], size: [80, 44], to: "explore", move: "fade" },
      { label: "Open Steph Campbell", at: [190, 675], size: [258, 72], to: "roommate" },
      ...nav("explore", [77, 163, 233, 293]),
    ],
  },
  filters: {
    spots: [
      { label: "Close filters", at: [342, 121], size: ICON, to: "explore", move: "fade" },
      { label: "Show 4 results", at: [187, 772], size: BTN, to: "explore", move: "fade" },
    ],
  },
  saved: {
    spots: [
      { label: "Browse rooms", at: [107, 523], size: [144, 48], to: "home", move: "fade" },
      { label: "Open map", at: [265, 523], size: [144, 48], to: "exploreMap", move: "fade" },
      ...nav("saved", [80, 132, 185, 265]),
    ],
  },
  roommate: { spots: [back("explore"), ...actions()] },
  room: {
    spots: [
      back("home"),
      { label: "Start the 3D tour", at: [331, 700], size: [62, 62], to: "vrLoader", move: "in" },
      { label: "Read about the room", at: [187, 560], size: [343, 130], to: "roomRoommates", move: "fade" },
      ...actions(),
    ],
  },
  roomRoommates: {
    spots: [
      { label: "Scroll back up", at: [187, 85], size: [343, 44], to: "room", move: "fade" },
      { label: "Start the 3D tour", at: [329, 700], size: [62, 62], to: "vrLoader", move: "in" },
      ...actions(),
    ],
  },
  bookVisit: {
    spots: [
      { label: "Close", at: [342, 130], size: ICON, to: "room", move: "fade" },
      { label: "Live video", at: [277, 275], size: [164, 92], to: "bookVideo", move: "fade" },
    ],
  },
  bookVideo: {
    spots: [
      { label: "Close", at: [340, 242], size: ICON, to: "room", move: "fade" },
      { label: "In person", at: [95, 345], size: [164, 92], to: "bookVisit", move: "fade" },
      { label: "Start live video tour", at: [187, 766], size: BTN, to: "callRinging", move: "in" },
    ],
  },
  callRinging: {
    spots: [{ label: "End call", at: [319, 776], size: [60, 60], to: "room", move: "out" }],
    auto: { to: "callLive", after: 2200, move: "fade" },
  },
  callLive: { spots: [{ label: "End the tour", at: [187, 406], size: FULL, to: "callEnded", move: "sheet" }] },
  callEnded: {
    spots: [
      { label: "Make payment", at: [187, 648], size: BTN, to: "payMethod" },
      { label: "Message Marcus", at: [103, 707], size: [162, 46], to: "conversation" },
      { label: "Call again", at: [273, 707], size: [162, 46], to: "callRinging", move: "fade" },
      { label: "Back to room", at: [187, 765], size: BTN, to: "room", move: "out" },
    ],
  },
  chats: {
    spots: [
      { label: "Open Alex Hunter", at: [187, 223], size: [343, 64], to: "conversation" },
      ...nav("chats", [84, 136, 208, 291]),
    ],
  },
  conversation: {
    spots: [
      back("chats", [30, 59]),
      { label: "Call", at: [305, 59], size: ICON, to: "callRinging", move: "in" },
      { label: "More options", at: [343, 59], size: [36, 48], to: "chatMenu", move: "fade" },
    ],
  },
  chatMenu: {
    spots: [
      // Anywhere outside the menu closes it; the menu's own items sit on top
      { label: "Close menu", at: [187, 406], size: FULL, to: "conversation", move: "fade" },
      { label: "Video call", at: [227, 118], size: [240, 36], to: "callRinging", move: "in" },
      { label: "View contact", at: [227, 154], size: [240, 36], to: "roommate" },
      { label: "Make payments", at: [227, 263], size: [240, 38], to: "payMethod" },
    ],
  },
  payMethod: { spots: [back("conversation", [24, 73]), { label: "Continue", at: [187, 767], size: BTN, to: "payCard" }] },
  payCard: {
    spots: [back("payMethod", [24, 73]), { label: "Continue", at: [187, 767], size: BTN, to: "payDone", move: "fade" }],
    fields: [
      { label: "Card number", text: [29, 228, 146, 20], field: [16, 216, 343, 42], r: 6, bg: "#fff", chars: 19 },
      { label: "Expiry date", text: [29, 316, 52, 20], field: [16, 304, 162, 42], r: 6, bg: "#fff", chars: 5 },
      { label: "CVV", text: [210, 316, 28, 20], field: [197, 304, 162, 42], r: 6, bg: "#fff", chars: 3 },
    ],
  },
  payDone: {
    spots: [
      { label: "Close", at: [322, 251], size: ICON, to: "payCard", move: "fade" },
      { label: "Back to Home", at: [187, 542], size: [300, 48], to: "home", move: "out" },
    ],
  },
  vrLoader: {
    spots: [{ label: "Step inside", at: [187, 406], size: FULL, to: "vrDollhouse", move: "in" }],
    auto: { to: "vrDollhouse", after: 1800, move: "in" },
  },
  vrDollhouse: {
    spots: [
      { label: "Close the tour", at: [30, 67], size: ICON, to: "room", move: "out" },
      { label: "Walk", at: [303, 661], size: [116, 36], to: "vrWalk", move: "in" },
      { label: "Cinematic", at: [303, 700], size: [116, 36], to: "vrCinematic", move: "in" },
    ],
  },
  vrWalk: {
    spots: [
      { label: "Close the tour", at: [30, 67], size: ICON, to: "room", move: "out" },
      { label: "Cinematic", at: [303, 700], size: [116, 36], to: "vrCinematic", move: "fade" },
      { label: "Dollhouse", at: [303, 737], size: [116, 36], to: "vrDollhouse", move: "out" },
    ],
  },
  vrCinematic: {
    spots: [
      { label: "Close the tour", at: [30, 67], size: ICON, to: "room", move: "out" },
      { label: "Walk", at: [303, 661], size: [116, 36], to: "vrWalk", move: "fade" },
      { label: "Dollhouse", at: [303, 737], size: [116, 36], to: "vrDollhouse", move: "out" },
    ],
  },
};

/** Room8, clickable, with the app's real screens */
export default function Room8Flow() {
  return <ScreenFlow name="Room8" screens={room8} flow={FLOW} start="splash" />;
}
