"use client";

import { BTN, FULL, ICON, ScreenFlow, type Flow, type FlowNode, type Spot, wholeFlow } from "@/components/case-study/prototypes/screen-flow";
import built from "@/content/built/case-tracker.json";
import { caseTracker } from "@/content/case-tracker";

const screens = { ...caseTracker, ...built };
type Id = keyof typeof screens;
type S = Spot<Id>;

const back = (to: Id, at: [number, number] = [21, 74]): S => ({ label: "Back", at, size: ICON, to, move: "back" });
const skip = (to: Id): S => ({ label: "Skip", at: [326, 70], size: [64, 44], to });
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
const start = (next: Id): S[] => [
  { label: "Next", at: [187, 240], size: [375, 300], to: next },
  { label: "Get started", at: [187, 703], size: [343, 48], to: "status" },
  { label: "Skip", at: [351, 64], size: [56, 44], to: "home", move: "in" },
];

/** The app's real flow, as a map of its real screens */
const DRAWN: Flow<Id> = {
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

/** The rest of what can be tapped on the drawn screens */
const MORE: Partial<Record<Id, Partial<FlowNode<Id>>>> = {
  welcome1: {
    spots: [
      { label: "Get started", at: [187, 703], size: [343, 48], to: "statusEmpty" },
      { label: "Log in", at: [260, 748], size: [64, 40], to: "login" },
      { label: "Skip", at: [338, 64], size: [60, 44], to: "homeEmpty", move: "in" },
    ],
  },
  welcome2: {
    spots: [
      { label: "Get started", at: [187, 703], size: [343, 48], to: "statusEmpty" },
      { label: "Log in", at: [260, 748], size: [64, 40], to: "login" },
      { label: "Skip", at: [338, 64], size: [60, 44], to: "homeEmpty", move: "in" },
    ],
  },
  welcome3: {
    spots: [
      { label: "Get started", at: [187, 703], size: [343, 48], to: "statusEmpty" },
      { label: "Log in", at: [260, 748], size: [64, 40], to: "login" },
      { label: "Skip", at: [338, 64], size: [60, 44], to: "homeEmpty", move: "in" },
    ],
  },
  login: {
    spots: [
      { label: "Forgot password?", at: [298, 389], size: [130, 36], to: "forgotPassword" },
      { label: "Log in", at: [187, 445], size: [343, 48], to: "home", move: "in" },
      { label: "Continue with Google", at: [187, 561], size: [343, 48], to: "home", move: "in" },
      { label: "Continue with Apple", at: [187, 621], size: [343, 48], to: "home", move: "in" },
      { label: "Sign up", at: [254, 670], size: [64, 36], to: "signUp" },
      { label: "Continue as guest", at: [190, 715], size: [150, 40], to: "homeEmpty", move: "in" },
    ],
  },
  statusEmpty: {
    spots: [
      { label: "Back", at: [21, 74], size: [48, 48], to: "welcome3", move: "back" },
      { label: "Skip", at: [326, 74], size: [64, 44], to: "interestsEmpty" },
      { label: "Newcomer", at: [187, 258], size: [343, 58], to: "status", move: "fade" },
      { label: "Resident", at: [187, 328], size: [343, 58], to: "status", move: "fade" },
      { label: "Established", at: [187, 398], size: [343, 58], to: "status", move: "fade" },
      { label: "Prefer not to say", at: [187, 468], size: [343, 58], to: "status", move: "fade" },
    ],
  },
  status: {
    spots: [
      { label: "Continue", at: [187, 736], size: [343, 52], to: "interestsEmpty" },
      { label: "Resident", at: [187, 328], size: [343, 58], to: "statusEmpty", move: "fade" },
      { label: "Skip", at: [326, 70], size: [64, 44], to: "interestsEmpty" },
    ],
  },
  interestsEmpty: {
    spots: [
      { label: "Back", at: [21, 74], size: [48, 48], to: "status", move: "back" },
      { label: "Skip", at: [326, 74], size: [64, 44], to: "addCase" },
      { label: "Pick interests", at: [187, 385], size: [343, 224], to: "interests", move: "fade" },
    ],
  },
  interests: {
    spots: [
      { label: "Back", at: [21, 74], size: [48, 48], to: "status", move: "back" },
      { label: "Clear interests", at: [187, 385], size: [343, 224], to: "interestsEmpty", move: "fade" },
    ],
  },
  homeEmpty: {
    spots: [
      { label: "Notifications", at: [335, 72], size: [48, 48], to: "notifications" },
      { label: "Add case", at: [187, 272], size: [140, 48], to: "addCase" },
      { label: "Ask AI", at: [62, 425], size: [90, 40], to: "askAI", move: "in" },
      { label: "Upcoming events", at: [187, 570], size: [343, 120], to: "events" },
      { label: "Suggested communities", at: [187, 720], size: [343, 120], to: "groups" },
      { label: "Log in", at: [60, 72], size: [100, 48], to: "login" },
    ],
  },
  home: {
    spots: [
      { label: "Your profile", at: [36, 79], size: [48, 48], to: "profile" },
      { label: "Notifications", at: [340, 78], size: [48, 48], to: "notifications" },
      { label: "Open your case", at: [187, 265], size: [343, 170], to: "caseDetails" },
      { label: "Ask AI", at: [187, 428], size: [343, 116], to: "askAI", move: "in" },
      { label: "See all events", at: [338, 525], size: [72, 40], to: "events" },
      { label: "Open the workshop", at: [142, 640], size: [252, 130], to: "event" },
      { label: "Open the H-1B town hall", at: [326, 640], size: [96, 130], to: "events" },
      { label: "More", at: [335, 742], size: [72, 52], to: "profile", move: "fade" },
    ],
  },
  cases: {
    spots: [
      { label: "Open I-485", at: [187, 180], size: [343, 128], to: "caseDetails" },
      { label: "Open I-765", at: [187, 313], size: [343, 114], to: "caseApproved" },
      { label: "More", at: [335, 742], size: [72, 52], to: "profile", move: "fade" },
    ],
  },
  community: {
    spots: [
      { label: "Messages", at: [344, 66], size: [48, 48], to: "messages" },
      { label: "Search", at: [187, 127], size: [343, 40], to: "searchCommunity" },
      { label: "All", at: [30, 180], size: [50, 40], to: "feedAll", move: "fade" },
      { label: "Family Green Card", at: [258, 180], size: [120, 40], to: "feedFamily", move: "fade" },
      { label: "Business and student visas", at: [344, 180], size: [50, 40], to: "feedBusiness", move: "fade" },
      { label: "Open a post's timeline", at: [187, 400], size: [343, 280], to: "postView" },
      { label: "Join the conversation", at: [187, 671], size: [343, 64], to: "signUp" },
      { label: "More", at: [335, 742], size: [72, 52], to: "profile", move: "fade" },
    ],
  },
  forYou: {
    spots: [
      { label: "Messages", at: [345, 66], size: [48, 48], to: "messages" },
      { label: "Search", at: [187, 127], size: [343, 40], to: "searchCommunity" },
      { label: "Groups", at: [270, 184], size: [160, 44], to: "groups", move: "fade" },
      { label: "All", at: [30, 252], size: [50, 40], to: "feedAll", move: "fade" },
      { label: "Employment Green Card", at: [118, 252], size: [124, 40], to: "feedEmployment", move: "fade" },
      { label: "Family Green Card", at: [258, 252], size: [120, 40], to: "feedFamily", move: "fade" },
      { label: "Open a post", at: [187, 440], size: [343, 250], to: "postView" },
      { label: "New post or group", at: [330, 660], size: [60, 60], to: "newChoice", move: "sheet" },
      { label: "Home", at: [40, 742], size: [68, 52], to: "home", move: "fade" },
      { label: "My cases", at: [114, 742], size: [68, 52], to: "cases", move: "fade" },
      { label: "Consultants", at: [187, 742], size: [68, 52], to: "consultants", move: "fade" },
      { label: "More", at: [335, 742], size: [72, 52], to: "profile", move: "fade" },
    ],
  },
  feedAll: {
    spots: [
      { label: "Messages", at: [345, 66], size: [48, 48], to: "messages" },
      { label: "Search", at: [187, 127], size: [343, 40], to: "searchCommunity" },
      { label: "Open a post", at: [187, 400], size: [343, 300], to: "postView" },
      { label: "Employment Green Card", at: [118, 177], size: [124, 40], to: "feedEmployment", move: "fade" },
      { label: "Family Green Card", at: [258, 177], size: [120, 40], to: "feedFamily", move: "fade" },
      { label: "Business and student visas", at: [344, 177], size: [50, 40], to: "feedBusiness", move: "fade" },
      { label: "New post", at: [330, 715], size: [60, 60], to: "createPost", move: "sheet" },
      { label: "For you", at: [60, 66], size: [120, 44], to: "forYou", move: "fade" },
    ],
  },
  feedEmployment: {
    spots: [
      { label: "Messages", at: [345, 66], size: [48, 48], to: "messages" },
      { label: "Search", at: [187, 127], size: [343, 40], to: "searchCommunity" },
      { label: "Open a post", at: [187, 400], size: [343, 300], to: "postView" },
      { label: "All", at: [30, 177], size: [50, 40], to: "feedAll", move: "fade" },
      { label: "Family Green Card", at: [258, 177], size: [120, 40], to: "feedFamily", move: "fade" },
      { label: "Business and student visas", at: [344, 177], size: [50, 40], to: "feedBusiness", move: "fade" },
      { label: "New post", at: [330, 755], size: [60, 60], to: "createPost", move: "sheet" },
      { label: "For you", at: [60, 66], size: [120, 44], to: "forYou", move: "fade" },
    ],
  },
  feedFamily: {
    spots: [
      { label: "Messages", at: [345, 66], size: [48, 48], to: "messages" },
      { label: "Search", at: [187, 127], size: [343, 40], to: "searchCommunity" },
      { label: "Open a post", at: [187, 400], size: [343, 300], to: "postView" },
      { label: "Employment Green Card", at: [90, 177], size: [124, 40], to: "feedEmployment", move: "fade" },
      { label: "Business and student visas", at: [322, 177], size: [90, 40], to: "feedBusiness", move: "fade" },
      { label: "All", at: [12, 177], size: [24, 40], to: "feedAll", move: "fade" },
      { label: "New post", at: [330, 755], size: [60, 60], to: "createPost", move: "sheet" },
      { label: "For you", at: [60, 66], size: [120, 44], to: "forYou", move: "fade" },
    ],
  },
  feedBusiness: {
    spots: [
      { label: "Messages", at: [345, 66], size: [48, 48], to: "messages" },
      { label: "Search", at: [187, 127], size: [343, 40], to: "searchCommunity" },
      { label: "Open a post", at: [187, 400], size: [343, 300], to: "postView" },
      { label: "Family Green Card", at: [110, 177], size: [120, 40], to: "feedFamily", move: "fade" },
      { label: "All", at: [18, 177], size: [36, 40], to: "feedAll", move: "fade" },
      { label: "New post", at: [330, 755], size: [60, 60], to: "createPost", move: "sheet" },
      { label: "For you", at: [60, 66], size: [120, 44], to: "forYou", move: "fade" },
    ],
  },
  newChoice: {
    spots: [
      { label: "Close", at: [187, 245], size: [375, 490], to: "forYou", move: "drop" },
      { label: "Posts", at: [187, 615], size: [343, 52], to: "createPost" },
      { label: "Groups", at: [187, 675], size: [343, 52], to: "newGroupChoice", move: "fade" },
    ],
    sheet: {"top":490,"over":"forYou"},
  },
  newGroupChoice: {
    spots: [
      { label: "Close", at: [187, 245], size: [375, 490], to: "forYou", move: "drop" },
      { label: "Posts", at: [187, 615], size: [343, 52], to: "createPost" },
      { label: "Continue", at: [187, 741], size: [343, 48], to: "createGroup" },
    ],
    sheet: {"top":490,"over":"forYou"},
  },
  createGroup: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "forYou", move: "back" },
      { label: "Drafts", at: [330, 70], size: [64, 44], to: "drafts" },
      { label: "Appearance and privacy", at: [273, 125], size: [170, 40], to: "createGroupLook", move: "fade" },
      { label: "Create group", at: [187, 772], size: [343, 48], to: "createGroupLook" },
      { label: "Save as draft", at: [187, 806], size: [160, 18], to: "draftSaved", move: "sheet" },
    ],
  },
  createGroupLook: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "createGroup", move: "back" },
      { label: "Drafts", at: [330, 70], size: [64, 44], to: "drafts" },
      { label: "Basic", at: [101, 125], size: [170, 40], to: "createGroup", move: "fade" },
      { label: "Privacy level", at: [187, 390], size: [343, 56], to: "groupPrivacy", move: "sheet" },
      { label: "Posting rules", at: [187, 451], size: [343, 56], to: "groupPosting", move: "sheet" },
      { label: "Create group", at: [187, 771], size: [343, 48], to: "groupSubmitted", move: "fade" },
    ],
  },
  groupPrivacy: {
    spots: [
      { label: "Close", at: [187, 227], size: [375, 455], to: "createGroupLook", move: "drop" },
      { label: "Public", at: [187, 575], size: [343, 60], to: "createGroupLook", move: "drop" },
      { label: "Private", at: [187, 642], size: [343, 60], to: "createGroupLook", move: "drop" },
      { label: "Hidden", at: [187, 709], size: [343, 60], to: "createGroupLook", move: "drop" },
    ],
    sheet: {"top":455,"over":"createGroupLook"},
  },
  groupPosting: {
    spots: [
      { label: "Close", at: [187, 227], size: [375, 455], to: "createGroupLook", move: "drop" },
      { label: "Anyone can post", at: [187, 595], size: [343, 52], to: "createGroupLook", move: "drop" },
      { label: "Members only", at: [187, 655], size: [343, 52], to: "createGroupLook", move: "drop" },
      { label: "Only admins", at: [187, 715], size: [343, 52], to: "createGroupLook", move: "drop" },
    ],
    sheet: {"top":455,"over":"createGroupLook"},
  },
  groupSubmitted: {
    spots: [
      { label: "View my groups", at: [187, 675], size: [343, 48], to: "myGroupsPending" },
      { label: "Back to home", at: [187, 723], size: [180, 44], to: "home", move: "out" },
    ],
  },
  profile: {
    spots: [
      { label: "My cases", at: [187, 273], size: [306, 60], to: "cases", move: "fade" },
      { label: "My appointments", at: [187, 339], size: [306, 60], to: "appointments" },
      { label: "Posts", at: [187, 402], size: [306, 58], to: "myPosts" },
      { label: "Groups", at: [187, 463], size: [306, 58], to: "myGroups" },
      { label: "Bookmarks", at: [187, 524], size: [306, 58], to: "bookmarks" },
      { label: "Notifications", at: [187, 585], size: [306, 58], to: "notifications" },
      { label: "Edit profile", at: [187, 646], size: [306, 58], to: "editProfile" },
      { label: "Find consultants", at: [187, 707], size: [306, 58], to: "consultants", move: "fade" },
      { label: "Resources and settings", at: [187, 784], size: [340, 50], to: "profileMore" },
      { label: "Home", at: [187, 110], size: [120, 90], to: "home", move: "fade" },
    ],
  },
  myGroups: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "profile", move: "back" },
      { label: "Pending", at: [187, 120], size: [110, 40], to: "myGroupsPending", move: "fade" },
      { label: "Rejected", at: [301, 120], size: [110, 40], to: "myGroupsRejected", move: "fade" },
      { label: "View group", at: [187, 502], size: [319, 44], to: "myGroup" },
    ],
  },
  myGroupsPending: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "profile", move: "back" },
      { label: "Approved", at: [66, 120], size: [110, 40], to: "myGroups", move: "fade" },
      { label: "Rejected", at: [301, 120], size: [110, 40], to: "myGroupsRejected", move: "fade" },
    ],
  },
  myGroupsRejected: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "profile", move: "back" },
      { label: "Approved", at: [66, 120], size: [110, 40], to: "myGroups", move: "fade" },
      { label: "Pending", at: [187, 120], size: [110, 40], to: "myGroupsPending", move: "fade" },
      { label: "View reasons", at: [187, 427], size: [319, 44], to: "groupRejection", move: "sheet" },
    ],
  },
  groupRejection: {
    spots: [
      { label: "Close", at: [187, 235], size: [375, 470], to: "myGroupsRejected", move: "drop" },
    ],
    sheet: {"top":470,"over":"myGroupsRejected"},
  },
  myGroup: {
    spots: [
      { label: "Back", at: [34, 72], size: [48, 48], to: "myGroups", move: "back" },
      { label: "More", at: [341, 72], size: [48, 48], to: "myGroupMenu", move: "sheet" },
    ],
  },
  myGroupMenu: {
    spots: [
      { label: "Close", at: [187, 303], size: [375, 607], to: "myGroup", move: "drop" },
      { label: "Edit", at: [187, 670], size: [343, 48], to: "createGroup" },
      { label: "Share", at: [187, 722], size: [343, 48], to: "myGroup", move: "drop" },
      { label: "Delete group", at: [187, 774], size: [343, 48], to: "groupDeleted", move: "fade" },
    ],
    sheet: {"top":607,"over":"myGroup"},
  },
  myPosts: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "profile", move: "back" },
      { label: "Replies", at: [187, 175], size: [110, 40], to: "myReplies", move: "fade" },
      { label: "Likes", at: [311, 175], size: [110, 40], to: "myLikes", move: "fade" },
      { label: "Open a post", at: [187, 400], size: [343, 260], to: "postView" },
    ],
  },
  myReplies: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "profile", move: "back" },
      { label: "Posts", at: [63, 175], size: [110, 40], to: "myPosts", move: "fade" },
      { label: "Likes", at: [311, 175], size: [110, 40], to: "myLikes", move: "fade" },
      { label: "Open a post", at: [187, 340], size: [343, 240], to: "postView" },
    ],
  },
  myLikes: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "profile", move: "back" },
      { label: "Posts", at: [63, 175], size: [110, 40], to: "myPosts", move: "fade" },
      { label: "Replies", at: [187, 175], size: [110, 40], to: "myReplies", move: "fade" },
      { label: "Open a post", at: [187, 340], size: [343, 240], to: "postView" },
    ],
  },
  bookmarks: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "profile", move: "back" },
      { label: "Open a post", at: [187, 250], size: [343, 260], to: "postView" },
    ],
  },
  groups: {
    spots: [
      { label: "Messages", at: [344, 66], size: [48, 48], to: "messages" },
      { label: "Search", at: [187, 127], size: [343, 40], to: "searchCommunity" },
      { label: "For you", at: [101, 184], size: [160, 44], to: "forYou", move: "fade" },
      { label: "Career", at: [116, 239], size: [72, 40], to: "groupsCareer", move: "fade" },
      { label: "Social", at: [192, 239], size: [60, 40], to: "groupsCareer", move: "fade" },
      { label: "Join group", at: [187, 561], size: [319, 44], to: "group" },
      { label: "Sign up", at: [187, 671], size: [343, 64], to: "signUp" },
      { label: "More", at: [335, 742], size: [72, 52], to: "profile", move: "fade" },
    ],
  },
  group: {
    spots: [
      { label: "Join", at: [332, 282], size: [64, 44], to: "groupJoined", move: "fade" },
      { label: "More", at: [341, 72], size: [48, 48], to: "groupMenu", move: "sheet" },
      { label: "Open Emeka’s post", at: [187, 490], size: [343, 150], to: "postView" },
      { label: "Open Blessing’s post", at: [187, 690], size: [343, 150], to: "postView" },
    ],
  },
  groupMenu: {
    spots: [
      { label: "Close", at: [187, 303], size: [375, 607], to: "group", move: "drop" },
      { label: "Report", at: [187, 670], size: [343, 48], to: "report" },
      { label: "Share", at: [187, 722], size: [343, 48], to: "group", move: "drop" },
      { label: "Leave group", at: [187, 774], size: [343, 48], to: "leaveGroup", move: "fade" },
    ],
    sheet: {"top":607,"over":"group"},
  },
  leaveGroup: {
    spots: [
      { label: "Cancel", at: [237, 487], size: [72, 44], to: "group", move: "fade" },
      { label: "Leave", at: [302, 487], size: [60, 44], to: "leftGroup", move: "fade" },
    ],
  },
  leftGroup: {
    spots: [
      { label: "Continue", at: [187, 406], size: [375, 812], to: "forYou", move: "fade" },
    ],
    auto: { to: "forYou", after: 2200, move: "fade" },
  },
  report: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "group", move: "back" },
      { label: "Spam", at: [187, 223], size: [343, 46], to: "reportPicked", move: "fade" },
      { label: "Hate, abuse or harassment", at: [187, 275], size: [343, 46], to: "reportPicked", move: "fade" },
      { label: "Child safety", at: [187, 327], size: [343, 46], to: "reportPicked", move: "fade" },
      { label: "Violent speech", at: [187, 379], size: [343, 46], to: "reportPicked", move: "fade" },
      { label: "Illegal behaviour", at: [187, 431], size: [343, 46], to: "reportPicked", move: "fade" },
      { label: "Impersonation", at: [187, 483], size: [343, 46], to: "reportPicked", move: "fade" },
      { label: "Suicide or self-harm", at: [187, 535], size: [343, 46], to: "reportPicked", move: "fade" },
      { label: "Violent extremism", at: [187, 587], size: [343, 46], to: "reportPicked", move: "fade" },
      { label: "Civic integrity", at: [187, 639], size: [343, 46], to: "reportPicked", move: "fade" },
    ],
  },
  reportPicked: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "group", move: "back" },
      { label: "Next", at: [187, 776], size: [343, 48], to: "reportDone" },
    ],
  },
  reportDone: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "report", move: "back" },
      { label: "Leave group", at: [187, 496], size: [343, 48], to: "leftGroup", move: "fade" },
      { label: "Done", at: [187, 728], size: [343, 48], to: "forYou", move: "out" },
    ],
  },
  createPost: {
    spots: [
      { label: "Drafts", at: [263, 70], size: [60, 44], to: "drafts" },
      { label: "Select category", at: [187, 639], size: [343, 52], to: "category", move: "sheet" },
      { label: "Who can reply", at: [187, 696], size: [343, 52], to: "whoReply", move: "sheet" },
      { label: "Upload", at: [50, 751], size: [84, 44], to: "postImages", move: "fade" },
      { label: "Add hashtag", at: [145, 751], size: [104, 44], to: "hashtags", move: "sheet" },
      { label: "Add a timeline", at: [248, 751], size: [90, 44], to: "chooseCase" },
    ],
  },
  category: {
    spots: [
      { label: "Close", at: [187, 105], size: [375, 210], to: "createPost", move: "drop" },
      { label: "Employment Green Card", at: [187, 267], size: [343, 48], to: "categoryOpen", move: "fade" },
      { label: "Save", at: [187, 752], size: [343, 48], to: "createPost", move: "drop" },
    ],
    sheet: {"top":210,"over":"createPost"},
  },
  categoryOpen: {
    spots: [
      { label: "Close", at: [187, 75], size: [375, 150], to: "createPost", move: "drop" },
      { label: "EB1, EB2 and EB2-NIW", at: [187, 262], size: [343, 90], to: "categoryPicked", move: "fade" },
      { label: "Save", at: [187, 752], size: [343, 48], to: "createPost", move: "drop" },
    ],
    sheet: {"top":150,"over":"createPost"},
  },
  categoryPicked: {
    spots: [
      { label: "Close", at: [187, 48], size: [375, 97], to: "createPost", move: "drop" },
      { label: "EB3-Unskilled", at: [283, 191], size: [100, 36], to: "categoryMax", move: "fade" },
      { label: "EB4", at: [144, 233], size: [60, 36], to: "categoryMax", move: "fade" },
      { label: "Save", at: [187, 740], size: [343, 48], to: "postCategory", move: "fade" },
    ],
    sheet: {"top":97,"over":"createPost"},
  },
  categoryMax: {
    spots: [
      { label: "Continue", at: [187, 406], size: [375, 812], to: "categoryPicked", move: "fade" },
    ],
    sheet: {"top":97,"over":"createPost"},
    auto: { to: "categoryPicked", after: 2000, move: "fade" },
  },
  postCategory: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "community", move: "back" },
      { label: "Drafts", at: [263, 70], size: [60, 44], to: "drafts" },
      { label: "Write something", at: [200, 170], size: [300, 120], to: "writePost", move: "fade" },
      { label: "Select category", at: [187, 590], size: [343, 40], to: "categoryPicked", move: "sheet" },
      { label: "Who can reply", at: [187, 696], size: [343, 52], to: "whoReply", move: "sheet" },
      { label: "Upload", at: [50, 751], size: [84, 44], to: "postImages", move: "fade" },
      { label: "Add hashtag", at: [145, 751], size: [104, 44], to: "hashtags", move: "sheet" },
      { label: "Add a timeline", at: [248, 751], size: [90, 44], to: "chooseCase" },
    ],
  },
  whoReply: {
    spots: [
      { label: "Close", at: [187, 295], size: [375, 590], to: "postCategory", move: "drop" },
      { label: "Everyone", at: [187, 660], size: [343, 52], to: "postCategory", move: "drop" },
      { label: "Only users you mention", at: [187, 720], size: [343, 52], to: "postMention", move: "fade" },
    ],
    sheet: {"top":590,"over":"postCategory"},
  },
  postMention: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "community", move: "back" },
      { label: "Drafts", at: [263, 70], size: [60, 44], to: "drafts" },
      { label: "Write something", at: [200, 170], size: [300, 120], to: "writePost", move: "fade" },
      { label: "Select category", at: [187, 600], size: [343, 40], to: "categoryPicked", move: "sheet" },
      { label: "Who can reply", at: [187, 696], size: [343, 52], to: "whoReply", move: "sheet" },
      { label: "Upload", at: [50, 751], size: [84, 44], to: "postImages", move: "fade" },
      { label: "Add hashtag", at: [145, 751], size: [104, 44], to: "hashtags", move: "sheet" },
      { label: "Add a timeline", at: [248, 751], size: [90, 44], to: "chooseCase" },
    ],
  },
  postImages: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "community", move: "back" },
      { label: "Drafts", at: [263, 70], size: [60, 44], to: "drafts" },
      { label: "Post", at: [330, 70], size: [56, 44], to: "posted", move: "fade" },
      { label: "Add a timeline", at: [248, 751], size: [90, 44], to: "chooseCase" },
    ],
  },
  writePost: {
    spots: [
      { label: "Drafts", at: [263, 70], size: [60, 44], to: "drafts" },
      { label: "Post", at: [330, 70], size: [56, 44], to: "posted", move: "fade" },
    ],
  },
  drafts: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "createPost", move: "back" },
      { label: "Edit", at: [336, 70], size: [60, 44], to: "draftsEdit", move: "fade" },
      { label: "Open the first draft", at: [187, 140], size: [343, 80], to: "writePost" },
      { label: "Open the second draft", at: [187, 236], size: [343, 80], to: "writePost" },
    ],
  },
  draftsEdit: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "drafts", move: "back" },
      { label: "Select the first draft", at: [187, 140], size: [343, 80], to: "draftsPicked", move: "fade" },
      { label: "Cancel", at: [342, 70], size: [60, 44], to: "drafts", move: "fade" },
    ],
  },
  draftsPicked: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "drafts", move: "back" },
      { label: "Clear the selection", at: [187, 140], size: [343, 80], to: "draftsEdit", move: "fade" },
      { label: "Delete", at: [342, 70], size: [60, 44], to: "drafts", move: "fade" },
    ],
  },
  chooseCase: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "createPost", move: "back" },
      { label: "Choose I-485", at: [187, 177], size: [343, 110], to: "chooseCasePicked", move: "fade" },
    ],
  },
  chooseCasePicked: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "createPost", move: "back" },
      { label: "Clear the choice", at: [187, 177], size: [343, 110], to: "chooseCase", move: "fade" },
      { label: "Done", at: [187, 741], size: [343, 48], to: "timeline" },
    ],
  },
  timeline: {
    spots: [
      { label: "Done", at: [300, 71], size: [56, 44], to: "postTimeline" },
      { label: "Share", at: [347, 71], size: [44, 44], to: "shareCase", move: "sheet" },
      { label: "Add an update", at: [347, 278], size: [44, 44], to: "updateEmpty" },
    ],
  },
  updateEmpty: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "timeline", move: "back" },
      { label: "Fill it in", at: [187, 300], size: [343, 340], to: "updateFilled", move: "fade" },
    ],
  },
  updateFilled: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "timeline", move: "back" },
      { label: "Save", at: [187, 741], size: [343, 48], to: "timelineUpdated" },
    ],
  },
  timelineUpdated: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "timeline", move: "back" },
      { label: "Done", at: [300, 71], size: [56, 44], to: "postTimeline" },
      { label: "Share", at: [347, 71], size: [44, 44], to: "shareCase", move: "sheet" },
      { label: "Add an update", at: [347, 278], size: [44, 44], to: "updateEmpty" },
    ],
  },
  postTimeline: {
    spots: [
      { label: "Back", at: [34, 70], size: [48, 48], to: "community", move: "back" },
      { label: "Drafts", at: [263, 70], size: [60, 44], to: "drafts" },
      { label: "Edit the timeline", at: [60, 327], size: [100, 44], to: "timelineUpdated" },
      { label: "Post", at: [330, 70], size: [56, 44], to: "posted", move: "fade" },
      { label: "Select category", at: [187, 636], size: [343, 52], to: "category", move: "sheet" },
      { label: "Who can reply", at: [187, 694], size: [343, 52], to: "whoReply", move: "sheet" },
      { label: "Upload", at: [50, 748], size: [84, 44], to: "postImages", move: "fade" },
      { label: "Add hashtag", at: [145, 748], size: [104, 44], to: "hashtags", move: "sheet" },
    ],
  },
  postView: {
    spots: [
      { label: "Back", at: [31, 71], size: [48, 48], to: "timelinePost", move: "back" },
      { label: "More", at: [344, 71], size: [44, 44], to: "postMenu", move: "sheet" },
      { label: "Write a comment", at: [140, 751], size: [220, 48], to: "commentPosted", move: "fade" },
      { label: "Reply", at: [322, 751], size: [64, 44], to: "commentPosted", move: "fade" },
    ],
  },
  postMenu: {
    spots: [
      { label: "Close", at: [187, 265], size: [375, 530], to: "postView", move: "drop" },
      { label: "Report", at: [187, 593], size: [343, 48], to: "report" },
      { label: "Hide post", at: [187, 645], size: [343, 48], to: "community", move: "fade" },
      { label: "Share", at: [187, 697], size: [343, 48], to: "shareCase", move: "fade" },
      { label: "Cancel", at: [187, 749], size: [343, 48], to: "postView", move: "drop" },
    ],
    sheet: {"top":530,"over":"postView"},
  },
  timelinePost: {
    spots: [
      { label: "Messages", at: [344, 66], size: [48, 48], to: "messages" },
      { label: "Search", at: [187, 127], size: [343, 40], to: "searchCommunity" },
      { label: "Groups", at: [344, 180], size: [60, 40], to: "groups", move: "fade" },
      { label: "Open the post", at: [187, 430], size: [343, 320], to: "postView" },
      { label: "More", at: [335, 742], size: [72, 52], to: "profile", move: "fade" },
    ],
  },
  event: {
    spots: [
      { label: "Back", at: [38, 76], size: [48, 48], to: "events", move: "back" },
      { label: "Share", at: [341, 76], size: [48, 48], to: "shareCase", move: "sheet" },
      { label: "RSVP, it’s free", at: [187, 753], size: [335, 48], to: "eventGoing", move: "fade" },
    ],
  },
  consultants: {
    spots: [
      { label: "My appointments", at: [344, 66], size: [48, 48], to: "appointments" },
      { label: "Search", at: [187, 127], size: [343, 40], to: "searchConsultants" },
      { label: "View Maria Alvarez", at: [187, 273], size: [343, 92], to: "consultant" },
      { label: "View Isaiah Jose", at: [187, 372], size: [343, 88], to: "consultantOther" },
      { label: "View Ethan Davies", at: [187, 478], size: [343, 100], to: "consultantOther" },
      { label: "View Eniola Balogun", at: [187, 584], size: [343, 88], to: "consultantOther" },
      { label: "View Pere Adeshina", at: [187, 672], size: [343, 60], to: "consultantOther" },
      { label: "More", at: [335, 742], size: [72, 52], to: "profile", move: "fade" },
    ],
  },
  consultant: {
    spots: [
      { label: "Back", at: [34, 75], size: [48, 48], to: "consultants", move: "back" },
      { label: "Share", at: [347, 224], size: [44, 44], to: "consultantShared", move: "sheet" },
      { label: "Read more", at: [60, 514], size: [90, 32], to: "consultantMore" },
      { label: "See packages and book", at: [187, 725], size: [343, 110], to: "consultantMore" },
      { label: "View all packages", at: [335, 798], size: [72, 24], to: "pricing" },
    ],
  },
  pricing: {
    spots: [
      { label: "Back", at: [34, 75], size: [48, 48], to: "consultantMore", move: "back" },
      { label: "EB-1A Strategy Consultation", at: [187, 200], size: [343, 100], to: "bookEmpty" },
      { label: "EB-1A Premium Filing", at: [187, 330], size: [343, 120], to: "bookEmpty" },
      { label: "EB-1A Concierge Plus", at: [187, 455], size: [343, 110], to: "bookEmpty" },
    ],
  },
  bookEmpty: {
    spots: [
      { label: "Back", at: [34, 78], size: [48, 48], to: "consultant", move: "back" },
      { label: "Select event type", at: [187, 187], size: [343, 48], to: "bookType", move: "fade" },
    ],
  },
  bookType: {
    spots: [
      { label: "Back", at: [34, 78], size: [48, 48], to: "bookEmpty", move: "back" },
      { label: "Initial Strategy Session", at: [187, 243], size: [320, 36], to: "bookTyped", move: "fade" },
      { label: "Strategy Consultation", at: [187, 279], size: [320, 36], to: "bookTyped", move: "fade" },
      { label: "Premium Consultation", at: [187, 314], size: [320, 36], to: "bookTyped", move: "fade" },
      { label: "Document Review", at: [187, 350], size: [320, 36], to: "bookTyped", move: "fade" },
    ],
  },
  bookTyped: {
    spots: [
      { label: "Back", at: [34, 78], size: [48, 48], to: "bookEmpty", move: "back" },
      { label: "Change event type", at: [187, 187], size: [343, 48], to: "bookType", move: "fade" },
      { label: "Pick a date", at: [187, 520], size: [343, 240], to: "book", move: "fade" },
    ],
  },
  confirmed: {
    spots: [
      { label: "View my appointments", at: [187, 671], size: [343, 52], to: "appointments", move: "out" },
    ],
  },
  appointments: {
    spots: [
      { label: "Back", at: [34, 75], size: [48, 48], to: "profile", move: "back" },
      { label: "Past", at: [134, 127], size: [60, 40], to: "appointmentsPast", move: "fade" },
      { label: "Join meeting", at: [98, 424], size: [152, 44], to: "meeting", move: "in" },
      { label: "Message", at: [268, 424], size: [152, 44], to: "thread" },
      { label: "View Maria Alvarez", at: [140, 208], size: [240, 60], to: "consultant" },
    ],
  },
};

const FLOW = wholeFlow<Id>(DRAWN, MORE, built);

/** Immigify Case Tracker+, clickable, with the app's real screens */
export default function CaseTrackerFlow() {
  return <ScreenFlow name="Case Tracker+" screens={screens} flow={FLOW} start="splash" island tint="#dc143c" />;
}
