export type ClipStyle = "peg" | "binder" | "tape";

export type RopeCarouselSettings = {
  // Flow
  /** px per second while autoplaying */
  speed: number;
  direction: "left" | "right";
  autoplay: boolean;
  pauseOnHover: boolean;
  clip: ClipStyle;

  // Rope
  /** How far the middle hangs below the ends, as a fraction of the stage width */
  sag: number;
  /** Where the lowest point sits across the width: 0.5 = centred, lower = leans left */
  curve: number;
  /** Distance from the top of the stage to the rope's ends, px */
  top: number;
  thickness: number;
  color: string;
  /** Twisted-cord highlight along the rope */
  braid: boolean;
  shadow: boolean;
  /** 0 = cards hang straight down, 1 = cards tilt fully with the rope's slope */
  follow: number;

  // Cards
  width: number;
  mobileWidth: number;
  gap: number;
  /** width / height */
  ratio: number;
  radius: number;
  cardShadow: boolean;
  /** Max resting tilt in degrees; each card gets its own share of it */
  tilt: number;
};

export const defaultRopeSettings: RopeCarouselSettings = {
  speed: 38,
  direction: "left",
  autoplay: true,
  pauseOnHover: true,
  clip: "peg",

  sag: 0.06,
  curve: 0.5,
  top: 56,
  thickness: 2,
  color: "#b9b3a8",
  braid: true,
  shadow: true,
  follow: 0.7,

  width: 330,
  mobileWidth: 272,
  gap: 34,
  ratio: 0.76,
  radius: 14,
  cardShadow: true,
  tilt: 3.5,
};
