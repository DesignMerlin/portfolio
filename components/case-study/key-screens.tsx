"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CloseIcon } from "@/components/ui/icons";
import { LiveOverlay } from "@/components/case-study/live/kit";
import { liveScene } from "@/components/case-study/live/scenes";
import { TourModes } from "@/components/case-study/room8/tour-modes";
import { PlaceholderShot } from "@/components/ui/placeholder-shot";
import type { KeyScreenGroup, ProjectDetail, Screen } from "@/content/details";

/**
 * The project's screens, grouped by the moment they belong to, on panels in
 * its own colour. Any screen opens large; from there the arrow keys, buttons
 * or a swipe move through every screen in order, and Escape or the backdrop
 * closes it, returning focus to the screen it opened from.
 * Projects whose exports haven't arrived show labelled placeholders.
 */
export function KeyScreens({
  groups,
  tint,
  kind,
  title,
}: {
  groups: KeyScreenGroup[] | null;
  tint: string;
  kind: ProjectDetail["kind"];
  title: string;
}) {
  // Every screen once, in the order it first appears
  const all: Screen[] = [];
  for (const g of groups ?? []) for (const p of g.panels) for (const s of p.screens) if (!all.includes(s)) all.push(s);
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const tinted = { "--tint": tint } as React.CSSProperties;

  if (!groups) {
    return (
      <div style={tinted}>
        <p className="max-w-[60ch] text-ink-2">The real screens are on their way from Figma.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-[var(--radius-l)] border border-line ${i === 2 ? "aspect-[16/10] sm:col-span-2" : "aspect-[5/4]"}`}
            >
              <PlaceholderShot kind={i === 2 ? "wireframe" : kind} tint={tint} label={`${title} screen ${i + 1}`} className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={tinted} className="space-y-16 lg:space-y-20">
      {groups.map((g) => (
        <section key={g.title} aria-label={g.title}>
          <div className="mb-6 grid gap-x-8 gap-y-2 md:grid-cols-[200px_minmax(0,1fr)]">
            <h3 className="font-sans text-body font-medium tracking-[-0.02em] text-ink">{g.title}</h3>
            <p className="max-w-[62ch] text-ink-2">{g.body}</p>
          </div>
          {g.live === "room8-tour" ? (
            <TourModes />
          ) : (
            <div className={`grid gap-3 sm:gap-4 ${g.panels.length > 1 && !g.panels.some((p) => p.devices) ? "grid-cols-2" : ""}`}>
              {g.panels.map((panel, i) =>
                panel.devices ? (
                  <div key={i} data-tone={panel.tone} className="device-panel overflow-hidden rounded-[var(--radius-l)]">
                    {panel.screens.map((screen) => (
                      <FramedScreen key={screen.src} screen={screen} onOpen={() => setOpen(all.indexOf(screen))} />
                    ))}
                  </div>
                ) : (
                <div
                  key={i}
                  data-tone={panel.tone}
                  className="screen-panel overflow-hidden rounded-[var(--radius-l)]"
                  style={{ "--n": panel.screens.length } as React.CSSProperties}
                >
                  {panel.screens.map((screen) => (
                    <button
                      key={screen.src}
                      type="button"
                      onClick={() => setOpen(all.indexOf(screen))}
                      aria-label={`Open screen. ${screen.alt}`}
                      className="screen-card relative block w-full max-w-[300px] cursor-zoom-in overflow-hidden"
                    >
                      <Image src={screen.src} alt="" width={948} height={2100} sizes="(min-width: 1024px) 300px, 45vw" draggable={false} className="block h-auto w-full" />
                      {liveScene(screen.src) ? <LiveOverlay scene={liveScene(screen.src)!} /> : null}
                    </button>
                  ))}
                </div>
                ),
              )}
            </div>
          )}
        </section>
      ))}
      <ScreenViewer screens={all} index={open} onIndex={setOpen} onClose={close} />
    </div>
  );
}

/** A desktop screen in a laptop, or a mobile one in an iPhone. Longer pages show their top; opening one shows all of it */
function FramedScreen({ screen, onOpen }: { screen: Screen; onOpen: () => void }) {
  const { w = 375, h = 812 } = screen;
  const laptop = w > 600;
  const scene = liveScene(screen.src);
  return (
    <button type="button" onClick={onOpen} aria-label={`Open screen. ${screen.alt}`} className={laptop ? "frame-laptop" : "frame-phone"}>
      <span className="frame-body">
        <span className="frame-screen">
          <Image src={screen.src} alt="" width={w} height={h} sizes={laptop ? "(min-width: 1024px) 720px, 92vw" : "(min-width: 1024px) 200px, 30vw"} draggable={false} className="block h-auto w-full max-w-none" />
          {scene ? <LiveOverlay scene={scene} /> : null}
          {laptop ? null : <span className="frame-island" />}
        </span>
      </span>
      {laptop ? <span className="frame-base" /> : null}
    </button>
  );
}

function ScreenViewer({
  screens,
  index,
  onIndex,
  onClose,
}: {
  screens: Screen[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const screen = index === null ? undefined : screens[index];
  const isOpen = !!screen;
  const { w = 375, h = 812 } = screen ?? {};
  const desktop = w > 600;
  // A long phone page is shown at reading size and scrolls
  const long = !desktop && h / w > 2.4;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  const go = (dir: number) => {
    if (index !== null) onIndex((index + dir + screens.length) % screens.length);
  };

  return (
    <dialog
      ref={dialog}
      aria-label="Screen viewer"
      className="screen-viewer"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onPointerDown={(e) => {
        swipe.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = swipe.current;
        swipe.current = null;
        if (!start || e.pointerType === "mouse") return;
        const dx = e.clientX - start.x;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(dx < 0 ? 1 : -1);
      }}
    >
      {screen ? (
        <>
          <div key={screen.src} className={long ? "screen-viewer-long" : "contents"} tabIndex={long ? 0 : undefined} role={long ? "group" : undefined} aria-label={long ? "The whole page. Scroll to see more" : undefined}>
            <Image
              src={screen.src}
              alt={screen.alt}
              width={screen.w ?? 948}
              height={screen.h ?? 2100}
              sizes={desktop ? "92vw" : "(min-width: 640px) 45vh, 80vw"}
              draggable={false}
              className={`screen-viewer-img ${desktop ? "screen-viewer-desktop" : ""}`}
            />
          </div>
          <div className="screen-viewer-bar">
            <button type="button" onClick={() => go(-1)} aria-label="Previous screen">
              <ArrowLeft />
            </button>
            <p aria-live="polite" className="tabular">
              {index! + 1} of {screens.length}
            </p>
            <button type="button" onClick={() => go(1)} aria-label="Next screen">
              <ArrowRight />
            </button>
            <button type="button" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
