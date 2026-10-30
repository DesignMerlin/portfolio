export type ArcDialSettings = {
  /** Degrees of arc the visible portraits cover, end to end (desktop) */
  span: number;
  /** 0–1. How much portraits shrink and fade the further they sit from the top */
  depth: number;
  /** Featured portrait diameter in px (desktop); the others are half this */
  size: number;
  /** Portraits shown on each side of the featured one (desktop; phones show at most 2) */
  visible: number;
  autoplay: boolean;
  /** Seconds per story */
  interval: number;
};

export const defaultArcSettings: ArcDialSettings = {
  span: 180,
  depth: 0.5,
  size: 116,
  visible: 3,
  autoplay: true,
  interval: 7,
};
