import type { PlaceholderKind } from "@/components/ui/placeholder-shot";
import { caseTracker } from "@/content/case-tracker";
import { fundpath } from "@/content/fundpath";
import { revival } from "@/content/revival-stream";
import { room8 } from "@/content/room8";
import { yoyo } from "@/content/yoyo";

/**
 * What each project page says under its tabs: Overview, The challenge, How I worked, Outcome, Key screens.
 * Facts only, from content/profile.md and the case study MDX. A section with no confirmed content is
 * `null` and the page says it's on its way; never fill one in with a guess.
 */
export type Screen = {
  src: string;
  alt: string;
  /** Size in points, when it isn't a 375×812 phone screen */
  w?: number;
  h?: number;
};

export type KeyScreenGroup = {
  title: string;
  body: string;
  /** Panels sit side by side on wide screens; each holds one or more phone screens */
  panels: {
    tone: "deep" | "soft";
    screens: Screen[];
    /** Shown in an iPhone and a laptop, for work that runs on both */
    devices?: boolean;
  }[];
  /** An interactive piece shown instead of still screens */
  live?: "room8-tour";
};

export type ProjectDetail = {
  headline: string;
  tags: string[];
  /** Placeholder shape while there are no screens */
  kind: PlaceholderKind;
  challenge: string | null;
  approach: string | null;
  outcome: string | null;
  /** null: shown as placeholders until the exports arrive */
  keyScreens: KeyScreenGroup[] | null;
  /** For projects without a case study file */
  role?: string;
  time?: string;
  platform?: string;
  company?: string;
  tldr?: [string, string, string];
  figure?: { value: string; label: string };
};

const s = room8;
const f = fundpath;
const c = caseTracker;
const y = yoyo;
const r = revival;

