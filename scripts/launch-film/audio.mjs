// The launch film's soundtrack, synthesised from scratch so it's entirely Samuel's: an original piece at
// 120 BPM (so every cut in edit.mjs lands on a beat) shaped to the film's acts, and the sound effects from
// edit.mjs's cue list. Writes .launch-film/audio.wav (48 kHz, stereo, 16-bit).
//   node scripts/launch-film/audio.mjs
import fs from "node:fs";
import { BPM, LENGTH, sfx } from "./edit.mjs";

const SR = 48000;
const N = Math.round(LENGTH * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const beat = 60 / BPM;
const TAU = Math.PI * 2;

// Repeatable noise, so the track is the same every render
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const add = (i, l, r = l) => {
  if (i >= 0 && i < N) {
    L[i] += l;
    R[i] += r;
  }
};
/** One-pole low-pass state helper */
const lp = (cut) => {
  let y = 0;
  const a = 1 - Math.exp((-TAU * cut) / SR);
  return (x, c) => {
    const k = c ? 1 - Math.exp((-TAU * c) / SR) : a;
    y += k * (x - y);
    return y;
  };
};
const hp = (cut) => {
  const low = lp(cut);
  return (x) => x - low(x);
};
const env = (t, a, d, s, r, len) => {
  if (t < 0) return 0;
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < len) return s;
  return Math.max(0, s * (1 - (t - len) / r));
};
const pan = (p) => [Math.cos(((p + 1) * Math.PI) / 4), Math.sin(((p + 1) * Math.PI) / 4)];

// Where each act is, and how loud the groove is in it
const act = (t) => (t < 3 ? "open" : t < 14 ? "hook" : t < 37 ? "work" : t < 43 ? "craft" : t < 49 ? "proof" : t < 55 ? "invite" : "end");

// The chords: A minor, warm and a little hopeful. Two bars (4 s) each
const CHORDS = [
  [57, 60, 64, 67, 71], // Am9
  [53, 57, 60, 64], // Fmaj7
  [48, 55, 59, 64], // Cmaj7
  [55, 59, 62, 69], // G6/9
];
const chordAt = (t) => CHORDS[Math.floor(t / 4) % CHORDS.length];

// Pad -----------------------------------------------------------------------------------------
function pad() {
  for (let c = 0; c * 4 < LENGTH; c++) {
    const t0 = c * 4;
    const notes = chordAt(t0);
    const level = (t) => ({ open: 0.9, hook: 0.8, work: 0.5, craft: 0.45, proof: 1.6, invite: 0.55, end: 1.5 })[act(t)];
    notes.forEach((m, v) => {
      const [pl, pr] = pan(((v / (notes.length - 1)) * 2 - 1) * 0.6);
      for (const det of [-0.07, 0.07]) {
        const f = mtof(m + det);
        const filt = lp(900);
        let ph = Math.random();
        const len = 4.2;
        for (let i = 0; i < len * SR + SR; i++) {
          const t = t0 + i / SR;
          if (t >= LENGTH) break;
          ph += f / SR;
          ph -= Math.floor(ph);
          const saw = 2 * ph - 1;
          const cutoff = 700 + 500 * (0.5 + 0.5 * Math.sin(TAU * 0.11 * t)) + (act(t) === "craft" ? (t - 37) * 260 : 0);
          const y = filt(saw, cutoff) * env(i / SR, 0.9, 0.5, 0.85, 1.1, len - 0.2) * 0.036 * level(t);
          add(Math.floor(t * SR), y * pl, y * pr);
        }
      }
    });
  }
}

