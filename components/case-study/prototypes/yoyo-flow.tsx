"use client";

import { BTN, FULL, ICON, ScreenFlow, type Field, type Flow, type Spot } from "@/components/case-study/prototypes/screen-flow";
import { yoyo, type YoyoScreen } from "@/content/yoyo";

type S = Spot<YoyoScreen>;

const back = (to: YoyoScreen): S => ({ label: "Back", at: [28, 66], size: ICON, to, move: "back" });
/** The big button at the bottom of most screens */
const main = (label: string, to: YoyoScreen, move?: S["move"]): S => ({ label, at: [187, 759], size: BTN, to, move });
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
const FLOW: Flow<YoyoScreen> = {
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
      { label: "See all transactions", at: [330, 608], size: [64, 44], to: "txList" },
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
  txCategories: { spots: [{ label: "Close categories", at: [187, 640], size: [375, 340], to: "txFilled", move: "fade" }, { label: "Housing", at: [70, 258], size: [104, 44], to: "txFilled", move: "fade" }] },
  txList: { spots: [back("home"), { label: "Add new", at: [290, 66], size: [100, 44], to: "txNew" }] },

  goals: {
    spots: [
      { label: "Create a goal", at: [345, 249], size: ICON, to: "goalsNone", move: "fade" },
      { label: "Open Vacation", at: [278, 364], size: [164, 176], to: "vacation", move: "in" },
      ...nav("goals"),
    ],
  },
  goalsNone: { spots: [{ label: "Create a goal", at: [187, 479], size: [160, 44], to: "goalNew" }, ...nav("goals")] },
  goalNew: {
    spots: [back("goalsNone"), { label: "Weekly", at: [187, 316], size: [106, 44], to: "goalDay", move: "sheet" }],
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
  goalWeekly: { spots: [back("goalNew"), { label: "Weekly", at: [187, 316], size: [106, 44], to: "goalDay", move: "sheet" }] },
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
  ai: { spots: [{ label: "Back", at: [28, 88], size: ICON, to: "learn", move: "out" }] },
  more: {
    spots: [
      { label: "Wallet", at: [187, 205], size: [343, 60], to: "wallet" },
      { label: "Transactions", at: [187, 341], size: [343, 60], to: "txList" },
      ...nav("more"),
    ],
  },
  wallet: { spots: [{ label: "Back", at: [28, 66], size: ICON, to: "more", move: "back" }] },
};

/** Yoyo, clickable, with the app's real screens */
export default function YoyoFlow() {
  return <ScreenFlow name="Yoyo" screens={yoyo} flow={FLOW} start="splash" tint="#1671d9" />;
}
