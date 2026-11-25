"use client";

import { BTN, FULL, ICON, ScreenFlow, type Field, type Flow, type FlowNode, type Spot, wholeFlow } from "@/components/case-study/prototypes/screen-flow";
import built from "@/content/built/yoyo.json";
import { yoyo } from "@/content/yoyo";

const screens = { ...yoyo, ...built };
type Id = keyof typeof screens;
type S = Spot<Id>;

const back = (to: Id): S => ({ label: "Back", at: [28, 66], size: ICON, to, move: "back" });
/** The big button at the bottom of most screens */
const main = (label: string, to: Id, move?: S["move"]): S => ({ label, at: [187, 759], size: BTN, to, move });
const nav = (current: "home" | "goals" | "plans" | "learn" | "more"): S[] =>
  (
    [
      ["Overview", "home", 45],
      ["Goals", "goals", 122],
      ["Budget", "plans", 194],
      ["Learn", "learn", 271],
      ["More", "more", 341],
    ] as const
  )
    .map(([label, to, x]): S => ({ label, at: [x, 752], size: [66, 60], to, move: "fade" }))
    .filter((s) => s.to !== current);

const NAME: Field = { label: "Budget name", text: [31.6, 139, 170, 20], field: [16, 123, 331, 56], r: 8, bg: "#fcfcfd", chars: 23, src: "/work/yoyo/ink-name.webp" };