// Drums ------------------------------------------------------------------------------------------
function kick(t, gain = 1) {
  let ph = 0;
  for (let i = 0; i < 0.45 * SR; i++) {
    const s = i / SR;
    const f = 45 + 95 * Math.exp(-s * 26);
    ph += f / SR;
    const y = Math.sin(TAU * ph) * Math.exp(-s * 7.5) * 0.55 * gain + (i < 40 ? rnd() * 0.1 * gain : 0);
    add(Math.floor((t + s) * SR), y);
  }
}
function hat(t, gain = 1, open = false) {
  const h = hp(7500);
  for (let i = 0; i < (open ? 0.22 : 0.06) * SR; i++) {
    const s = i / SR;
    const y = h(rnd()) * Math.exp(-s * (open ? 14 : 70)) * 0.09 * gain;
    add(Math.floor((t + s) * SR), y * 0.8, y);
  }
}
function clap(t, gain = 1) {
  const h = hp(900);
  const l = lp(3200);
  for (let i = 0; i < 0.25 * SR; i++) {
    const s = i / SR;
    const burst = s < 0.03 ? 0.6 + 0.4 * Math.sin(s * 900) : 1;
    const y = l(h(rnd())) * Math.exp(-s * 16) * 0.22 * gain * burst;
    add(Math.floor((t + s) * SR), y * 0.9, y);
  }
}
function drums() {
  for (let b = 0; b * beat < LENGTH; b++) {
    const t = b * beat;
    const a = act(t);
    const inBar = b % 4;
    if (a === "hook" && (inBar === 0 || inBar === 2)) kick(t, 0.75);
    if (a === "work" || a === "invite") {
      kick(t, 0.9);
      hat(t + beat / 2, 0.9);
      if (inBar === 1 || inBar === 3) clap(t, 0.8);
      if (inBar === 3 && b % 8 === 7) hat(t + beat * 0.75, 0.6, true);
    }
    if (a === "craft") {
      kick(t, 0.85);
      // 16ths, rising into the drop
      for (let q = 0; q < 4; q++) hat(t + (q * beat) / 4, 0.5 + 0.5 * ((t - 37) / 6));
      if (inBar === 1 || inBar === 3) clap(t, 0.7);
    }
    if (a === "proof" && inBar === 0) kick(t, 0.35);
  }
  kick(55, 1.1);
}

// Bass ----------------------------------------------------------------------------------------------
function bass() {
  for (let b = 0; b * beat < LENGTH; b++) {
    const t = b * beat;
    const a = act(t);
    if (!(a === "work" || a === "invite" || a === "craft")) continue;
    const root = chordAt(t)[0] - 24;
    for (const off of [0, 0.75]) {
      const f = mtof(root + (off ? 12 : 0));
      const l = lp(380);
      const len = beat * (off ? 0.22 : 0.55);
      let ph = 0;
      for (let i = 0; i < (len + 0.08) * SR; i++) {
        const s = i / SR;
        ph += f / SR;
        const x = 0.65 * Math.sin(TAU * ph) + 0.35 * (2 * (ph % 1) - 1);
        const y = l(x) * env(s, 0.006, 0.08, 0.7, 0.07, len) * 0.2;
        add(Math.floor((t + off * beat + s) * SR), y);
      }
    }
  }
}

// Plucked arpeggio ------------------------------------------------------------------------------------
function pluck(t, m, gain, p) {
  const f = mtof(m);
  const l = lp(4000);
  const [pl, pr] = pan(p);
  for (let i = 0; i < 0.5 * SR; i++) {
    const s = i / SR;
    const tri = 2 * Math.abs(2 * ((s * f) % 1) - 1) - 1;
    const sq = (s * f) % 1 < 0.5 ? 1 : -1;
    const y = l(0.7 * tri + 0.3 * sq, 600 + 3800 * Math.exp(-s * 18)) * Math.exp(-s * 7) * 0.06 * gain;
    add(Math.floor((t + s) * SR), y * pl, y * pr);
  }
}
function arps() {
  for (let e = 0; e * (beat / 2) < LENGTH; e++) {
    const t = e * (beat / 2);
    const a = act(t);
    const notes = chordAt(t);
    const order = [0, 2, 1, 3, 2, 4, 1, 3];
    const m = notes[order[e % 8] % notes.length] + 12;
    if (a === "hook" && t >= 8) pluck(t, m, 0.8, Math.sin(e) * 0.5);
    if (a === "work" || a === "invite") pluck(t, m, 1, Math.sin(e) * 0.6);
    if (a === "craft") pluck(t, m + (e % 2 ? 12 : 0), 0.8, Math.sin(e) * 0.7);
    if (a === "proof" && e % 4 === 0) pluck(t, m, 0.6, Math.sin(e) * 0.4);
  }
  // A last bright chord, rolled
  [69, 72, 76, 79, 83].forEach((m, i) => pluck(55 + i * 0.05, m, 1.2, -0.5 + i * 0.25));
}

// Risers and drops --------------------------------------------------------------------------------------
function riser(t0, len, gain = 1) {
  const l = lp(500);
  for (let i = 0; i < len * SR; i++) {
    const k = i / (len * SR);
    const y = l(rnd(), 300 + 7000 * k * k) * k * k * 0.16 * gain;
    add(Math.floor((t0 + i / SR) * SR), y * (1 - k * 0.3), y);
  }
}
function subDrop(t0, gain = 1) {
  let ph = 0;
  for (let i = 0; i < 1.4 * SR; i++) {
    const s = i / SR;
    ph += (38 + 30 * Math.exp(-s * 3)) / SR;
    add(Math.floor((t0 + s) * SR), Math.sin(TAU * ph) * Math.exp(-s * 2.2) * 0.35 * gain);
  }
}

