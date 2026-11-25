"use client";

import { BTN, FULL, ICON, ScreenFlow, type Flow, type FlowNode, type Spot, wholeFlow } from "@/components/case-study/prototypes/screen-flow";
import built from "@/content/built/fundpath.json";
import { fundpath } from "@/content/fundpath";

const screens = { ...fundpath, ...built };
type Id = keyof typeof screens;
type S = Spot<Id>;

const back = (to: Id, label = "Back"): S => ({ label, at: [28, 68], size: ICON, to, move: "back" });
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
const DRAWN: Flow<Id> = {
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
      { label: "Back to home", at: [187, 647], size: BTN, to: "home", move: "out" },
    ],
  },
  myCampaigns: {
    spots: [back("home"), { label: "Open Help Sarah battle liver cancer", at: [187, 250], size: [343, 124], to: "fundUpdate" }],
  },
  fundUpdate: { spots: [back("myCampaigns")] },
};

/** The rest of what can be tapped on the drawn screens */
const MORE: Partial<Record<Id, Partial<FlowNode<Id>>>> = {
  welcome1: {
    spots: [
      { label: "Log in", at: [187, 649], size: [343, 46], to: "signIn" },
      { label: "Sign up", at: [187, 710], size: [343, 46], to: "signUp" },
    ],
  },
  welcome2: {
    spots: [
      { label: "Log in", at: [187, 649], size: [343, 46], to: "signIn" },
      { label: "Sign up", at: [187, 710], size: [343, 46], to: "signUp" },
    ],
  },
  welcome3: {
    spots: [
      { label: "Log in", at: [187, 649], size: [343, 46], to: "signIn" },
      { label: "Sign up", at: [187, 710], size: [343, 46], to: "signUp" },
    ],
  },
  signIn: {
    spots: [
      { label: "Forgot password", at: [301, 443], size: [130, 36], to: "forgotPassword" },
      { label: "Sign in", at: [192, 517], size: [343, 44], to: "home", move: "in" },
      { label: "Sign in with Google", at: [192, 576], size: [343, 44], to: "home", move: "in" },
      { label: "Sign up", at: [277, 622], size: [70, 36], to: "signUp" },
    ],
    fields: [{ label: "Password", text: [31, 397, 82, 16], field: [20, 385, 343, 40], r: 8, bg: "#fff", chars: 12 }],
  },
  signUp: {
    spots: [
      { label: "Get started", at: [187, 591], size: [343, 44], to: "checkEmail" },
      { label: "Sign up with Google", at: [187, 651], size: [343, 44], to: "home", move: "in" },
      { label: "Log in", at: [282, 720], size: [64, 36], to: "signIn", move: "back" },
    ],
    fields: [
      { label: "Name", text: [28, 309, 64, 18], field: [16, 297, 343, 42], r: 8, bg: "#fff", chars: 8 },
      { label: "Password", text: [28, 488, 84, 18], field: [16, 476, 343, 42], r: 8, bg: "#fff", chars: 9 },
    ],
  },
  checkEmail: {
    spots: [
      { label: "Verify email", at: [187, 455], size: [343, 44], to: "emailVerified", move: "fade" },
      { label: "Resend the email", at: [276, 519], size: [120, 32], to: "resetSent", move: "fade" },
      { label: "Back to log in", at: [187, 571], size: [160, 40], to: "signIn", move: "back" },
    ],
    fields: [{ label: "Code", text: [60, 350, 255, 56], field: [46, 344, 282, 68], r: 8, bg: "#f9fafc", chars: 4 }],
  },
  emailVerified: {
    spots: [
      { label: "Continue", at: [187, 357], size: [343, 44], to: "home", move: "in" },
      { label: "Back to log in", at: [187, 472], size: [160, 40], to: "signIn", move: "back" },
    ],
  },
  home: {
    spots: [
      { label: "Search fundraisers", at: [187, 125], size: [343, 40], to: "searchCampaigns", move: "fade" },
      { label: "Menu", at: [343, 76], size: [44, 44], to: "menu" },
      { label: "Your profile", at: [36, 76], size: [44, 44], to: "editProfile" },
      { label: "Notifications", at: [110, 77], size: [100, 44], to: "notifications" },
      { label: "Add money", at: [315, 262], size: [56, 48], to: "addMoney" },
      { label: "Medical", at: [70, 337], size: [92, 62], to: "medical", move: "fade" },
      { label: "More causes", at: [306, 407], size: [92, 62], to: "categories" },
      { label: "Open Brown’s residence", at: [310, 602], size: [100, 204], to: "campaign" },
      { label: "Save Jane’s campaign", at: [204, 516], size: [40, 40], to: "saved", move: "fade" },
    ],
  },
  campaigns: {
    spots: [
      { label: "Search campaigns", at: [161, 74], size: [290, 40], to: "searchCampaigns", move: "fade" },
      { label: "Medicals", at: [186, 126], size: [84, 38], to: "medical", move: "fade" },
      { label: "Open Jack’s second campaign", at: [187, 653], size: [343, 100], to: "campaign" },
      { label: "Save Education for kids", at: [112, 180], size: [36, 36], to: "saved", move: "fade" },
      { label: "Save John’s campaign", at: [112, 293], size: [36, 36], to: "saved", move: "fade" },
      { label: "Save Shelter for stray dogs", at: [112, 405], size: [36, 36], to: "saved", move: "fade" },
    ],
  },
  filter: {
    spots: [
      { label: "Clear all", at: [328, 69], size: [80, 40], to: "campaigns", move: "fade" },
      { label: "Category", at: [187, 113], size: [343, 44], to: "filterCategory" },
      { label: "Currency type", at: [187, 657], size: [343, 44], to: "filterCurrency" },
    ],
  },
  campaign: {
    spots: [
      { label: "Save this campaign", at: [348, 66], size: [40, 44], to: "campaignSaved", move: "sheet" },
      { label: "Read more", at: [246, 651], size: [80, 32], to: "campaignMore" },
      { label: "See donors", at: [187, 698], size: [343, 32], to: "campaignMore" },
    ],
  },
  share: {
    spots: [
      { label: "Copy link", at: [35, 745], size: [52, 56], to: "shareCopied", move: "fade" },
      { label: "Facebook", at: [95, 745], size: [52, 56], to: "shareCopied", move: "fade" },
      { label: "WhatsApp", at: [155, 745], size: [52, 56], to: "shareCopied", move: "fade" },
      { label: "X", at: [215, 745], size: [52, 56], to: "shareCopied", move: "fade" },
      { label: "Instagram", at: [278, 745], size: [52, 56], to: "shareCopied", move: "fade" },
      { label: "LinkedIn", at: [338, 745], size: [52, 56], to: "shareCopied", move: "fade" },
    ],
  },
  payMethod: {
    spots: [
      { label: "Bank transfer", at: [187, 225], size: [343, 52], to: "payBank" },
      { label: "USSD", at: [187, 289], size: [343, 52], to: "payUssd" },
      { label: "PayPal", at: [187, 357], size: [343, 60], to: "payPaypal" },
      { label: "Stripe", at: [187, 429], size: [343, 60], to: "payStripe" },
    ],
  },
  success: {
    spots: [
      { label: "Leave a comment", at: [187, 647], size: [343, 46], to: "comment" },
    ],
  },
  donations: {
    spots: [
      { label: "Pending", at: [208, 390], size: [90, 40], to: "donationsPending", move: "fade" },
      { label: "Cancelled", at: [308, 390], size: [100, 40], to: "donationsCancelled", move: "fade" },
      { label: "Details of Help Steven Conor", at: [187, 549], size: [343, 72], to: "receipt", move: "fade" },
      { label: "Details of Help with food", at: [187, 628], size: [343, 72], to: "receipt", move: "fade" },
    ],
  },
  receipt: {
    spots: [
      { label: "Download receipt", at: [115, 732], size: [160, 46], to: "receiptSaved", move: "sheet" },
    ],
  },
  start: {
    spots: [
      { label: "Select category", at: [187, 240], size: [343, 44], to: "startCategory", move: "sheet" },
      { label: "Who are you fundraising for?", at: [187, 322], size: [343, 44], to: "startFor", move: "sheet" },
      { label: "Upload", at: [299, 626], size: [90, 40], to: "startFilled" },
      { label: "Preview", at: [187, 731], size: [343, 46], to: "startFilled" },
    ],
  },
  preview: {
    spots: [
      { label: "Edit", at: [347, 68], size: [44, 44], to: "start", move: "back" },
    ],
  },
  myCampaigns: {
    spots: [
      { label: "Start a campaign", at: [338, 73], size: [44, 44], to: "start", move: "sheet" },
      { label: "Completed", at: [204, 144], size: [100, 40], to: "myCampaignsCompleted", move: "fade" },
      { label: "Ongoing", at: [305, 144], size: [90, 40], to: "myCampaignsOngoing", move: "fade" },
      { label: "Update Help Sarah", at: [250, 295], size: [214, 40], to: "updateCampaign" },
      { label: "Update Help feed poor kids", at: [250, 444], size: [214, 40], to: "updateCampaign" },
      { label: "Update Give clean water", at: [250, 592], size: [214, 40], to: "updateCampaign" },
      { label: "Update Help Lekki", at: [250, 741], size: [214, 40], to: "updateCampaign" },
    ],
  },
  fundUpdate: {
    spots: [
      { label: "Update campaign", at: [343, 68], size: [44, 44], to: "updateCampaign" },
      { label: "Description", at: [70, 512], size: [110, 44], to: "campaignDescription", move: "fade" },
    ],
  },
  chat: {
    spots: [
      { label: "View Marcus Brown", at: [140, 65], size: [150, 44], to: "profile" },
      { label: "Call", at: [303, 67], size: [40, 44], to: "voiceCall", move: "in" },
      { label: "More options", at: [343, 67], size: [36, 44], to: "chatMenu", move: "sheet" },
      { label: "Attach", at: [250, 663], size: [36, 44], to: "chatSent", move: "fade" },
      { label: "Camera", at: [281, 663], size: [30, 44], to: "chatSent", move: "fade" },
      { label: "Voice message", at: [335, 663], size: [46, 44], to: "chatSent", move: "fade" },
    ],
  },
  chats: {
    spots: [
      { label: "New chat", at: [304, 74], size: [44, 44], to: "newChat" },
      { label: "More", at: [341, 74], size: [32, 44], to: "chatMenu", move: "sheet" },
      { label: "Search chats", at: [187, 126], size: [343, 40], to: "newChat" },
      { label: "Open Alex Hunter", at: [187, 297], size: [343, 80], to: "chatAlex" },
      { label: "Open Alec Whitten", at: [187, 388], size: [343, 80], to: "chatAlec" },
    ],
  },
  report: {
    spots: [
      { label: "Choose a month", at: [309, 641], size: [100, 36], to: "reportMonth", move: "sheet" },
    ],
  },
  profile: {
    spots: [
      { label: "Edit profile", at: [318, 68], size: [110, 40], to: "editOrganiser" },
      { label: "View all testimonials", at: [314, 552], size: [90, 40], to: "testimonials" },
    ],
  },
  contact: {
    spots: [
      { label: "Back", at: [28, 68], size: [48, 48], to: "menu", move: "back" },
      { label: "Chat with us", at: [88, 217], size: [150, 40], to: "liveChat" },
      { label: "Customer service", at: [129, 482], size: [230, 40], to: "voiceCall", move: "in" },
      { label: "Live chat", at: [313, 690], size: [72, 90], to: "liveChat", move: "in" },
    ],
  },
  faqs: {
    spots: [
      { label: "Back", at: [28, 68], size: [48, 48], to: "menu", move: "back" },
      { label: "What is Fund Path?", at: [187, 248], size: [343, 50], to: "faqAnswer", move: "fade" },
      { label: "How do I start a campaign?", at: [187, 304], size: [343, 50], to: "start", move: "fade" },
      { label: "Is my donation secure?", at: [187, 360], size: [343, 50], to: "faqAnswer", move: "fade" },
      { label: "How can I share my campaign?", at: [187, 416], size: [343, 50], to: "faqAnswer", move: "fade" },
      { label: "Are there fees?", at: [187, 472], size: [343, 50], to: "faqAnswer", move: "fade" },
      { label: "Has the campaign reached its goal?", at: [187, 528], size: [343, 50], to: "faqAnswer", move: "fade" },
      { label: "What if it doesn’t reach its goal?", at: [187, 584], size: [343, 50], to: "faqAnswer", move: "fade" },
      { label: "Can I donate anonymously?", at: [187, 640], size: [343, 50], to: "faqAnswer", move: "fade" },
      { label: "More questions or support", at: [187, 696], size: [343, 50], to: "faqAnswer", move: "fade" },
    ],
  },
};

const FLOW = wholeFlow<Id>(DRAWN, MORE, built);

/** FundPath, clickable, with the app's real screens */
export default function FundpathFlow() {
  return <ScreenFlow name="FundPath" screens={screens} flow={FLOW} start="heart" island tint="#7c4ddb" />;
}
