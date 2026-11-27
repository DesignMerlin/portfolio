/**
 * The shared doodle wall's storage: Upstash Redis over its REST API (no client library), set up from the
 * Vercel dashboard (Storage → Upstash Redis → connect to the project), which adds the URL and token below.
 * Without them the wall still works, kept in each visitor's browser.
 *
 * Shapes are checked and capped here, so nothing oversized or malformed is ever stored.
 */
import { createHash } from "node:crypto";

/** t: the tool that drew it (0 pen, 1 brush, 2 highlighter) */
export type WallStroke = { t: number; ink: number; w: number; pts: [number, number][] };
export type WallDoodle = { id: string; at: number; strokes: WallStroke[] };

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const wallStored = !!(URL_ && TOKEN);

/** Limits: what one doodle may hold, how many the wall keeps, how many one visitor may leave an hour */
export const LIMITS = { tools: 3, inks: 5, strokes: 160, points: 3000, coord: 1e6, minW: 0.5, maxW: 80, keep: 250, perHour: 5 };

const DOODLES = "wall:doodles";
const ORDER = "wall:order";

async function redis<T = unknown>(cmds: (string | number)[][]): Promise<T[]> {
  const res = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`wall store ${res.status}`);
  const out = (await res.json()) as { result?: T; error?: string }[];
  return out.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result as T;
  });
}

export async function listDoodles(): Promise<WallDoodle[]> {
  if (!wallStored) return [];
  const [flat] = await redis<string[]>([["HGETALL", DOODLES]]);
  const out: WallDoodle[] = [];
  for (let i = 1; i < (flat?.length ?? 0); i += 2) {
    try {
      out.push(JSON.parse(flat![i]!) as WallDoodle);
    } catch {}
  }
  return out.sort((a, b) => a.at - b.at);
}

/** A doodle as sent by a visitor, checked and tidied; null if it isn't one */
export function cleanDoodle(body: unknown): WallStroke[] | null {
  const strokes = (body as { strokes?: unknown })?.strokes;
  if (!Array.isArray(strokes) || !strokes.length || strokes.length > LIMITS.strokes) return null;
  let points = 0;
  const out: WallStroke[] = [];
  for (const s of strokes) {
    const { t, ink, w, pts } = (s ?? {}) as Partial<WallStroke>;
    if (!Number.isInteger(t) || t! < 0 || t! >= LIMITS.tools) return null;
    if (!Number.isInteger(ink) || ink! < 0 || ink! >= LIMITS.inks) return null;
    if (typeof w !== "number" || !Number.isFinite(w) || w < LIMITS.minW || w > LIMITS.maxW) return null;
    if (!Array.isArray(pts) || !pts.length) return null;
    points += pts.length;
    if (points > LIMITS.points) return null;
    const clean: [number, number][] = [];
    for (const p of pts) {
      if (!Array.isArray(p) || p.length !== 2) return null;
      const [x, y] = p;
      if (typeof x !== "number" || typeof y !== "number" || !Number.isFinite(x) || !Number.isFinite(y)) return null;
      if (Math.abs(x) > LIMITS.coord || Math.abs(y) > LIMITS.coord) return null;
      clean.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
    }
    out.push({ t: t!, ink: ink!, w: Math.round(w * 10) / 10, pts: clean });
  }
  return out;
}

/** Who's leaving it, as a one-way hash (never the address itself), only to count doodles per hour */
const visitor = (ip: string) => createHash("sha256").update(`${process.env.WALL_ADMIN_KEY ?? "wall"}:${ip}`).digest("hex").slice(0, 24);

/** Adds a doodle. "busy" if this visitor has left their share for the hour */
export async function addDoodle(strokes: WallStroke[], ip: string): Promise<WallDoodle | "busy"> {
  const rate = `wall:rate:${visitor(ip)}`;
  const [count] = await redis<number>([["INCR", rate], ["EXPIRE", rate, 3600, "NX"]]);
  if ((count ?? 0) > LIMITS.perHour) return "busy";
  const doodle: WallDoodle = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, at: Date.now(), strokes };
  const [, , size] = await redis<number>([
    ["HSET", DOODLES, doodle.id, JSON.stringify(doodle)],
    ["ZADD", ORDER, doodle.at, doodle.id],
    ["ZCARD", ORDER],
  ]);
  // The wall keeps the newest ones
  if ((size ?? 0) > LIMITS.keep) {
    const [old] = await redis<string[]>([["ZRANGE", ORDER, 0, (size ?? 0) - LIMITS.keep - 1]]);
    if (old?.length) await redis([["HDEL", DOODLES, ...old], ["ZREM", ORDER, ...old]]);
  }
  return doodle;
}

export async function removeDoodles(ids: string[] | "all") {
  if (ids === "all") return redis([["DEL", DOODLES, ORDER]]);
  if (!ids.length) return;
  return redis([["HDEL", DOODLES, ...ids], ["ZREM", ORDER, ...ids]]);
}

/** Samuel's key, compared in constant time */
export function isOwner(key: string | null) {
  const want = process.env.WALL_ADMIN_KEY;
  if (!want || !key || key.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ key.charCodeAt(i);
  return diff === 0;
}