// Sound effects ------------------------------------------------------------------------------------------
const FX = {
  scratch(t, g) {
    // Felt tip on paper: band-passed noise, moving with the stroke's speed
    const h = hp(1800);
    const l = lp(5200);
    for (let i = 0; i < 1.6 * SR; i++) {
      const s = i / SR;
      const speed = Math.sin(Math.PI * Math.min(1, s / 1.6)) * (0.7 + 0.3 * Math.sin(s * 23));
      const y = l(h(rnd())) * speed * 0.16 * g;
      add(Math.floor((t + s) * SR), y, y * 0.85);
    }
  },
  click(t, g) {
    for (let i = 0; i < 0.04 * SR; i++) {
      const s = i / SR;
      const y = (Math.sin(TAU * 2400 * s) * 0.5 + rnd() * 0.5) * Math.exp(-s * 160) * 0.35 * g;
      add(Math.floor((t + s) * SR), y);
    }
  },
  tick(t, g) {
    // A wooden tag landing
    const f = 700 + Math.random() * 700;
    const [pl, pr] = pan(Math.random() * 1.4 - 0.7);
    for (let i = 0; i < 0.09 * SR; i++) {
      const s = i / SR;
      const y = (Math.sin(TAU * f * s) * 0.7 + rnd() * 0.3) * Math.exp(-s * 55) * 0.3 * g;
      add(Math.floor((t + s) * SR), y * pl, y * pr);
    }
  },
  snap(t, g) {
    for (let i = 0; i < 0.07 * SR; i++) {
      const s = i / SR;
      const y = (Math.sin(TAU * 1600 * s * (1 + s * 6)) * 0.6 + rnd() * 0.25) * Math.exp(-s * 70) * 0.3 * g;
      add(Math.floor((t + s) * SR), y);
    }
  },
  peel(t, g) {
    const l = lp(800);
    for (let i = 0; i < 0.9 * SR; i++) {
      const s = i / SR;
      const crackle = Math.random() < 0.06 ? 1.6 : 1;
      const y = l(rnd(), 600 + 5000 * (s / 0.9)) * Math.sin(Math.PI * Math.min(1, s / 0.9)) * 0.28 * g * crackle;
      add(Math.floor((t + s) * SR), y * 0.8, y);
    }
  },
  whoosh(t, g, up = true) {
    const l = lp(400);
    const len = 0.55;
    for (let i = 0; i < len * SR; i++) {
      const s = i / SR;
      const k = s / len;
      const cut = up ? 300 + 4200 * Math.sin(Math.PI * k) : 3800 - 3400 * k;
      const y = l(rnd(), cut) * Math.sin(Math.PI * k) * 0.3 * g;
      const [pl, pr] = pan(up ? -0.8 + 1.6 * k : 0.6 - 1.2 * k);
      add(Math.floor((t + s) * SR), y * pl, y * pr);
    }
  },
  whip(t, g) {
    FX.whoosh(t - 0.15, g * 1.3, true);
  },
  whooshDown(t, g) {
    FX.whoosh(t, g, false);
  },
  tap(t, g) {
    for (let i = 0; i < 0.06 * SR; i++) {
      const s = i / SR;
      add(Math.floor((t + s) * SR), (Math.sin(TAU * 900 * s) * 0.6 + rnd() * 0.2) * Math.exp(-s * 90) * 0.35 * g);
    }
  },
  chime(t, g) {
    [1760, 2637, 3520].forEach((f, n) => {
      for (let i = 0; i < 1.4 * SR; i++) {
        const s = i / SR;
        const y = Math.sin(TAU * f * s) * Math.exp(-s * (3 + n)) * 0.05 * g;
        add(Math.floor((t + s) * SR), y * (n === 1 ? 0.6 : 1), y);
      }
    });
  },
  thump(t, g) {
    kick(t, 0.6 * g);
    FX.tap(t, g * 0.6);
  },
  creak(t, g) {
    // A rope taking weight: a slow, rough, resonant squeak
    let ph = 0;
    for (let i = 0; i < 0.5 * SR; i++) {
      const s = i / SR;
      ph += (220 + 60 * Math.sin(s * 9)) / SR;
      const y = Math.sign(Math.sin(TAU * ph)) * (0.5 + 0.5 * rnd()) * Math.sin(Math.PI * (s / 0.5)) * 0.05 * g;
      add(Math.floor((t + s) * SR), y * 0.7, y);
    }
  },
  key(t, g) {
    for (let i = 0; i < 0.05 * SR; i++) {
      const s = i / SR;
      add(Math.floor((t + s) * SR), (rnd() * 0.6 + Math.sin(TAU * 3200 * s) * 0.4) * Math.exp(-s * 120) * 0.3 * g);
    }
  },
  glass(t, g) {
    [2093, 3136].forEach((f) => {
      for (let i = 0; i < 0.9 * SR; i++) {
        const s = i / SR;
        add(Math.floor((t + s) * SR), Math.sin(TAU * f * s) * Math.exp(-s * 5) * 0.06 * g);
      }
    });
  },
  switch(t, g) {
    FX.click(t, g);
    kick(t + 0.01, 0.35 * g);
  },
  riserEnd() {},
  brush(t, g) {
    const l = lp(1500);
    for (let i = 0; i < 0.5 * SR; i++) {
      const s = i / SR;
      const y = l(rnd()) * Math.sin(Math.PI * (s / 0.5)) * 0.22 * g;
      add(Math.floor((t + s) * SR), y, y * 0.9);
    }
  },
  dot(t, g) {
    FX.tap(t, g * 0.7);
  },
  marker(t, g) {
    let ph = 0;
    const h = hp(1200);
    for (let i = 0; i < 0.6 * SR; i++) {
      const s = i / SR;
      ph += 520 / SR;
      const y = (h(rnd()) * 0.15 + Math.sin(TAU * ph) * 0.02) * Math.sin(Math.PI * (s / 0.6)) * g;
      add(Math.floor((t + s) * SR), y);
    }
  },
  pop(t, g) {
    let ph = 0;
    for (let i = 0; i < 0.18 * SR; i++) {
      const s = i / SR;
      ph += (380 + 900 * Math.exp(-s * 30)) / SR;
      add(Math.floor((t + s) * SR), Math.sin(TAU * ph) * Math.exp(-s * 24) * 0.4 * g);
    }
    FX.chime(t + 0.02, g * 0.6);
  },
  hit(t, g) {
    subDrop(t, g);
    FX.chime(t, g * 0.8);
  },
};

