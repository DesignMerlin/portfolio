/**
 * The Projects page's spatial gallery: every setting in one place (Samuel only; visitors don't get controls).
 * Projects come from lib/projects.ts. `entries` overrides anything about one of them by its slug.
 */

export type GalleryLayout = "field" | "solar" | "atom" | "cloud";
export type GalleryEntrance = "spiral" | "depth" | "curtain";

export type GalleryMedia =
  /** A still. Shown everywhere instead of the project's film or cover */
  | { type: "image"; src: string; alt: string }
  /** A clip: its poster floats in orbit, the clip plays in the centre and the lightbox (muted, looping) */
  | { type: "video"; src: string; poster: string; alt: string };

export type GalleryEntry = {
  /** Card size relative to the others (1 is the default) */
  size?: number;
  /** Width / height. Defaults to the project art's own shape */
  aspect?: number;
  /** Which part of an image stays in view when it's cropped, as CSS object-position ("50% 20%", "top") */
  focus?: string;
  title?: string;
  /** The one line under the name when the project is opened */
  caption?: string;
  /** Where "View project" goes. Defaults to the project page; set null for no link */
  href?: string | null;
  media?: GalleryMedia;
  /** Leave this project out of the gallery (it stays in List view) */
  hidden?: boolean;
};

export const gallery = {
  layout: "solar" as GalleryLayout,
  entrance: "spiral" as GalleryEntrance,
  /** The project in the centre when the page opens */
  featured: "room8",

  orbit: {
    /** Degrees per second while idle. 0 holds still */
    speed: 5,
    /** 1 clockwise (seen from above), -1 anticlockwise */
    direction: 1 as 1 | -1,
    /** How far the cards spread from the centre (1 is the default) */
    spacing: 1.15,
    /** How deep the scene goes (1 is the default) */
    depth: 1,
    /** How far each card bobs up and down while floating, in px. 0 turns floating off */
    float: 6,
    /**
     * How many floating cards play their film at once: the ones nearest the front, as they swing round; the
     * rest show a frame of it. Measured on a laptop with integrated graphics: one playing card (plus the
     * centre film) holds 60fps, two drop it to 30. Raise with care, and check on a phone.
     */
    playing: { wide: 1, phone: 1 },
  },

  cards: {
    /** Orbiting card width as a share of the stage width (phones get double) */
    size: 0.11,
    /** The centre card's width, in px, at its largest */
    featureWidth: 420,
    radius: 14,
    shadow: "0 1px 2px rgb(0 0 0 / 0.08), 0 24px 48px -20px rgb(0 0 0 / 0.35)",
    /** Cards far back go soft, like the edge of a lens's focus. 0 keeps everything sharp */
    blur: 3,
  },

  lightbox: {
    /** The page the project opens on: the site's own paper, the gallery showing faintly through */
    backdrop: "color-mix(in oklab, var(--paper) 86%, transparent)",
    blur: 18,
    radius: 14,
  },

  entries: {
    // e.g. iexcelo: { size: 1.2, caption: "Live at iexcelo.com" },
  } as Record<string, GalleryEntry>,
};
