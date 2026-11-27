"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type Stroke = { t: number; ink: number; w: number; pts: [number, number][] };
type Doodle = { id: string; at: number; strokes: Stroke[] };

const INKS = ["#1c1e24", "#e2553d", "#d99a00", "#0f8f86", "#4b3fd6"];
const KEY = "wall-admin-key";
const noop = () => () => {};
const storedKey = () => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};

/** One doodle, drawn small and framed to its own edges */
function Thumb({ d }: { d: Doodle }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const pts = d.strokes.flatMap((s) => s.pts);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const W = 240;
    const H = 180;
    c.width = W * 2;
    c.height = H * 2;
    const z = Math.min((W - 24) / Math.max(1, x1 - x0), (H - 24) / Math.max(1, y1 - y0), 2);
    ctx.setTransform(2 * z, 0, 0, 2 * z, 2 * (W / 2 - ((x0 + x1) / 2) * z), 2 * (H / 2 - ((y0 + y1) / 2) * z));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of d.strokes) {
      ctx.globalAlpha = s.t === 2 ? 0.35 : 1;
      ctx.strokeStyle = INKS[s.ink] ?? INKS[0]!;
      ctx.lineWidth = s.w;
      ctx.beginPath();
      s.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
  }, [d]);
  return <canvas ref={ref} aria-hidden="true" className="block h-[180px] w-[240px] max-w-full rounded-[10px] bg-white" />;
}

export function WallAdmin() {
  const [key, setKey] = useState("");
  // The key, remembered for this tab only; undefined until one is typed here (or forgotten)
  const remembered = useSyncExternalStore(noop, storedKey, () => null);
  const [entered, setSaved] = useState<string | null | undefined>(undefined);
  const saved = entered === undefined ? remembered : entered;
  const [doodles, setDoodles] = useState<Doodle[] | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    fetch("/api/wall", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ shared: boolean; doodles: Doodle[] }>)
      .then((data) => {
        setDoodles([...data.doodles].reverse());
        if (!data.shared) setMsg("The wall isn't shared yet: no store is connected.");
      })
      .catch(() => setMsg("Couldn't load the wall."));
  }, []);
  useEffect(() => load(), [load]);

  const remove = async (body: { ids?: string[]; all?: boolean }) => {
    if (!saved) return;
    setMsg("");
    const res = await fetch("/api/wall", { method: "DELETE", headers: { "Content-Type": "application/json", "x-wall-key": saved }, body: JSON.stringify(body) });
    if (res.status === 401) {
      setMsg("That key isn't right.");
      setSaved(null);
      try {
        sessionStorage.removeItem(KEY);
      } catch {}
      return;
    }
    if (!res.ok) return setMsg("Couldn't remove it just now.");
    setMsg(body.all ? "The wall is clear." : "Removed.");
    load();
  };

  if (!saved)
    return (
      <form
        className="mt-8 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!key.trim()) return;
          setSaved(key.trim());
          try {
            sessionStorage.setItem(KEY, key.trim());
          } catch {}
        }}
      >
        <label className="sr-only" htmlFor="wall-key">
          Your wall key
        </label>
        <input
          id="wall-key"
          type="password"
          autoComplete="current-password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Your wall key"
          className="h-11 flex-1 rounded-[10px] border border-line-strong bg-surface px-3"
        />
        <button type="submit" className="pressable h-11 rounded-[10px] bg-ink px-4 font-medium text-paper">
          Open
        </button>
        {msg ? <p className="text-small text-danger">{msg}</p> : null}
      </form>
    );

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-2">{doodles ? `${doodles.length} ${doodles.length === 1 ? "doodle" : "doodles"} on the wall` : "Loading…"}</p>
        <button
          type="button"
          disabled={!doodles?.length}
          onClick={() => confirm("Take every doodle off the wall? This can't be undone.") && void remove({ all: true })}
          className="pressable h-10 rounded-[10px] border border-danger/50 px-4 text-small text-danger disabled:opacity-40"
        >
          Remove all
        </button>
      </div>
      {msg ? (
        <p role="status" className="mt-3 text-small text-ink-2">
          {msg}
        </p>
      ) : null}
      <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
        {doodles?.map((d) => (
          <li key={d.id} className="rounded-[14px] border border-line p-3">
            <Thumb d={d} />
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-small text-ink-3">{new Date(d.at).toLocaleString()}</span>
              <button type="button" onClick={() => void remove({ ids: [d.id] })} className="pressable h-9 rounded-[9px] border border-line-strong px-3 text-small">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