// Simple stereo reverb (a few combs and all-passes), for space -------------------------------------------
function reverb(buf, mix) {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d: Math.round((d * SR) / 44100), b: new Float32Array(Math.round((d * SR) / 44100)), i: 0, f: 0 }));
  const aps = [225, 556].map((d) => ({ d: Math.round((d * SR) / 44100), b: new Float32Array(Math.round((d * SR) / 44100)), i: 0 }));
  const out = new Float32Array(buf.length);
  for (let n = 0; n < buf.length; n++) {
    let s = 0;
    for (const c of combs) {
      const y = c.b[c.i];
      c.f = y * 0.7 + c.f * 0.3;
      c.b[c.i] = buf[n] * 0.5 + c.f * 0.82;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    for (const a of aps) {
      const y = a.b[a.i];
      a.b[a.i] = s + y * 0.5;
      a.i = (a.i + 1) % a.d;
      s = y - s * 0.5;
    }
    out[n] = buf[n] + s * mix * 0.25;
  }
  return out;
}

pad();
drums();
bass();
arps();
riser(10.2, 3.8, 0.7);
riser(39, 4, 1.1);
subDrop(14, 1);
subDrop(49, 0.8);
for (const [t, name, g] of sfx) FX[name]?.(t, g);

const wl = reverb(L, 0.9);
const wr = reverb(R, 0.9);
// Master: gentle fade in and out, soft limiting
const pcm = Buffer.alloc(N * 4);
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(wl[i]), Math.abs(wr[i]));
// Level set from the main groove (14 to 42 s): about -15 dB RMS, where web video sits; the limiter takes peaks
let sum = 0;
for (let i = 14 * SR; i < 42 * SR; i++) sum += (wl[i] * wl[i] + wr[i] * wr[i]) / 2;
const norm = Math.pow(10, -15 / 20) / Math.sqrt(sum / (28 * SR)) / 1.1;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.3) * Math.min(1, (LENGTH - t) / 1.2);
  const soft = (x) => Math.tanh(x * norm * 1.1) * 0.95;
  pcm.writeInt16LE(Math.round(soft(wl[i]) * fade * 32767), i * 4);
  pcm.writeInt16LE(Math.round(soft(wr[i]) * fade * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);
fs.mkdirSync(".launch-film", { recursive: true });
fs.writeFileSync(".launch-film/audio.wav", Buffer.concat([header, pcm]));
console.log(`audio: ${LENGTH}s, peak before limiting ${peak.toFixed(2)}`);