/** The app's real flow, as a map of its real screens. Signing up with an email is skipped: those screens aren't published */
const DRAWN: Flow<Id> = {
  splash: { spots: [{ label: "Start", at: [187, 406], size: FULL, to: "welcome", move: "fade" }], auto: { to: "welcome", after: 2600, move: "fade" } },
  welcome: {
    spots: [
      { label: "Log in", at: [100, 765], size: [168, 48], to: "home", move: "in" },
      { label: "Sign up", at: [275, 765], size: [168, 48], to: "password" },
    ],
  },
  password: {
    spots: [{ label: "Close", at: [33, 64], size: ICON, to: "welcome", move: "back" }, { label: "Continue", at: [187, 690], size: BTN, to: "biometrics" }],
    fields: [
      { label: "Password", text: [30, 489, 54, 14], field: [16, 472, 343, 56], r: 8, bg: "#fcfcfd", chars: 8 },
      { label: "Confirm password", text: [30, 585, 54, 14], field: [16, 568, 343, 56], r: 8, bg: "#fcfcfd", chars: 8 },
    ],
  },
  biometrics: {
    spots: [
      { label: "Set up biometrics", at: [187, 705], size: [343, 44], to: "biometricsSheet", move: "sheet" },
      { label: "Skip", at: [187, 759], size: [343, 44], to: "goalsEmpty" },
    ],
  },
  biometricsSheet: {
    sheet: { top: 403, over: "biometrics" },
    spots: [
      { label: "Cancel", at: [52, 759], size: [90, 44], to: "biometrics", move: "drop" },
      { label: "Scan your fingerprint", at: [187, 604], size: [180, 180], to: "goalsEmpty" },
    ],
  },
  goalsEmpty: {
    spots: [
      { label: "Make a budget", at: [98, 204], size: [164, 145], to: "goalsPicked", move: "fade" },
      { label: "Track spending", at: [277, 204], size: [164, 145], to: "goalsPicked", move: "fade" },
      { label: "Save for a goal", at: [98, 381], size: [164, 145], to: "goalsPicked", move: "fade" },
      { label: "Manage subscriptions", at: [277, 381], size: [164, 145], to: "goalsPicked", move: "fade" },
    ],
  },
  goalsPicked: { spots: [{ label: "Clear the choices", at: [187, 292], size: [343, 322], to: "goalsEmpty", move: "fade" }, main("Continue", "ready")] },
  ready: { spots: [main("Go to dashboard", "home", "in")] },
  home: {
    spots: [
      { label: "Transaction history", at: [290, 243], size: [140, 44], to: "txEmpty" },
      { label: "Financial health score", at: [56, 243], size: [80, 44], to: "health" },
      { label: "See all transactions", at: [323, 621], size: [64, 40], to: "txList" },
      ...nav("home"),
    ],
  },
  health: { spots: [back("home")] },

  budgetEmpty: { spots: [{ label: "Create a budget", at: [187, 485], size: [250, 48], to: "budgetForm" }, ...nav("plans")] },
  budgetForm: {
    spots: [back("budgetEmpty"), { label: "Add income", at: [345, 416], size: ICON, to: "incomeEmpty", move: "sheet" }, main("Continue", "categories")],
    fields: [NAME],
  },
  incomeEmpty: {
    sheet: { top: 470, over: "budgetForm" },
    spots: [
      { label: "Close", at: [187, 235], size: [375, 470], to: "budgetForm", move: "drop" },
      { label: "Cancel", at: [44, 775], size: [80, 44], to: "budgetForm", move: "drop" },
      { label: "Confirm", at: [326, 775], size: [90, 44], to: "budgetFilled", move: "fade" },
    ],
    fields: [
      { label: "Category", text: [32, 607, 44, 18], clear: [30, 606, 112, 20], field: [16, 588, 331, 56], r: 8, bg: "#fff", chars: 6, src: "/work/yoyo/ink-salary.webp" },
      { label: "Amount", text: [32, 697, 52, 22], clear: [30, 697, 112, 22], field: [16, 680, 331, 56], r: 8, bg: "#fff", chars: 6, src: "/work/yoyo/ink-amount.webp" },
    ],
  },
  budgetFilled: { spots: [back("budgetEmpty"), { label: "Add income", at: [345, 416], size: ICON, to: "incomeEmpty", move: "sheet" }, main("Continue", "categories")], fields: [{ ...NAME, field: [16, 123, 343, 56] }] },
  categories: {
    spots: [back("budgetFilled"), { label: "Housing", at: [98, 195], size: [164, 112], to: "allocate", move: "sheet" }, { label: "Savings", at: [278, 331], size: [164, 112], to: "allocate", move: "sheet" }],
  },
  allocate: {
    sheet: { top: 455, over: "categories" },
    spots: [
      { label: "Close", at: [187, 227], size: [375, 455], to: "categories", move: "drop" },
      { label: "Cancel", at: [44, 767], size: [80, 44], to: "categories", move: "drop" },
      { label: "Confirm", at: [326, 767], size: [90, 44], to: "categoriesPicked", move: "fade" },
    ],
  },
  categoriesPicked: { spots: [back("categories"), main("Continue", "summary")] },
  summary: { spots: [back("categoriesPicked"), main("Continue", "budgetDone", "fade")] },
  budgetDone: { spots: [{ label: "Go to home", at: [187, 456], size: [120, 48], to: "plans", move: "out" }] },
  plans: {
    spots: [
      { label: "Create a budget", at: [119, 172], size: [160, 44], to: "budgetEmpty" },
      { label: "Allocations", at: [187, 233], size: [114, 52], to: "allocations", move: "fade" },
      ...nav("plans"),
    ],
  },
  allocations: { spots: [{ label: "Your plans", at: [73, 233], size: [114, 52], to: "plans", move: "fade" }, { label: "Create a budget", at: [105, 172], size: [140, 44], to: "budgetEmpty" }, ...nav("plans")] },

  txEmpty: { spots: [back("home"), { label: "Add a transaction", at: [187, 501], size: [287, 52], to: "txNew" }] },
  txNew: {
    spots: [
      back("txEmpty"),
      { label: "Expenses", at: [74, 242], size: [116, 44], to: "txFilled", move: "fade" },
      { label: "Housing", at: [66, 340], size: [103, 44], to: "txFilled", move: "fade" },
      { label: "See all categories", at: [338, 393], size: [64, 44], to: "txCategories", move: "sheet" },
    ],
    fields: [
      { label: "Amount", text: [120, 98, 136, 60], field: [104, 94, 168, 68], r: 10, bg: "#fcfcfd", chars: 4, src: "/work/yoyo/ink-five.webp" },
      { label: "Narration", text: [42, 531, 124, 20], field: [12, 524, 351, 36], r: 6, bg: "#fcfcfd", chars: 18, src: "/work/yoyo/ink-narration.webp" },
    ],
  },
  txFilled: { spots: [back("txNew"), { label: "See all categories", at: [338, 393], size: [64, 44], to: "txCategories", move: "fade" }, { label: "Save", at: [187, 751], size: BTN, to: "txList" }] },
  txCategories: { spots: [{ label: "Close categories", at: [187, 640], size: [375, 340], to: "txFilled", move: "fade" }, { label: "Feeding", at: [174, 282], size: [104, 40], to: "txFilled", move: "fade" }, { label: "Savings", at: [287, 282], size: [104, 40], to: "txFilled", move: "fade" }, { label: "Add a category", at: [336, 238], size: [44, 44], to: "addCustom" }, { label: "Housing", at: [58, 282], size: [104, 40], to: "txFilled", move: "fade" }] },
  txList: { spots: [back("home"), { label: "Add new", at: [290, 66], size: [100, 44], to: "txNew" }] },

  goals: {
    spots: [
      { label: "Create a goal", at: [347, 210], size: ICON, to: "goalsNone", move: "fade" },
      { label: "Open Vacation", at: [278, 325], size: [164, 176], to: "vacation", move: "in" },
      ...nav("goals"),
    ],
  },
  goalsNone: { spots: [{ label: "Create a goal", at: [187, 479], size: [160, 44], to: "goalNew" }, ...nav("goals")] },
  goalNew: {
    spots: [back("goalsNone"), { label: "Weekly", at: [187, 277], size: [106, 44], to: "goalDay", move: "sheet" }],
    fields: [{ label: "Target amount", text: [34, 139, 68, 28], field: [10, 132, 355, 46], r: 6, bg: "#fcfcfd", chars: 5 }],
  },
  goalDay: {
    sheet: { top: 470, over: "goalWeekly" },
    spots: [
      { label: "Cancel", at: [44, 775], size: [80, 44], to: "goalNew", move: "drop" },
      { label: "Tuesdays", at: [187, 586], size: [106, 44], to: "goalDayPicked", move: "fade" },
    ],
  },
  goalDayPicked: {
    sheet: { top: 470, over: "goalWeekly" },
    spots: [
      { label: "Cancel", at: [44, 775], size: [80, 44], to: "goalNew", move: "drop" },
      { label: "Confirm", at: [326, 775], size: [90, 44], to: "goalStart", move: "fade" },
    ],
  },
  goalWeekly: { spots: [back("goalNew"), { label: "Weekly", at: [187, 277], size: [106, 44], to: "goalDay", move: "sheet" }] },
  goalStart: {
    spots: [
      { label: "Cancel", at: [44, 775], size: [80, 44], to: "goalNew", move: "fade" },
      { label: "Confirm", at: [326, 775], size: [90, 44], to: "goalFilled", move: "fade" },
    ],
  },
  goalFilled: { spots: [back("goalNew"), main("Continue", "goalSummary")] },
  goalSummary: { spots: [back("goalFilled"), main("Create goal", "goalDone", "fade")] },
  goalDone: { spots: [main("View savings", "vacation", "in")] },
  vacation: { spots: [{ label: "Back", at: [28, 66], size: ICON, to: "goals", move: "out" }] },

  learn: {
    spots: [
      { label: "Open NVIDIA", at: [187, 72], size: [343, 60], to: "stock" },
      { label: "Ask AI", at: [345, 687], size: [56, 56], to: "ai", move: "in" },
      ...nav("learn"),
    ],
  },
  stock: { spots: [back("learn"), ...nav("learn")] },
  ai: { spots: [{ label: "Back", at: [28, 67], size: ICON, to: "learn", move: "out" }] },
  more: {
    spots: [
      { label: "Wallet", at: [187, 205], size: [343, 60], to: "wallet" },
      { label: "Transactions", at: [187, 341], size: [343, 60], to: "txList" },
      ...nav("more"),
    ],
  },
  wallet: { spots: [{ label: "Back", at: [28, 66], size: ICON, to: "more", move: "back" }] },
};

