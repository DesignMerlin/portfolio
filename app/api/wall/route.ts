import { NextResponse, type NextRequest } from "next/server";
import { addDoodle, cleanDoodle, isOwner, listDoodles, removeDoodles, wallStored } from "@/lib/wall";

/**
 * The shared doodle wall.
 * GET: every doodle on the wall (shared: false when no store is set up, so the wall stays in the browser).
 * POST { strokes }: leave a doodle. 429 once a visitor has left their share for the hour.
 * DELETE { ids } or { all: true } with the x-wall-key header: Samuel removes doodles (/wall-admin).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  if (!wallStored) return NextResponse.json({ shared: false, doodles: [] });
  try {
    return NextResponse.json({ shared: true, doodles: await listDoodles() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ shared: false, doodles: [], error: "The wall couldn't be loaded." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!wallStored) return NextResponse.json({ error: "This wall isn't shared yet." }, { status: 503 });
  const raw = await req.text();
  if (raw.length > 200_000) return NextResponse.json({ error: "That doodle is too big to leave." }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "That wasn't a doodle." }, { status: 400 });
  }
  const strokes = cleanDoodle(body);
  if (!strokes) return NextResponse.json({ error: "That doodle is too big, or isn't one." }, { status: 400 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  try {
    const done = await addDoodle(strokes, ip);
    if (done === "busy") return NextResponse.json({ error: "You've left a few already. Try again in a little while." }, { status: 429 });
    return NextResponse.json({ doodle: done }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "The wall couldn't take it just now. Try again in a moment." }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isOwner(req.headers.get("x-wall-key"))) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { ids?: unknown; all?: unknown };
  const ids = body.all === true ? "all" : Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string").slice(0, 500) : [];
  try {
    await removeDoodles(ids);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't remove them just now." }, { status: 503 });
  }
}
