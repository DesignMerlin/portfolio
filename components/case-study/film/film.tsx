"use client";

import Image from "next/image";
import { Fragment, useMemo } from "react";
import { LiveParts, liveTracks } from "@/components/case-study/live/kit";
import { bokeh, K, SH, SW, tap, type FilmPhone, type Frame, type Storyboard } from "@/components/case-study/film/kit";
import { useFilm, type FilmProps, type FilmScript } from "@/components/case-study/film/use-film";

const PERSPECTIVE = 1700;
/** The body's thickness: rounded slabs stacked back to front */
const SLABS = 9;

function trackMap(s: Storyboard) {
  const p = s.phone;
  const tracks: Record<string, Frame[]> = {
    fade: s.fade,
    shadow: s.shadow,
    phone: p.track,
    glare: p.glare,
    "bokeh-1": bokeh(s.length, -60, 60, 190, -120, 0.8),
    "bokeh-2": bokeh(s.length, 60, -40, -220, 140, 0.7),
    "bokeh-3": bokeh(s.length, 0, 0, 260, 90, 0.6),
  };
  p.screens.forEach((x) => {
    tracks[`screen-${x.id}`] = x.frames;
    if (x.live) Object.assign(tracks, liveTracks(`live-${x.id}`, x.live.scene, x.live.t));
  });
  p.taps.forEach((x, i) => (tracks[`tap-${i}`] = tap(x.t)));
  p.pieces.forEach((x, i) => (tracks[`piece-${i}`] = x.frames));
  return tracks;
}

/**
 * A storyboard on one phone in a CSS 3D scene: the app's own screens, with
 * exact pieces of them lifting off.
 */
export function Film({ board, ...props }: FilmProps & { board: Storyboard }) {
  const script = useMemo(() => ({ length: board.length, poster: board.poster, tracks: trackMap(board), tones: [[0, "light"]] as FilmScript["tones"] }), [board]);
  const { root, stage } = useFilm(script, props);
  return (
    <div
      ref={root}
      aria-hidden="true"
      className="film absolute inset-0 overflow-hidden"
      style={{ "--film-shade": board.shade } as React.CSSProperties}
    >
      {/* Faded as a whole: an animated opacity on a phone would flatten its 3D */}
      <div ref={stage} data-track="fade" className="film-stage" style={{ perspective: PERSPECTIVE, visibility: "hidden" }}>
        <div data-track="shadow" className="film-shadow" />
        <Phone phone={board.phone} />
        <span data-track="bokeh-1" className="film-bokeh" style={{ width: 220, height: 220, left: 40, top: 700 }} />
        <span data-track="bokeh-2" className="film-bokeh" style={{ width: 140, height: 140, left: 960, top: 120 }} />
        <span data-track="bokeh-3" className="film-bokeh" style={{ width: 90, height: 90, left: 180, top: 160 }} />
      </div>
    </div>
  );
}

function Phone({ phone }: { phone: FilmPhone }) {
  return (
    <div data-track="phone" className="film-phone">
      {Array.from({ length: SLABS }, (_, i) => (
        <span key={i} className="film-slab" style={{ transform: `translateZ(${-18 + i * 2}px)` }} />
      ))}
      <span className="film-bezel" />
      <div className="film-screen">
        {phone.screens.map((s) => (
          <Fragment key={s.id}>
            <Image data-track={`screen-${s.id}`} src={s.src} alt="" width={SW} height={SH} sizes="700px" loading="eager" draggable={false} />
            {s.live ? (
              <span data-track={`screen-${s.id}`} style={{ width: SW, height: SH }}>
                <LiveParts id={`live-${s.id}`} scene={s.live.scene} />
              </span>
            ) : null}
          </Fragment>
        ))}
        {phone.taps.map((t, i) => (
          <span key={i} data-track={`tap-${i}`} className="film-tap" style={{ left: t.x * K, top: t.y * K }} />
        ))}
        <span data-track="glare" className="film-glare" />
      </div>

      {phone.pieces.map(({ src, box: [x, y, w, h], radius, up = 1 }, i) => (
        // Small exact crops, already the size they're shown at
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          data-track={`piece-${i}`}
          className="film-float"
          src={src}
          alt=""
          width={Math.round(w * K * up)}
          height={Math.round(h * K * up)}
          decoding="async"
          draggable={false}
          style={{
            width: w * K * up,
            height: h * K * up,
            marginLeft: (x - (w * (up - 1)) / 2) * K - SW / 2,
            marginTop: (y - (h * (up - 1)) / 2) * K - SH / 2,
            borderRadius: radius * K * up,
          }}
        />
      ))}
    </div>
  );
}
