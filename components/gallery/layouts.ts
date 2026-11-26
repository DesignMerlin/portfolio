import type { GalleryEntrance, GalleryLayout } from "@/content/gallery";

/** A point in the stage's 3D space, in px from its centre (y down, z towards the viewer) */
export type Point = { x: number; y: number; z: number };

export type Space = {
  /** Stage size */
  w: number;
  h: number;
  /** Spread and depth, already scaled by the settings */
  r: number;
  d: number;
};

/** The same number for the same card every time, so Cloud and Field keep their shape between visits */
const rand = (k: number, salt: number) => {
  const s = Math.sin(k * 127.1 + salt * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const TAU = Math.PI * 2;

/**
 * Where orbiting card k (of m) sits when the whole arrangement has turned by `a` radians.
 * Cards stay within z ≤ 0.6d; the centre sits in front of all of them (see CENTER_Z in spatial-gallery).
 */
export function place(layout: GalleryLayout, k: number, m: number, a: number, s: Space): Point {
  const { w, h, r, d } = s;
  switch (layout) {
    // Two rings round the centre, the inner one slower and tighter, both tipped towards you a little
    case "solar": {
      const ring = k % 2;
      const count = ring ? Math.floor(m / 2) : Math.ceil(m / 2);
      const i = Math.floor(k / 2);
      const t = a * (ring ? 0.72 : 1) + (TAU * i) / Math.max(count, 1) + ring * 0.45;
      const rad = r * (ring ? 1 : 0.66);
      return {
        x: Math.cos(t) * rad,
        // Seen from a little above: the far side of each ring rises behind the centre, the near side dips below it
        y: Math.sin(t) * rad * (ring ? 0.36 : 0.3) + (ring ? h * 0.04 : -h * 0.03),
        z: Math.sin(t) * d * (ring ? 1 : 0.7) - d * 0.45,
      };
    }
    // Three tilted orbits crossing at the centre, each at its own pace
    case "atom": {
      const o = k % 3;
      const count = Math.floor(m / 3) + (o < m % 3 ? 1 : 0);
      const i = Math.floor(k / 3);
      const t = a * (1 + o * 0.22) + (TAU * i) / Math.max(count, 1) + o * 0.9;
      const px = Math.cos(t) * r;
      const pz = Math.sin(t) * r;
      const tilt = 1.2; // ~70°: each orbit seen almost face on, as an ellipse
      const x0 = px;
      const y0 = -pz * Math.sin(tilt);
      const z0 = pz * Math.cos(tilt);
      const phi = (o - 1) * (Math.PI / 3);
      return {
        x: x0 * Math.cos(phi) - y0 * Math.sin(phi),
        y: (x0 * Math.sin(phi) + y0 * Math.cos(phi)) * Math.min(0.55, h / w),
        z: (z0 / r) * d - d * 0.4,
      };
    }
    // A loose plane of cards drifting sideways behind the centre, wrapping round at the edges
    case "field": {
      const cols = Math.max(3, Math.ceil(Math.sqrt(m * 1.8)));
      const rows = Math.ceil(m / cols);
      const col = k % cols;
      const row = Math.floor(k / cols);
      const sx = (r * 2.4) / cols;
      const sy = Math.min(h * 0.3, (h * 0.8) / Math.max(rows, 1));
      const span = cols * sx;
      const shift = ((a / TAU) * span) % span;
      let x = col * sx + (row % 2 ? sx / 2 : 0) + shift + (rand(k, 1) - 0.5) * sx * 0.3;
      x = ((x % span) + span) % span - span / 2;
      return {
        x,
        y: (row - (rows - 1) / 2) * sy + (rand(k, 2) - 0.5) * sy * 0.35,
        z: -d * (0.25 + 0.75 * rand(k, 3)),
      };
    }
    // A scattered cloud, turning slowly round its vertical axis
    case "cloud":
    default: {
      const th = TAU * rand(k, 4);
      const ph = Math.acos(2 * rand(k, 5) - 1);
      const rad = r * (0.55 + 0.5 * rand(k, 6));
      const x0 = rad * Math.sin(ph) * Math.cos(th);
      const y0 = rad * Math.cos(ph) * 0.55;
      const z0 = rad * Math.sin(ph) * Math.sin(th);
      const x = x0 * Math.cos(a) - z0 * Math.sin(a);
      const z = x0 * Math.sin(a) + z0 * Math.cos(a);
      return { x, y: y0, z: (z / r) * d * 0.9 - d * 0.4 };
    }
  }
}

/**
 * The entrance: where a card is at progress p (0 to 1, already eased) on its way to `to`.
 * Returns the point and how visible it is.
 */
export function enter(kind: GalleryEntrance, p: number, to: Point, s: Space): Point & { o: number; s: number } {
  const q = 1 - p;
  switch (kind) {
    // Out of the centre along a widening spiral
    case "spiral": {
      const rad = Math.hypot(to.x, to.z) * p;
      const ang = Math.atan2(to.z, to.x) - q * 2.6;
      return { x: Math.cos(ang) * rad, y: to.y * p, z: Math.sin(ang) * rad, o: Math.min(1, p * 1.6), s: 0.35 + 0.65 * p };
    }
    // Forward out of the far distance
    case "depth":
      return { ...to, z: to.z - q * s.d * 3, o: p, s: 1 };
    // In from the sides, each card from the side it ends up on
    case "curtain":
    default:
      return { ...to, x: to.x + Math.sign(to.x || 1) * q * s.w * 0.7, o: p, s: 1 };
  }
}