/** The rest of what can be tapped on the drawn screens */
const MORE: Partial<Record<Id, Partial<FlowNode<Id>>>> = {
  income: {
    sheet: { top: 470, over: "budgetForm" },
    spots: [
      { label: "Close", at: [187, 235], size: [375, 470], to: "budgetFilled", move: "fade" },
      { label: "Cancel", at: [44, 775], size: [80, 44], to: "budgetFilled", move: "fade" },
      { label: "Confirm", at: [326, 775], size: [90, 44], to: "budgetFilled", move: "fade" },
    ],
  },
  budgetFilled: { spots: [{ label: "Edit salary", at: [187, 455], size: [343, 40], to: "income", move: "fade" }] },
  darkSplash: { spots: [{ label: "Continue", at: [187, 406], size: FULL, to: "darkWelcome", move: "fade" }], auto: { to: "darkWelcome", after: 2000, move: "fade" } },
  darkWelcome: {
    spots: [
      { label: "Log in", at: [100, 765], size: [168, 48], to: "darkHome", move: "in" },
      { label: "Sign up", at: [275, 765], size: [168, 48], to: "darkGoals" },
    ],
  },
  darkGoals: { spots: [{ label: "Continue", at: [187, 759], size: BTN, to: "darkReady" }] },
  darkReady: { spots: [{ label: "Go to dashboard", at: [187, 759], size: BTN, to: "darkHome", move: "in" }] },
  darkHome: {
    spots: [
      { label: "Financial health score", at: [56, 243], size: [80, 44], to: "darkHealth" },
      { label: "Replay the dark onboarding", at: [36, 72], size: [48, 48], to: "darkSplash", move: "fade" },
      { label: "Back to light mode", at: [341, 752], size: [66, 60], to: "security", move: "fade" },
    ],
  },
  darkHealth: { spots: [{ label: "Back", at: [28, 66], size: ICON, to: "darkHome", move: "back" }] },
  welcome: {
    spots: [
      { label: "Log in", at: [100, 765], size: [168, 48], to: "logIn" },
      { label: "Sign up", at: [275, 765], size: [168, 48], to: "signUp" },
    ],
  },
  signUp: {
    spots: [
      { label: "Close", at: [33, 65], size: [48, 48], to: "welcome", move: "back" },
      { label: "Get started", at: [187, 558], size: [343, 44], to: "verify" },
      { label: "Sign up with Google", at: [187, 645], size: [343, 44], to: "biometrics" },
      { label: "Sign up with Apple", at: [187, 701], size: [343, 44], to: "biometrics" },
      { label: "Sign in", at: [242, 745], size: [64, 36], to: "logIn" },
    ],
  },
  verify: {
    spots: [
      { label: "Close", at: [33, 65], size: [48, 48], to: "signUp", move: "back" },
      { label: "Continue", at: [187, 603], size: [343, 44], to: "password" },
      { label: "Resend", at: [270, 645], size: [110, 32], to: "forgot" },
    ],
    fields: [{ label: "Code", text: [60, 490, 255, 48], field: [42, 480, 292, 68], r: 8, bg: "#fcfcfd", chars: 4 }],
  },
  profile: {
    spots: [
      { label: "Back", at: [28, 65], size: [48, 48], to: "more", move: "back" },
      { label: "Security", at: [273, 130], size: [164, 48], to: "security", move: "fade" },
      { label: "Next of kin", at: [187, 454], size: [343, 48], to: "nextOfKin" },
      { label: "Save changes", at: [187, 769], size: [343, 48], to: "profileSaved", move: "fade" },
    ],
  },
  home: {
    spots: [
      { label: "Your profile", at: [36, 72], size: [48, 48], to: "profile" },
      { label: "Notifications", at: [347, 71], size: [44, 44], to: "notifications" },
      { label: "Statistics period", at: [302, 300], size: [100, 40], to: "statsPeriod", move: "sheet" },
      { label: "Top up rent budget", at: [187, 662], size: [320, 40], to: "txDetail" },
      { label: "Payout for internet", at: [187, 705], size: [320, 36], to: "txDetail" },
    ],
  },
  health: {
    spots: [
      { label: "October", at: [138, 630], size: [64, 84], to: "healthMonth" },
    ],
  },
  plans: {
    spots: [
      { label: "Switch budget", at: [106, 66], size: [210, 44], to: "budgetSwitch", move: "sheet" },
      { label: "Edit budget", at: [348, 66], size: [44, 44], to: "budgetEdit" },
      { label: "Insights", at: [301, 233], size: [114, 52], to: "insights", move: "fade" },
      { label: "See the ring by category", at: [98, 504], size: [170, 170], to: "allocations", move: "fade" },
    ],
  },
  allocations: {
    spots: [
      { label: "Switch budget", at: [106, 66], size: [210, 44], to: "budgetSwitch", move: "sheet" },
      { label: "Edit budget", at: [348, 66], size: [44, 44], to: "budgetEdit" },
      { label: "Insights", at: [301, 233], size: [114, 52], to: "insights", move: "fade" },
      { label: "Housing", at: [187, 426], size: [320, 72], to: "allocationHousing" },
      { label: "Food", at: [187, 507], size: [320, 72], to: "allocationHousing" },
      { label: "Lifestyle", at: [187, 588], size: [320, 72], to: "allocationHousing" },
      { label: "Savings", at: [187, 668], size: [320, 72], to: "allocationHousing" },
    ],
  },
  categories: {
    spots: [
      { label: "Feeding", at: [278, 195], size: [164, 112], to: "allocate", move: "sheet" },
      { label: "Lifestyle", at: [98, 331], size: [164, 112], to: "allocate", move: "sheet" },
      { label: "Transportation", at: [98, 467], size: [164, 112], to: "allocate", move: "sheet" },
      { label: "Add custom", at: [278, 467], size: [164, 112], to: "addCustom" },
    ],
  },
  allocate: {
    spots: [
      { label: "Amount", at: [187, 605], size: [343, 56], to: "allocateFilled", move: "fade" },
      { label: "Sub category", at: [187, 705], size: [343, 56], to: "allocatePick", move: "fade" },
    ],
  },
  txList: {
    spots: [
      { label: "Select date", at: [83, 112], size: [134, 40], to: "txDate", move: "sheet" },
      { label: "All categories", at: [297, 112], size: [124, 40], to: "txFilter", move: "sheet" },
      { label: "Download", at: [350, 62], size: [32, 44], to: "txDownloaded", move: "sheet" },
      { label: "Add new", at: [285, 62], size: [96, 44], to: "txNew" },
      { label: "Rent, today", at: [187, 310], size: [320, 48], to: "txDetail" },
      { label: "Internet, today", at: [187, 362], size: [320, 48], to: "txDetail" },
      { label: "Rent, yesterday", at: [187, 473], size: [320, 48], to: "txDetail" },
      { label: "Internet, yesterday", at: [187, 525], size: [320, 48], to: "txDetail" },
      { label: "Electricity", at: [187, 577], size: [320, 48], to: "txDetail" },
      { label: "Save for a new shirt", at: [187, 629], size: [320, 48], to: "txDetail" },
    ],
  },
  txNew: {
    spots: [
      { label: "Income", at: [209, 242], size: [99, 44], to: "txFilled", move: "fade" },
      { label: "Feeding", at: [187, 340], size: [103, 44], to: "txFilled", move: "fade" },
      { label: "Savings wallet", at: [62, 490], size: [92, 40], to: "txFilled", move: "fade" },
      { label: "Credit card", at: [188, 490], size: [124, 40], to: "txFilled", move: "fade" },
    ],
  },
  goals: {
    spots: [
      { label: "Your profile", at: [36, 72], size: [48, 48], to: "profile" },
      { label: "Notifications", at: [347, 71], size: [44, 44], to: "notifications" },
      { label: "Open Accommodation", at: [98, 325], size: [164, 176], to: "goalEmpty", move: "in" },
      { label: "Open Business", at: [98, 517], size: [164, 176], to: "goalEmpty", move: "in" },
      { label: "Open Education", at: [277, 517], size: [164, 176], to: "goalEmpty", move: "in" },
    ],
  },
  goalsNone: {
    spots: [
      { label: "Your profile", at: [36, 72], size: [48, 48], to: "profile" },
      { label: "Notifications", at: [347, 71], size: [44, 44], to: "notifications" },
    ],
  },
  goalNew: {
    spots: [
      { label: "Daily", at: [69, 277], size: [106, 44], to: "goalDaily", move: "fade" },
      { label: "Monthly", at: [306, 277], size: [106, 44], to: "goalStart", move: "sheet" },
      { label: "Start date", at: [187, 384], size: [343, 44], to: "goalStart", move: "sheet" },
    ],
  },
  goalWeekly: {
    spots: [
      { label: "Daily", at: [69, 277], size: [106, 44], to: "goalDaily", move: "fade" },
      { label: "Start date", at: [187, 384], size: [343, 44], to: "goalStart", move: "sheet" },
      { label: "End date", at: [187, 493], size: [343, 44], to: "goalEnd", move: "sheet" },
    ],
  },
  goalStart: {
    spots: [
      { label: "Confirm", at: [326, 775], size: [90, 44], to: "goalEnd", move: "fade" },
    ],
  },
  goalFilled: {
    spots: [
      { label: "Start date", at: [187, 384], size: [343, 44], to: "goalStart", move: "sheet" },
      { label: "End date", at: [187, 493], size: [343, 44], to: "goalEnd", move: "sheet" },
    ],
  },
  goalSummary: {
    spots: [
      { label: "Payment method", at: [187, 345], size: [343, 70], to: "payMethod", move: "sheet" },
    ],
  },
  vacation: {
    spots: [
      { label: "Edit goal", at: [344, 69], size: [44, 44], to: "goalEdit" },
      { label: "Withdraw", at: [97, 204], size: [164, 44], to: "withdraw" },
      { label: "Save", at: [276, 204], size: [164, 44], to: "saveMoney" },
      { label: "See all transactions", at: [328, 548], size: [64, 40], to: "vacationHistory" },
      { label: "Transfer from bank", at: [187, 592], size: [320, 44], to: "vacationHistory" },
      { label: "Withdraw to bank", at: [187, 644], size: [320, 44], to: "vacationHistory" },
    ],
  },
  more: {
    spots: [
      { label: "Notifications", at: [347, 71], size: [44, 44], to: "notifications" },
      { label: "Account details", at: [187, 131], size: [343, 60], to: "profile" },
      { label: "Categories", at: [187, 273], size: [343, 60], to: "categoriesManage" },
      { label: "Subscriptions", at: [187, 409], size: [343, 60], to: "subscriptions" },
      { label: "Get help", at: [187, 477], size: [343, 60], to: "help" },
    ],
  },
  wallet: {
    spots: [
      { label: "Wallet settings", at: [347, 67], size: [44, 44], to: "walletSettings" },
      { label: "Set up your wallets", at: [187, 417], size: [200, 44], to: "walletSetup" },
      { label: "Spendings", at: [187, 535], size: [343, 96], to: "walletDetail" },
      { label: "Savings", at: [187, 650], size: [343, 96], to: "walletDetail" },
    ],
  },
  learn: {
    spots: [
      { label: "Open Microsoft", at: [187, 124], size: [343, 52], to: "stock" },
      { label: "Open Apple", at: [187, 181], size: [343, 52], to: "stock" },
      { label: "All sectors", at: [311, 248], size: [110, 40], to: "sectors", move: "sheet" },
      { label: "See more news", at: [327, 473], size: [84, 40], to: "news" },
      { label: "Read the Tesla story", at: [117, 598], size: [200, 196], to: "article" },
      { label: "Read the NVIDIA story", at: [306, 570], size: [130, 130], to: "article" },
      { label: "All stock activity", at: [187, 28], size: [375, 30], to: "stocks" },
    ],
  },
  stock: {
    spots: [
      { label: "Back", at: [28, 66], size: [48, 48], to: "learn", move: "back" },
      { label: "Share", at: [348, 66], size: [44, 44], to: "stockShared", move: "sheet" },
    ],
  },
  ai: {
    spots: [
      { label: "Chat history", at: [330, 67], size: [48, 48], to: "aiHistory", move: "sheet" },
      { label: "What is Apple’s stock price?", at: [188, 321], size: [210, 40], to: "aiAnswer", move: "fade" },
      { label: "Who is the top performer?", at: [188, 369], size: [320, 40], to: "aiTop", move: "fade" },
      { label: "Ask", at: [337, 714], size: [48, 48], to: "aiAnswer", move: "fade" },
      { label: "Check for important info", at: [245, 752], size: [130, 30], to: "aiInfo", move: "sheet" },
    ],
  },
};

const FLOW = wholeFlow<Id>(DRAWN, MORE, built);

/** Yoyo, clickable, with the app's real screens */
export default function YoyoFlow() {
  return <ScreenFlow name="Yoyo" screens={screens} flow={FLOW} start="splash" tint="#1671d9" />;
}
