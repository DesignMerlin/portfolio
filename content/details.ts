import type { PlaceholderKind } from "@/components/ui/placeholder-shot";
import { caseTracker } from "@/content/case-tracker";
import { fundpath } from "@/content/fundpath";
import { iexcelo } from "@/content/iexcelo";
import { revival } from "@/content/revival-stream";
import { lagproperties } from "@/content/lagproperties";
import { powerroute } from "@/content/powerroute";
import { room8 } from "@/content/room8";
import { voxdeed } from "@/content/voxdeed";
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
    /** Desktop screens in a browser window instead of a laptop (websites); long pages scroll on hover */
    browser?: boolean;
  }[];
  /** An interactive piece shown instead of still screens */
  live?: "room8-tour";
  /** A whole web page, shown as three slowly moving columns */
  whole?: Screen;
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
  /** The live product, for a Visit site link */
  site?: string;
  figure?: { value: string; label: string };
};

const s = room8;
const f = fundpath;
const c = caseTracker;
const y = yoyo;
const r = revival;
const ix = iexcelo;
const vx = voxdeed;
const pr = powerroute;
const lp = lagproperties;

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
    site: "https://iexcelo.com",
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
    // TODO: Samuel to confirm this copy. Written from the designs (Figma iExcelo Ed-Tech Web App) and the facts above
    keyScreens: [
      {
        title: "One promise up front",
        body: "Revise smarter, practise harder, excel in every exam. Real students sit beside the promise, and the dashboard rises underneath it, so the first screen already shows what using it looks like.",
        panels: [{ tone: "soft", devices: true, browser: true, screens: [ix.hero, ix.mHome] }],
      },
      {
        title: "Whole page",
        body: "The homepage, top to bottom: benefits, the exams covered, three ways in, what students say, questions answered, and a call to start.",
        panels: [],
        whole: ix.home,
      },
      {
        title: "Three ways in",
        body: "Practise with past questions, sponsor a student through Giveback, or earn by sharing as an affiliate. Each door gets its own illustration and its own page.",
        panels: [{ tone: "deep", devices: true, browser: true, screens: [ix.features] }],
      },
      {
        title: "For students",
        body: "Exam Revision explains the product in the language of revision: everything in one place, a pathway from first question to exam day.",
        panels: [
          { tone: "soft", devices: true, browser: true, screens: [ix.revision, ix.mRevision] },
          { tone: "deep", devices: true, browser: true, screens: [ix.about, ix.mAbout] },
        ],
      },
      {
        title: "For sponsors and affiliates",
        body: "Giveback asks people to fund someone else's revision and shows where the money goes. The affiliate page is about earning, with the commission stated plainly.",
        panels: [
          { tone: "soft", devices: true, browser: true, screens: [ix.giveback, ix.mGiveback] },
          { tone: "deep", devices: true, browser: true, screens: [ix.affiliate, ix.mAffiliate] },
        ],
      },
      {
        title: "Questions and contact",
        body: "FAQs are grouped by audience, so a parent, a sponsor and a student each find their answer quickly. Contact keeps it to three ways to reach a person.",
        panels: [
          { tone: "soft", devices: true, browser: true, screens: [ix.faq, ix.mFaq] },
          { tone: "deep", devices: true, browser: true, screens: [ix.contact, ix.mContact] },
        ],
      },
      {
        title: "The student dashboard",
        body: "Welcome, then one clear next step: test your knowledge. Exams, subjects and questions solved sit underneath, with scores by subject and every exam a click away.",
        panels: [
          { tone: "deep", devices: true, browser: true, screens: [ix.dash] },
          { tone: "soft", devices: true, browser: true, screens: [ix.exam, ix.question] },
          { tone: "deep", devices: true, browser: true, screens: [ix.submitted] },
        ],
      },
    ],
  },
  voxdeed: {
    headline: "A voice note in, a signed contract out",
    tags: ["AI", "Legal tech", "Web"],
    kind: "web",
    role: "Co-founder, design",
    // TODO: Samuel to confirm the dates (the page's footer says 2026; the company is pre-launch)
    time: "2026",
    platform: "Web",
    company: "Voxdeed",
    tldr: [
      "Voxdeed is an AI legal tech product I'm co-founding, pre-launch.",
      "It turns a verbal business agreement (a WhatsApp voice note, a call, a conversation) into a drafted contract both sides sign.",
      "I designed the landing page: brand, story and pricing, on desktop and mobile.",
    ],
    // TODO: Samuel to confirm this copy. Written from the landing page in Figma (Voxdeed Inc., Website page)
    challenge:
      "A lot of business is agreed out loud: a call, a voice note, a handshake. Contracts feel slow, expensive and formal by comparison. The page had to make a legal product feel as easy as sending a voice note, and still feel serious enough to trust with a deal.",
    approach:
      "Instead of describing the product, the hero shows it: a voice note goes in, the AI works through its steps, and a contract comes back ready to sign, inside one window. Then three steps with no lawyers in them, four plain promises, prices in naira with a free trial, and answers to the questions people ask before trusting a contract to software. Dark, with one red, and a serif italic for the turn in each headline.",
    outcome: null,
    keyScreens: [
      {
        title: "Show the trick first",
        body: "The future of agreements is automated, and underneath it the proof: a voice note in, the AI transcribing, extracting terms and drafting, and a supply agreement back, ready to sign. The badge says how long it takes.",
        panels: [{ tone: "deep", devices: true, browser: true, screens: [vx.hero, vx.mHome] }],
      },
      {
        title: "Whole page",
        body: "The landing page, top to bottom: the promise, how it works, what you get, questions, pricing, contact, and a last call to protect your next deal.",
        panels: [],
        whole: vx.home,
      },
      {
        title: "Three steps, no lawyers",
        body: "Record or send, the AI processes, both sides sign and it's kept in a vault. Each step has one image: a microphone, a chip, a shield with everything that ends up inside it.",
        panels: [{ tone: "deep", devices: true, browser: true, screens: [vx.steps] }],
      },
      {
        title: "Four promises",
        body: "Voice note to signed contract, drafted in about a minute, for a fraction of a lawyer, with proof if there's ever a dispute. The cards round it show the same things as they'd appear in the product.",
        panels: [{ tone: "deep", devices: true, browser: true, screens: [vx.features] }],
      },
      {
        title: "Before anyone trusts it",
        body: "The questions people ask first (do I need an app, what can it write, how safe is it, what if the AI gets a term wrong) are answered on the page. Pricing is in naira, starts free, and says who each plan is for.",
        panels: [
          { tone: "deep", devices: true, browser: true, screens: [vx.faq] },
          { tone: "deep", devices: true, browser: true, screens: [vx.pricing] },
        ],
      },
      {
        title: "A way to reach a person",
        body: "Contact is an email to copy and a short form. The last call repeats the promise, and the footer says plainly that Voxdeed doesn't give legal advice.",
        panels: [
          { tone: "deep", devices: true, browser: true, screens: [vx.contact] },
          { tone: "deep", devices: true, browser: true, screens: [vx.cta] },
        ],
      },
    ],
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
    headline: "Renting in Lagos, for tenants and landlords",
    tags: ["Real estate", "Escrow", "Mobile"],
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
    // TODO: Samuel to confirm the challenge and the key screen copy (written from the designs, Figma AHRP)
    challenge:
      "Renting in Lagos runs on agents, phone calls and trust: you pay before you're sure, and the landlord isn't sure you'll pay at all. The app had to serve both sides, tenants looking for a home and landlords or agents filling one, and make the money and the paperwork feel safe for each.",
    approach:
      "End-to-end UI/UX: flows, wireframes, high-fidelity screens and interactive prototypes, with research and usability testing along the way. Two flows from one start, rent or list. Tenants explore, book an inspection in person or by video, pay into escrow and sign the agreement in the app; landlords see escrow, rent received and overdue, accept or decline inspections and keep track of every tenant. Specs and assets were delivered on schedule.",
    outcome: "Research and usability testing improved user satisfaction scores by 10%. I've learned that testing early is cheaper than being confident.",
    figure: { value: "10%", label: "higher user satisfaction" },
    keyScreens: [
      {
        title: "First impression",
        body: "Orange, the colour of Lagos at dusk, and two photographs of the city's homes: find your perfect home, and renting made simple. Then one quick sign-up for both sides.",
        panels: [{ tone: "soft", screens: [lp.splash, lp.onboarding1, lp.onboarding2, lp.signUp] }],
      },
      {
        title: "Two ways in",
        body: "The first choice decides the app you get: rent an apartment, or list your apartment. Tenants land on Explore, with search by city or address and the yearly rent on every listing.",
        panels: [{ tone: "deep", screens: [lp.home, lp.explore, lp.property] }],
      },
      {
        title: "See it before you pay",
        body: "Every flat has its gallery and its reviews from past tenants. An inspection can be in person or by video, booked for a date and time that suits.",
        panels: [{ tone: "soft", screens: [lp.gallery, lp.reviews, lp.schedule, lp.time] }],
      },
      {
        title: "Money and paperwork in one place",
        body: "Payment goes into escrow, with a receipt and a summary of what it covers. The agent is a message away, and the rental agreement is read and signed in the app.",
        panels: [{ tone: "deep", screens: [lp.paid, lp.bookings, lp.chat, lp.agreement, lp.signing] }],
      },
      {
        title: "For landlords and agents",
        body: "A dashboard of what matters: escrow balance, rent received and overdue, tenants with invoices due, inspections coming up. Requests are accepted or declined in one tap, and every tenant and property is a tap away.",
        panels: [
          { tone: "soft", screens: [lp.landlordDashboard, lp.landlordInspection, lp.landlordAccepted] },
          { tone: "deep", screens: [lp.landlordListing, lp.landlordProperties, lp.landlordTenant] },
        ],
      },
    ],
  },
  // From Samuel's own case study page in Figma (EV CHARGING LOCATOR APP, CASE STUDY page) and the screens
  powerroute: {
    headline: "Find a charger, book it, and watch it fill",
    tags: ["Mobility", "EV", "Mobile"],
    kind: "mobile",
    role: "Product designer",
    platform: "iOS and Android",
    company: "PowerRoute",
    tldr: [
      "PowerRoute helps electric vehicle drivers find a charging station, book a slot and pay, in one app.",
      "I designed it end to end: user flow, low-fidelity wireframes, style guide, high-fidelity screens and an interactive prototype.",
      "The aim was a seamless journey from finding a station to booking, paying and charging.",
    ],
    // TODO: Samuel to confirm this copy and add the year
    challenge:
      "Finding somewhere to charge an electric car means guessing: which stations are near, which are free, whether they take your plug, and what it will cost. Then the booking and payment usually happen somewhere else. PowerRoute had to answer those questions up front and keep the whole journey, from finding a station to paying and charging, in one place.",
    approach:
      "I mapped the user flow in FigJam first, then worked through low-fidelity wireframes to a style guide and high-fidelity screens, and prototyped the main flows to test them. Four goals shaped it: easy discovery by location or preference, live availability and pricing on every station (green for free, red for in use), booking and payment in as few steps as possible, and a profile that remembers your vehicle and plug.",
    outcome: null,
    keyScreens: [
      {
        title: "First impression",
        body: "A simple mark, then three photographs of charging as it really looks: a solar canopy, a plug going in, a car topping up at the kerb. They replaced the original illustrations, so the promise feels real from the first swipe.",
        panels: [{ tone: "soft", screens: [pr.splash, pr.onboarding1, pr.onboarding2, pr.onboarding3] }],
      },
      {
        title: "What's near, and is it free?",
        body: "Home leads with recently viewed stations and a list nearby. On the map and the stations list, green means available and red means in use, with distance, time, rating and plugs on every station.",
        panels: [{ tone: "deep", screens: [pr.home, pr.map, pr.stations] }],
      },
      {
        title: "Pick a station",
        body: "Tap a pin and the station opens as a card on the map: rating, distance, plug types, View or Book. The full page adds photos, directions, opening hours, cost and recent check-ins.",
        panels: [{ tone: "soft", screens: [pr.stationMap, pr.station, pr.addVehicle] }],
      },
      {
        title: "Book and pay in a few taps",
        body: "Choose a date, an arrival time and how long to charge, then pay by card, PayPal or bank transfer. A review shows everything before you confirm, and the booking is done.",
        panels: [{ tone: "deep", screens: [pr.booking, pr.payment, pr.review, pr.booked] }],
      },
      {
        title: "Watch it charge",
        body: "The battery fills bar by bar with a percentage, time, energy and charge level, then confirms what was charged. Bookings, the wallet and the account keep the history in one place.",
        panels: [
          { tone: "soft", screens: [pr.charging, pr.charged] },
          { tone: "deep", screens: [pr.bookings, pr.wallet, pr.account] },
        ],
      },
    ],
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
