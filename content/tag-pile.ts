/**
 * The hero's gravity tag pile. Edit freely: labels, colours, images and links.
 * - `href`: clicking the tag (without dragging it) opens this link.
 * - `image`: a small round image inside the tag (path under /public).
 * - `color` / `ink`: override the theme's colours for this one tag.
 */
export type PileTag = {
  label: string;
  href?: string;
  image?: string;
  color?: string;
  ink?: string;
};

export const pileTags: PileTag[] = [
  { label: "Branding" },
  { label: "Visual identity" },
  { label: "Logo design" },
  { label: "Typography" },
  { label: "Colour systems" },
  { label: "Brand guidelines" },
  { label: "Iconography" },
  { label: "Illustration" },
  { label: "Motion design" },
  { label: "Research" },
  { label: "Accessibility" },
  { label: "Prototyping" },
  { label: "Design systems" },
  { label: "Interaction design" },
  { label: "UX writing" },
  { label: "Usability testing" },
];

export type PileThemeName = "paper" | "midnight" | "candy" | "mono" | "forest";

/** Everything about a tag's look: typography, padding, image size, gloss, border and shadow */
export type PileTheme = {
  label: string;
  /** One background per tag, cycled */
  fills: string[];
  /** Text colour per fill (same index) */
  inks: string[];
  font: "display" | "sans" | "mono";
  weight: number;
  fontSize: number;
  paddingX: number;
  paddingY: number;
  imageSize: number;
  gloss: boolean;
  border: string;
  shadow: string;
};

export const pileThemes: Record<PileThemeName, PileTheme> = {
  paper: {
    label: "Paper",
    fills: ["#fffdf7", "#f6f1e7"],
    inks: ["#1c1a16", "#1c1a16"],
    font: "sans",
    weight: 500,
    fontSize: 15,
    paddingX: 18,
    paddingY: 10,
    imageSize: 24,
    gloss: false,
    border: "1px solid rgb(28 26 22 / 0.12)",
    shadow: "0 6px 14px -6px rgb(0 0 0 / 0.35)",
  },
  midnight: {
    label: "Midnight",
    fills: ["#1a1d33", "#232848", "#14162a"],
    inks: ["#e8eaff", "#c9cffd", "#a99cff"],
    font: "sans",
    weight: 500,
    fontSize: 15,
    paddingX: 18,
    paddingY: 10,
    imageSize: 24,
    gloss: true,
    border: "1px solid rgb(169 156 255 / 0.28)",
    shadow: "0 10px 22px -10px rgb(0 0 0 / 0.7)",
  },
  candy: {
    label: "Candy",
    fills: ["#ffd3e6", "#cdeeff", "#fff0a8", "#e2d6ff", "#ccf7dc", "#ffdcc7"],
    inks: ["#5c1435", "#0d3a5c", "#4d3d00", "#2f1a6b", "#0d4a26", "#5c2a0d"],
    font: "display",
    weight: 700,
    fontSize: 16,
    paddingX: 18,
    paddingY: 10,
    imageSize: 24,
    gloss: true,
    border: "1px solid rgb(255 255 255 / 0.6)",
    shadow: "0 8px 18px -8px rgb(0 0 0 / 0.45)",
  },
  mono: {
    label: "Mono",
    fills: ["#ffffff", "#111111"],
    inks: ["#111111", "#ffffff"],
    font: "mono",
    weight: 500,
    fontSize: 14,
    paddingX: 16,
    paddingY: 10,
    imageSize: 22,
    gloss: false,
    border: "1.5px solid #111111",
    shadow: "3px 3px 0 #111111",
  },
  forest: {
    label: "Forest",
    fills: ["#1f3d2b", "#e7f1df", "#2f5b3f", "#cfe6bf"],
    inks: ["#e7f1df", "#1f3d2b", "#e7f1df", "#1f3d2b"],
    font: "display",
    weight: 600,
    fontSize: 16,
    paddingX: 18,
    paddingY: 10,
    imageSize: 24,
    gloss: false,
    border: "1px solid rgb(31 61 43 / 0.25)",
    shadow: "0 8px 16px -8px rgb(0 0 0 / 0.5)",
  },
};
