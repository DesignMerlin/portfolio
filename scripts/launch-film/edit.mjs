// The launch film's edit: every shot's place in the minute, the plate it plays, the camera, the caption and
// the transition out, and the sound cues that belong to it. The compositor (compose.mjs) and the soundtrack
// (audio.mjs) both read this, so picture and sound can't drift apart. Times are seconds. The music is at
// 120 BPM, so every whole second is a beat and every cut below lands on one.

export const FPS = 30;
export const LENGTH = 60;
export const BPM = 120;

/**
 * plate: the recorded shot it plays (.launch-film/plates/<plate>), from `from` seconds into it.
 * camera: scale and pan over the shot (x/y as a fraction of the frame), eased.
 * caption: the line on screen, rising in after `captionAt` seconds (at the top with captionTop, where the shot has its own text below).
 */
export const shots = [
  { id: "open", start: 0, dur: 3, kind: "open" },
  { id: "hero", start: 3, dur: 5, plate: "hero", from: 0, camera: { from: [1, 0, 0], to: [1.06, 0, 0.01] }, caption: "I'm Samuel. I design products, and then I build them.", captionAt: 1.4 },
  { id: "sentence", start: 8, dur: 6, plate: "sentence", from: 0, camera: { from: [1.02, 0, 0], to: [1.06, 0, -0.01] } },
  { id: "grid", start: 14, dur: 6, plate: "grid", from: 0, camera: { from: [1.12, 0.035, 0.02], to: [1.12, -0.035, 0.02] }, caption: "Real products. Real screens.", captionAt: 0.8 },
  { id: "peel", start: 20, dur: 4, plate: "peel", from: 0.25, camera: { from: [1.6, 0.28, -0.25], to: [1.12, 0.05, -0.04] } },
  { id: "gallery", start: 24, dur: 6, plate: "gallery", from: 0.3, camera: { from: [1, 0, 0.02], to: [1.14, 0, 0.04] }, caption: "Every project, one tap away.", captionAt: 0.5, captionTop: true, in: "whip" },
  { id: "split", start: 30, dur: 7, kind: "split", plates: ["charts", "battery"], from: 0, caption: "Screens that move the way the product does.", captionAt: 1 },
  { id: "rope", start: 37, dur: 1.5, plate: "rope", from: 0, camera: { from: [1.15, 0, 0.02], to: [1.2, 0, 0.02] }, caption: "The small things get the same care.", captionAt: 0.2, captionUntil: 6 },
  { id: "cmdk", start: 38.5, dur: 1.5, plate: "cmdk", from: 0.1, camera: { from: [1.25, 0, 0.1], to: [1.3, 0, 0.12] } },
  { id: "nav", start: 40, dur: 1.5, plate: "nav", from: 0, camera: { from: [1.7, 0, 0.33], to: [1.75, 0, 0.35] } },
  { id: "theme", start: 41.5, dur: 1.5, plate: "theme", from: 0.15, camera: { from: [1.08, 0, 0], to: [1.1, 0, 0] } },
  { id: "proof", start: 43, dur: 6, plate: "proof", from: 0, camera: { from: [1, 0, 0], to: [1.05, 0, 0] }, caption: "Work that shipped, and people who'll say so.", captionAt: 1.2, out: "dissolve" },
  { id: "wall", start: 49, dur: 6, plate: "wall", from: 0, camera: { from: [1.2, -0.02, 0.06], to: [1.08, 0, 0.03] }, caption: "There's a wall for saying hi.", captionAt: 0.6, out: "zoomout" },
  { id: "end", start: 55, dur: 5, kind: "end" },
];

/** Sound effects, in seconds on the film's clock: [time, name, gain] (audio.mjs draws each one) */
export const sfx = [
  [0.3, "scratch", 0.9],
  [2.4, "click", 0.7],
  // The tags landing in the hero
  ...[3.35, 3.5, 3.62, 3.8, 3.95, 4.1, 4.22, 4.4, 4.6, 4.85, 5.1].map((t, i) => [t, "tick", 0.55 - i * 0.025]),
  // The sentence's selection boxes snapping on
  [9.3, "snap", 0.7],
  [10.5, "snap", 0.7],
  [11.7, "snap", 0.7],
  [12.8, "snap", 0.7],
  [20.4, "peel", 0.9],
  [21.4, "whoosh", 0.6],
  [23.75, "whip", 0.8],
  [25.9, "tap", 0.8],
  [26.25, "chime", 0.5],
  [33.5, "thump", 0.7],
  // Four details, one sound each
  [37.05, "creak", 0.6],
  [38.6, "key", 0.7],
  [39.25, "key", 0.5],
  [39.5, "key", 0.5],
  [40.05, "glass", 0.55],
  [41.75, "switch", 0.8],
  [42.4, "riserEnd", 0.5],
  // The doodle wall: brush on paper, the highlighter, the add, the zoom out
  [49.2, "brush", 0.7],
  [49.8, "brush", 0.6],
  [50.55, "brush", 0.6],
  [51.05, "dot", 0.6],
  [51.7, "marker", 0.6],
  [53.2, "pop", 0.9],
  [54.0, "whooshDown", 0.6],
  [55.0, "hit", 0.8],
  [56.6, "scratch", 0.7],
];
