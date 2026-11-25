"use client";

import { BTN, FULL, ICON, ScreenFlow, type Flow, type FlowNode, type Spot, wholeFlow } from "@/components/case-study/prototypes/screen-flow";
import built from "@/content/built/room8.json";
import { room8 } from "@/content/room8";

const screens = { ...room8, ...built };
type Id = keyof typeof screens;
type S = Spot<Id>;

const back = (to: Id, at: [number, number] = [32, 68]): S => ({ label: "Back", at, size: ICON, to, move: "back" });
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
const DRAWN: Flow<Id> = {
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

/** The rest of what can be tapped on the drawn screens */
const MORE: Partial<Record<Id, Partial<FlowNode<Id>>>> = {
  onboarding1: {
    spots: [
      { label: "Skip", at: [58, 743], size: [72, 48], to: "login" },
    ],
  },
  onboarding2: {
    spots: [
      { label: "Skip", at: [57, 743], size: [72, 48], to: "login" },
    ],
  },
  onboarding3: {
    spots: [
      { label: "Get started", at: [268, 743], size: [120, 48], to: "signup" },
      { label: "Skip", at: [56, 743], size: [72, 48], to: "login" },
    ],
  },
  login: {
    spots: [
      { label: "Forgot password?", at: [297, 356], size: [120, 32], to: "forgot" },
      { label: "Sign in", at: [187, 419], size: [343, 44], to: "home", move: "in" },
      { label: "Sign in with Google", at: [187, 480], size: [343, 44], to: "home", move: "in" },
      { label: "Sign in with Facebook", at: [187, 536], size: [343, 44], to: "home", move: "in" },
      { label: "Sign in with Apple", at: [187, 591], size: [343, 44], to: "home", move: "in" },
      { label: "Sign up", at: [283, 640], size: [64, 32], to: "signup" },
    ],
    fields: [{ label: "Password", text: [28, 309, 42, 16], field: [16, 296, 343, 42], r: 8, bg: "#fff", chars: 8 }],
  },
  signup: {
    spots: [
      { label: "Terms of use", at: [205, 566], size: [110, 30], to: "terms" },
      { label: "Sign up", at: [187, 633], size: [343, 44], to: "verify" },
      { label: "Sign up with Google", at: [187, 693], size: [343, 44], to: "getStarted" },
      { label: "Log in", at: [270, 742], size: [64, 32], to: "login", move: "back" },
    ],
    fields: [{ label: "Password", text: [28, 401, 42, 16], field: [16, 388, 343, 42], r: 8, bg: "#fff", chars: 8 }],
  },
  verify: {
    spots: [
      { label: "Verify", at: [187, 431], size: [343, 44], to: "verified", move: "fade" },
      { label: "Room8, back to sign up", at: [28, 74], size: [48, 48], to: "signup", move: "back" },
    ],
  },
  verified: {
    spots: [
      { label: "Continue", at: [187, 406], size: [375, 812], to: "getStarted", move: "fade" },
    ],
    auto: { to: "getStarted", after: 1900, move: "fade" },
  },
  forgot: {
    spots: [
      { label: "Send reset link", at: [187, 407], size: [343, 44], to: "resetSent", move: "fade" },
      { label: "Back to log in", at: [187, 454], size: [180, 40], to: "login", move: "back" },
    ],
  },
  reset: {
    spots: [
      { label: "Reset password", at: [187, 576], size: [343, 44], to: "resetDone", move: "fade" },
      { label: "Back to log in", at: [187, 622], size: [180, 40], to: "login", move: "back" },
    ],
    fields: [
      { label: "New password", text: [28, 324, 42, 16], field: [16, 311, 343, 42], r: 8, bg: "#fff", chars: 8 },
      { label: "Confirm password", text: [28, 493, 42, 16], field: [16, 480, 343, 42], r: 8, bg: "#fff", chars: 8 },
    ],
  },
  terms: {
    spots: [
      { label: "Back", at: [24, 66], size: [48, 48], to: "signup", move: "back" },
    ],
  },
  settings: {
    spots: [
      { label: "Back", at: [25, 73], size: [48, 48], to: "home", move: "back" },
      { label: "More settings", at: [187, 745], size: [343, 96], to: "settingsMore", move: "fade" },
      { label: "Edit profile", at: [320, 150], size: [56, 40], to: "editProfile" },
      { label: "Retake", at: [334, 225], size: [56, 36], to: "questions" },
      { label: "Areas", at: [187, 267], size: [330, 28], to: "questions" },
      { label: "Budget", at: [187, 298], size: [330, 28], to: "question2" },
      { label: "Move in", at: [187, 327], size: [330, 28], to: "question3" },
      { label: "Place", at: [187, 357], size: [330, 28], to: "question4" },
      { label: "Roommate", at: [187, 387], size: [330, 28], to: "question5" },
      { label: "Lifestyle", at: [187, 425], size: [330, 44], to: "question6" },
      { label: "Roommate preferences", at: [187, 543], size: [343, 60], to: "preferences" },
      { label: "Retake matching questions", at: [187, 606], size: [343, 60], to: "questions" },
    ],
  },
  getStarted: {
    spots: [
      { label: "Rent a room or apartment", at: [273, 336], size: [156, 210], to: "getStartedRent", move: "fade" },
    ],
  },
  questions: {
    spots: [
      { label: "Continue", at: [187, 773], size: [343, 52], to: "question2" },
    ],
  },
  preferences: {
    spots: [
      { label: "Marital status", at: [187, 377], size: [343, 40], to: "preferencesFilled", move: "fade" },
      { label: "Minimum price", at: [97, 603], size: [164, 40], to: "preferencesFilled", move: "fade" },
      { label: "Maximum price", at: [277, 603], size: [164, 40], to: "preferencesFilled", move: "fade" },
      { label: "Property ratings", at: [187, 700], size: [343, 70], to: "preferencesFilled", move: "fade" },
    ],
  },
  home: {
    spots: [
      { label: "Search by location", at: [187, 141], size: [343, 42], to: "searchArea", move: "fade" },
      { label: "Notifications", at: [303, 83], size: [40, 44], to: "notifications" },
      { label: "Settings", at: [341, 83], size: [40, 44], to: "settings" },
      { label: "Edit your profile", at: [33, 84], size: [44, 44], to: "editProfile" },
      { label: "Book The Marina Suite", at: [187, 242], size: [343, 130], to: "room" },
      { label: "Homes", at: [50, 432], size: [72, 100], to: "roomsForRent", move: "fade" },
      { label: "Apartments", at: [129, 432], size: [72, 100], to: "roomsForRent", move: "fade" },
      { label: "Studios", at: [209, 432], size: [72, 100], to: "roomsForRent", move: "fade" },
      { label: "Lofts", at: [289, 432], size: [72, 100], to: "roomsForRent", move: "fade" },
      { label: "See all", at: [331, 516], size: [72, 40], to: "roomsForRent", move: "fade" },
      { label: "Open Garden Apartment", at: [322, 630], size: [106, 180], to: "room" },
      { label: "Save Sunlit Studio", at: [230, 566], size: [44, 44], to: "savedRooms", move: "fade" },
    ],
  },
  explore: {
    spots: [
      { label: "Search anything", at: [161, 74], size: [290, 40], to: "searchArea", move: "fade" },
      { label: "Rooms for Rent", at: [272, 120], size: [170, 46], to: "roomsForRent", move: "fade" },
      { label: "Open Ada Okafor", at: [187, 597], size: [343, 117], to: "roommate" },
      { label: "Save Steph Campbell", at: [86, 191], size: [40, 40], to: "savedRoommates", move: "fade" },
      { label: "Save Karoline Lee", at: [86, 318], size: [40, 40], to: "savedRoommates", move: "fade" },
      { label: "Save Melissa Randy", at: [86, 443], size: [40, 40], to: "savedRoommates", move: "fade" },
    ],
  },
  exploreMap: {
    spots: [
      { label: "Search anything", at: [161, 74], size: [290, 40], to: "searchArea", move: "fade" },
      { label: "Rooms for Rent", at: [272, 120], size: [170, 46], to: "roomsForRent", move: "fade" },
      { label: "Home in Agege", at: [81, 335], size: [44, 44], to: "roommate" },
      { label: "Home in Ojodu Berger", at: [207, 300], size: [44, 44], to: "roommate" },
      { label: "Home in Ikotun", at: [66, 467], size: [44, 44], to: "roommate" },
      { label: "Save Steph Campbell", at: [292, 676], size: [40, 40], to: "savedRoommates", move: "fade" },
    ],
  },
  filters: {
    spots: [
      { label: "Clear all", at: [283, 121], size: [90, 36], to: "explore", move: "fade" },
    ],
  },
  saved: {
    spots: [
      { label: "Roommates", at: [269, 148], size: [164, 44], to: "savedRoommates", move: "fade" },
    ],
  },
  room: {
    spots: [
      { label: "See all photos", at: [187, 140], size: [300, 100], to: "gallery", move: "fade" },
      { label: "Open the 3D tour", at: [73, 213], size: [116, 32], to: "vrLoader", move: "in" },
      { label: "Share", at: [303, 68], size: [40, 44], to: "shareRoom", move: "sheet" },
      { label: "Save this room", at: [345, 68], size: [40, 44], to: "savedRooms", move: "fade" },
      { label: "Read more", at: [47, 591], size: [90, 36], to: "roomRoommates", move: "fade" },
    ],
  },
  roomRoommates: {
    spots: [
      { label: "Scroll back up", at: [187, 28], size: [343, 48], to: "room", move: "fade" },
      { label: "Show all 10 amenities", at: [187, 86], size: [343, 36], to: "amenities", move: "sheet" },
      { label: "View Jack", at: [80, 245], size: [128, 140], to: "roommate" },
      { label: "View Marcus Brown", at: [187, 406], size: [343, 72], to: "host" },
      { label: "View map", at: [327, 604], size: [72, 36], to: "exploreMap", move: "in" },
      { label: "Open the location", at: [150, 678], size: [250, 100], to: "exploreMap", move: "in" },
    ],
  },
  bookVisit: {
    spots: [
      { label: "9:00 AM", at: [71, 539], size: [110, 40], to: "bookWho", move: "fade" },
      { label: "3:30 PM", at: [304, 615], size: [110, 40], to: "bookWho", move: "fade" },
      { label: "5:00 PM", at: [71, 691], size: [110, 40], to: "bookWho", move: "fade" },
      { label: "7:00 PM", at: [304, 691], size: [110, 40], to: "bookWho", move: "fade" },
      { label: "Choose a time", at: [187, 768], size: [343, 52], to: "bookWho", move: "fade" },
    ],
  },
  roommate: {
    spots: [
      { label: "See all photos", at: [187, 130], size: [280, 100], to: "gallery", move: "fade" },
      { label: "Share", at: [303, 68], size: [40, 44], to: "shareRoom", move: "sheet" },
      { label: "Save Alex Hunter", at: [345, 68], size: [40, 44], to: "savedRoommates", move: "fade" },
      { label: "Read more", at: [45, 584], size: [90, 36], to: "roommateMore" },
    ],
  },
  chats: {
    spots: [
      { label: "Open Marcus Brown", at: [187, 154], size: [343, 64], to: "chatMarcus" },
      { label: "Open Steph Campbell", at: [187, 298], size: [343, 64], to: "chatSteph" },
      { label: "Open Adrej Lisakov", at: [187, 370], size: [343, 64], to: "chatAdrej" },
    ],
  },
  conversation: {
    spots: [
      { label: "View Alex Hunter", at: [120, 60], size: [140, 44], to: "roommateMore" },
      { label: "Open the 1:58 AM payment", at: [243, 216], size: [232, 50], to: "payReceipt" },
      { label: "Open the 12:28 PM payment", at: [243, 400], size: [232, 50], to: "payReceipt" },
      { label: "Open the 12:41 PM payment", at: [243, 584], size: [232, 50], to: "payReceipt" },
      { label: "Attach", at: [257, 776], size: [30, 44], to: "attach", move: "sheet" },
      { label: "Camera", at: [287, 776], size: [30, 44], to: "attach", move: "sheet" },
      { label: "Voice message", at: [338, 776], size: [44, 44], to: "conversationSent", move: "fade" },
    ],
  },
  chatMenu: {
    spots: [
      { label: "Mute notifications", at: [227, 191], size: [240, 36], to: "chatMuted", move: "sheet" },
      { label: "Search", at: [227, 227], size: [240, 36], to: "chatSearch" },
    ],
  },
  payMethod: {
    spots: [
      { label: "Pay with bank", at: [187, 248], size: [343, 58], to: "payBank" },
      { label: "Pay with PayPal", at: [187, 326], size: [343, 66], to: "payPaypal" },
    ],
  },
  callEnded: {
    spots: [
      { label: "Rate the tour", at: [187, 582], size: [200, 44], to: "callRated", move: "fade" },
    ],
  },
  vrWalk: {
    spots: [
      { label: "VR", at: [303, 777], size: [116, 36], to: "vrHeadset", move: "in" },
    ],
  },
  vrDollhouse: {
    spots: [
      { label: "VR", at: [303, 777], size: [116, 36], to: "vrHeadset", move: "in" },
    ],
  },
  vrCinematic: {
    spots: [
      { label: "VR", at: [303, 777], size: [116, 36], to: "vrHeadset", move: "in" },
    ],
  },
};

const FLOW = wholeFlow<Id>(DRAWN, MORE, built);

/** Room8, clickable, with the app's real screens */
export default function Room8Flow() {
  return <ScreenFlow name="Room8" screens={screens} flow={FLOW} start="splash" />;
}