export const details: Record<string, ProjectDetail> = {
  room8: {
    headline: "Find the right roommate, then walk through the room",
    tags: ["Proptech", "Mobile"],
    kind: "mobile",
    challenge:
      "People looking for a shared room make two decisions at once: where to live and who to live with. The tools they have only support the first. The second gets made on instinct, at an inspection, under pressure to pay before someone else does.",
    approach:
      "I designed both decisions into one flow. Seven short questions set up the match before any listing appears. People are listed the way rooms are, with budget, area and availability up front, and compatibility on every profile. Then you can tour the room without travelling: in 3D, or live with the host on video.",
    outcome:
      "A complete app, built as working screens: onboarding and matching, discovery by list and map, room and roommate profiles, in-person and live video tours, a 3D tour with three modes, chat, and payments held in escrow until move-in.",
    // TODO: Samuel to confirm this copy
    keyScreens: [
      {
        title: "First impression",
        body: "Three promises in the order people worry about them: the right person, the right match, a safe move.",
        panels: [{ tone: "soft", screens: [s.splash, s.onboarding1, s.onboarding2, s.onboarding3] }],
      },
      {
        title: "Set up the match",
        body: "One question first: find a roommate, or rent a place? Then seven short questions, one to a screen, so matching feels like a conversation rather than a form.",
        panels: [{ tone: "deep", screens: [s.getStarted, s.questions, s.preferences] }],
      },
      {
        title: "Look for a person or a place",
        body: "Roommates and rooms share one search. Switch between list and map, or narrow it by budget, property type and who you'd live with.",
        panels: [{ tone: "soft", screens: [s.home, s.explore, s.exploreMap, s.filters] }],
      },
      {
        title: "Know who you'd live with",
        body: "A profile shows rent, availability, habits and a compatibility score. A room shows who already lives there, what's still open, the host and the house rules.",
        panels: [{ tone: "deep", screens: [s.roommate, s.room, s.roomRoommates] }],
      },
      {
        title: "Tour it in 3D",
        body: "Step inside before travelling across Lagos. Three modes answer three questions: how is it laid out, what's it like to be in, and can someone just show me round?",
        panels: [],
        live: "room8-tour",
      },
      {
        title: "Or go live with the host",
        body: "Book a visit, or start a video tour right away if the host is online. Captions run during the call, and it ends on the next step: pay, message or call again.",
        panels: [{ tone: "soft", screens: [s.bookVisit, s.bookVideo, s.callLive, s.callEnded] }],
      },
      {
        title: "Talk and pay in one place",
        body: "You can call or pay from the chat itself, and payments show up where they were discussed. The full cost is broken down before you pay, and the money is held in escrow until move-in.",
        panels: [{ tone: "deep", screens: [s.conversation, s.chatMenu, s.payCard, s.payDone] }],
      },
    ],
  },
  // From Samuel's own case study in Figma (Uplift-Us, section 3707:6532), tightened for the page
  fundpath: {
    headline: "Giving you can see arrive, and see spent",
    tags: ["Fintech", "Social impact"],
    kind: "mobile",
    challenge:
      "Many fundraisers and donors struggle to find a platform that feels personal, intuitive and reliable. Complex interfaces, a lack of transparency and poor mobile experiences make supporting or starting a cause cumbersome and discouraging.",
    approach:
      "I surveyed people who had used crowdfunding platforms, compared GoFundMe, Kickstarter and Indiegogo feature by feature, and built two personas and empathy maps. Transparency kept coming up: none of the three offered transparency reports, and most people I surveyed said they'd be very likely to check one. So I designed for three goals: let anyone create or support a campaign for any cause, show in real time how funds are used, and make campaigns easy to share.",
    outcome:
      "A complete app across 30+ screens, where campaign creators and donors can both find their way easily. Trust is built in through real-time updates and transparency reports, so people see how their donations are used. It works for medical emergencies as well as personal and community projects, and flexible funding means a partial contribution still counts if a campaign doesn't reach its goal.",
    keyScreens: [
      {
        title: "First impression",
        body: "Two people leaning together make a heart: the mark opens the app, and each welcome screen says one hopeful thing.",
        panels: [{ tone: "soft", screens: [f.splash, f.welcome1, f.welcome2, f.welcome3] }],
      },
      {
        title: "Find a cause",
        body: "The wallet, the causes and what's trending, all on the first screen. Every campaign in the list shows what's been raised and how long is left, and filters go down to how close it is to its goal.",
        panels: [{ tone: "deep", screens: [f.home, f.campaigns, f.filter] }],
      },
      {
        title: "Know who you're giving to",
        body: "The campaign puts progress, the organiser and the transparency report together, above the story. The organiser has a verified profile, and you can ask a question before you give.",
        panels: [{ tone: "soft", screens: [f.campaign, f.profile, f.chat] }],
      },
      {
        title: "Give in a few taps",
        body: "Suggested amounts, the option to stay anonymous, and a refund guarantee sit right where you decide. Pay by card, bank transfer, USSD, PayPal or Stripe, with the fee shown before you pay.",
        panels: [{ tone: "deep", screens: [f.amount, f.payMethod, f.card, f.success] }],
      },
      {
        title: "See where it went",
        body: "The part the other platforms didn't have. Donations in and payments out are listed as they happen, from the first blood test to a chemotherapy session, and every gift keeps its receipt.",
        panels: [{ tone: "soft", screens: [f.report, f.fundUpdate, f.donations, f.receipt] }],
      },
      {
        title: "Start a campaign",
        body: "One form, a preview, then a review before it goes live, so donors know that what they see has been checked.",
        panels: [{ tone: "deep", screens: [f.start, f.preview, f.review, f.live] }],
      },
      {
        title: "Keep people close",
        body: "Share a campaign to any network, update it from one list, and talk to the people behind the donations.",
        panels: [{ tone: "soft", screens: [f.share, f.myCampaigns, f.chats] }],
      },
    ],
  },
  // Written from the screens themselves. TODO: Samuel to confirm the copy, the year, and what may be shown
  "immigify-case-tracker": {
    headline: "Know where your immigration case stands, and what comes next",
    tags: ["AI", "Immigration tech", "Mobile"],
    kind: "mobile",
    challenge:
      "Waiting on an immigration case means a receipt number, an official status that's hard to read, and long silences in between. The help that exists is scattered: one place for the status, another for advice, another for people going through the same thing.",
    approach:
      "I started from the one thing everyone already has: a receipt number. Paste it and the app reads the official USCIS status, shows its work while it does, and adds AI insights about what's next. Around the case sit the three things people reach for while they wait: a community, verified consultants, and events.",
    outcome:
      "A complete app, from onboarding to a booked consultation: case tracking with progress, AI insights, a community with shareable visa timelines, groups by topic, and consultants you can book and pay in the app.",
    keyScreens: [
      {
        title: "First impression",
        body: "Three promises, in the order people need them: know where your case is, understand what it means, and don't go through it alone.",
        panels: [{ tone: "soft", screens: [c.splash, c.welcome1, c.welcome2, c.welcome3] }],
      },
      {
        title: "One number to start",
        body: "Two light questions set up what you'll see, then the only field that matters. Every step can be skipped.",
        panels: [{ tone: "deep", screens: [c.status, c.interests, c.addCase] }],
      },
      {
        title: "AI that shows its work",
        body: "Fetching a case takes a moment, so the app says what it's doing at each step. What comes back is a plain answer: which form, which stage, how far along, and when it last moved.",
        panels: [{ tone: "soft", screens: [c.fetching, c.home, c.cases] }],
      },
      {
        title: "People on the same road",
        body: "The feed is organised by visa and category, so you find people in your exact situation. Groups go deeper into a topic.",
        panels: [{ tone: "deep", screens: [c.community, c.groups, c.group] }],
      },
      {
        title: "Share the timeline, not just the story",
        body: "A post can carry a real case timeline, so a question comes with its dates and other people can compare theirs.",
        panels: [{ tone: "soft", screens: [c.createPost, c.writePost, c.timeline, c.timelinePost] }],
      },
      {
        title: "Talk to someone qualified",
        body: "Verified consultants by specialty. Pick a date and a time, add what you'd like to discuss, pay, and the appointment is confirmed in the app.",
        panels: [{ tone: "deep", screens: [c.consultants, c.book, c.pay, c.confirmed] }],
      },
    ],
  },
  yoyo: {
    headline: "A budget you can read at a glance",
    tags: ["Fintech", "Mobile"],
    kind: "mobile",
    challenge:
      "A budget is a lot of small numbers. Most trackers ask for all of them up front, then show them back as a list, so it takes work to answer the only question that matters: am I all right this month?",
    approach:
      "I started with intent: pick what you want to do, and the app sets itself up around it. A budget is built in short steps (income, categories, amounts) and ends as one ring. The same shapes then carry the rest: bars for the week, a ring for the month, a gauge for a goal, and a score for how it's all going.",
    outcome:
      "A complete app in light and dark: onboarding with biometrics, an overview, budgets, transactions, saving goals with automatic saving, wallets, a financial health score, and stock reports with an AI chat.",
    // TODO: Samuel to confirm this copy
    keyScreens: [
      {
        title: "First impression",
        body: "The mark is three banknotes, fanned open. One promise, then a password or a fingerprint.",
        panels: [{ tone: "soft", screens: [y.splash, y.welcome, y.password, y.biometricsSheet] }],
      },
      {
        title: "Start from what you want",
        body: "Pick goals first. The button only wakes up when there's something to continue with, and the wallet fills when there is.",
        panels: [{ tone: "deep", screens: [y.goalsEmpty, y.goalsPicked, y.ready] }],
      },
      {
        title: "How am I doing?",
        body: "Balance, the week as bars, and the latest transactions on one screen. A score sums up the month, with a line of advice.",
        panels: [{ tone: "soft", screens: [y.home, y.health, y.wallet] }],
      },
      {
        title: "A budget in short steps",
        body: "Name it, add income, choose where it goes. The summary is the first time you see the whole month, and it's a shape, not a table.",
        panels: [{ tone: "deep", screens: [y.budgetEmpty, y.budgetForm, y.income, y.categoriesPicked] }],
      },
      {
        title: "The month, as one shape",
        body: "The same ring stays with you after setup: what you planned, then what's been spent in each category.",
        panels: [{ tone: "soft", screens: [y.summary, y.budgetDone, y.plans, y.allocations] }],
      },
      {
        title: "Spending, logged in seconds",
        body: "Amount first, at full size. Everything after it is a tap: type, category, wallet. Anything that repeats can be automated.",
        panels: [{ tone: "deep", screens: [y.txEmpty, y.txNew, y.txFilled, y.txList] }],
      },
      {
        title: "Saving as a habit",
        body: "A goal becomes a weekly amount on a day you choose. The gauge shows how far along you are.",
        panels: [{ tone: "soft", screens: [y.goals, y.goalDayPicked, y.goalDone, y.vacation] }],
      },
      {
        title: "Learn, and ask",
        body: "Stock activity and sector performance, what experts say about a stock, and an AI chat for questions.",
        panels: [{ tone: "deep", screens: [y.learn, y.stock, y.ai] }],
      },
      {
        title: "The same app, at night",
        body: "Dark mode keeps the hierarchy: the same shapes, with colour saved for what needs attention.",
        panels: [{ tone: "soft", screens: [y.darkSplash, y.darkWelcome, y.darkHome, y.darkHealth] }],
      },
    ],
  },
  // TODO: Samuel to confirm this copy. Written from the designs (Figma REVIVAL STREAM, section 324:24549); no research or results are claimed
  "revival-stream": {
    headline: "Where every godly mood finds its stream",
    tags: ["Music and media", "Web", "Mobile"],
    kind: "web",
    challenge:
      "Nobody opens a worship radio knowing the name of the channel. They arrive with a mood, a preacher they trust or a singer they love, often on a phone, and they want sound right away. The product had to answer all three starting points, keep playing while people look around, and still feel like listening together.",
    approach:
      "I gave each starting point its own door: channels for a mood, ministers for a sermon, minstrels for a song, testimonies for encouragement. You can look through all of them before signing up. A bar holds whatever is on air while you browse, and opens into a full player with what's on now, what's next, a live chat and sharing. I designed every page for desktop and mobile side by side, on one dark system with a single orange, so the covers bring the colour.",
    outcome:
      "A complete product across desktop and mobile: sign-up with email verification, log-in, home, channels, ministers, minstrels and testimonies, the player with live chat, sharing and favourites, channel requests, notifications and settings, with their loading, empty and success states.",
    keyScreens: [
      {
        title: "Get in quickly",
        body: "Three fields, or one tap with Google, Facebook or Apple. The button only lights up when there's something to send, and a four-digit code confirms the address.",
        panels: [
          { tone: "deep", devices: true, screens: [r.signup, r.mSignup] },
          { tone: "soft", devices: true, screens: [r.code, r.mCode] },
          { tone: "deep", devices: true, screens: [r.verified, r.mVerified] },
        ],
      },
      {
        title: "Come back",
        body: "Logging in shows its work: the button turns into a spinner, so a slow connection never looks like a dead click. Then you land on home, with everything that's live.",
        panels: [{ tone: "soft", devices: true, screens: [r.loginLoading, r.mHome] }],
      },
      {
        title: "Start from a mood",
        body: "One promise, then live channels. Home leads with what's trending and keeps ministers, minstrels and testimonies a scroll away. Play something and a bar holds it while you keep looking.",
        panels: [
          { tone: "deep", devices: true, screens: [r.homePlaying, r.mMenu] },
        ],
      },
      {
        title: "The player",
        body: "The cover fills the background, so every channel has its own light. The waveform moves while it's live, and below it is what's on now and what's up next, with a reminder for anything you don't want to miss.",
        panels: [{ tone: "deep", devices: true, screens: [r.minister, r.mPlayer] }],
      },
      {
        title: "Listen together",
        body: "The chat opens beside the player on a laptop and as a sheet under the cover on a phone, so the music stays in view. Liking a channel fills the heart and says where it went.",
        panels: [
          { tone: "soft", devices: true, screens: [r.chat, r.mMenuIn] },
          { tone: "deep", devices: true, screens: [r.like, r.mChat] },
        ],
      },
      {
        title: "Pass it on",
        body: "Every channel has its own address. Share it where people already talk, or copy the link.",
        panels: [{ tone: "soft", devices: true, screens: [r.share] }],
      },
      {
        title: "By channel, by minister, by minstrel",
        body: "Channels are wide cards, because they're about a feeling. People are round portraits, because you look for a face. The shape tells you which kind of page you're on before you read it.",
        panels: [
          { tone: "deep", devices: true, screens: [r.channelPlaying, r.mMinisters] },
          { tone: "soft", devices: true, screens: [r.ministers, r.mMinstrels] },
          { tone: "deep", devices: true, screens: [r.minstrels, r.mTestimonies] },
          { tone: "soft", devices: true, screens: [r.testimonies, r.mChannels] },
        ],
      },
      {
        title: "Your library",
        body: "An empty list points back to the channels. If what you want isn't there, you can ask for it: what it is, why, and who it's by.",
        panels: [
          { tone: "soft", devices: true, screens: [r.favourites, r.mRequest] },
          { tone: "deep", devices: true, screens: [r.request, r.mFavourites] },
        ],
      },
      {
        title: "Your account",
        body: "Settings are three short pages. Disconnecting an account asks for your password, and notifications are set by where they reach you.",
        panels: [
          { tone: "soft", devices: true, screens: [r.account, r.mSettings] },
          { tone: "deep", devices: true, screens: [r.disconnect, r.mPassword] },
          { tone: "soft", devices: true, screens: [r.prefs, r.mPrefs] },
          { tone: "deep", devices: true, screens: [r.notifications, r.mNotifications] },
        ],
      },
    ],
  },
  immigify: {
    headline: "Calmer immigration casework, with AI that shows its working",
    tags: ["AI", "Immigration tech"],
    kind: "dashboard",
    challenge:
      "Consultants were carrying immigration compliance in their heads, with spreadsheets and inboxes as the backup. The next action was hard to see, and AI help had to be trustworthy enough to act on.",
    approach:
      "As the first product designer I owned every surface: the website, the AI agent interfaces, the consultant CRM and the SaaS dashboards. I turned compliance workflows into task-focused tools, and built the design system underneath them from zero.",
    outcome:
      "Four surfaces delivered on one system of 100+ tokens and shared components. The company raised a $1M pre-seed round during my tenure.",
    keyScreens: null,
  },
  heightgpt: {
    headline: "An AI mobile app, from research to launch week",
    tags: ["AI", "Mobile"],
    kind: "mobile",
    role: "UI/UX designer, freelance",
    time: "2024–25",
    platform: "iOS and Android",
    company: "Boulevard Legacy",
    tldr: [
      "An AI-powered mobile app, launched on the App Store and Google Play.",
      "I led UX and UI from research to launch.",
      "It reached 10,000 downloads in its first week.",
    ],
    challenge: null,
    approach: "I led UX and UI for the app from research through to the App Store and Google Play launch.",
    outcome: "10,000 downloads in the first week. I've learned that launch week tells you the truth: the real design work started when people began using it.",
    figure: { value: "10,000", label: "downloads in the first week" },
    keyScreens: null,
  },
  iexcelo: {
    headline: "Exam revision that makes sense to three different people",
    tags: ["Edtech", "Web"],
    kind: "web",
    role: "UI/UX designer, contract",
    time: "Nov 2025 to Feb 2026",
    platform: "Web",
    company: "iExcelo",
    tldr: [
      "A WASSCE revision platform for a Nigerian edtech product.",
      "I designed the landing page and the core platform for students, sponsors and affiliates.",
      "Time-to-task for students came down by 30%.",
    ],
    challenge:
      "One product had to hold three very different mental models. Students, sponsors and affiliates each needed the platform to make sense in their own way.",
    approach:
      "I designed the landing page and the core platform: the student dashboard, revision workflows and progress tracking, with a separate journey for each of the three audiences.",
    outcome: "The dashboard, revision workflows and progress tracking reduced time-to-task by 30%.",
    figure: { value: "30%", label: "faster time-to-task for students" },
    keyScreens: null,
  },
  simplexity: {
    headline: "LinkedIn research without the manual work",
    tags: ["Data", "Web app"],
    kind: "dashboard",
    role: "UI/UX designer, freelance",
    time: "2024–25",
    platform: "Web",
    company: "Boulevard Legacy",
    tldr: ["A web app for extracting LinkedIn data.", "I designed the UX and UI end to end.", "Manual research effort came down by 25%."],
    challenge: null,
    approach: "End-to-end UX and UI for the web app.",
    outcome: "Manual research effort came down by 25%.",
    figure: { value: "25%", label: "less manual research effort" },
    keyScreens: null,
  },
  lagproperties: {
    headline: "A mobile real estate app, shaped by testing",
    tags: ["Real estate", "Mobile"],
    kind: "mobile",
    role: "UI/UX designer, contract",
    time: "2024",
    platform: "Mobile",
    company: "LAGProperties",
    tldr: [
      "A mobile real estate app based in Lagos.",
      "I took it from flows and wireframes to high-fidelity screens and prototypes.",
      "Changes from usability testing lifted satisfaction scores by 10%.",
    ],
    challenge: null,
    approach:
      "End-to-end UI/UX: flows, wireframes, high-fidelity screens and interactive prototypes, with research and usability testing along the way. Specs and assets were delivered on schedule.",
    outcome: "Research and usability testing improved user satisfaction scores by 10%. I've learned that testing early is cheaper than being confident.",
    figure: { value: "10%", label: "higher user satisfaction" },
    keyScreens: null,
  },
  powerroute: {
    headline: "An EV charging locator app",
    tags: ["Mobility", "Mobile"],
    kind: "mobile",
    challenge: null,
    approach: null,
    outcome: null,
    keyScreens: null,
  },
  quitbet: {
    headline: "A gambling addiction recovery app",
    tags: ["Health", "Mobile"],
    kind: "mobile",
    challenge: null,
    approach: null,
    outcome: null,
    keyScreens: null,
  },
};
