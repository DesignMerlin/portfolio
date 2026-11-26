"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { conduct } from "@/components/ui/film-conductor";

// 3D films are their own chunk, fetched only where one is shown
const films = {
  room8: dynamic(() => import("@/components/case-study/room8/film")),
  fundpath: dynamic(() => import("@/components/case-study/fundpath/film")),
  yoyo: dynamic(() => import("@/components/case-study/yoyo/film")),
  revivalStream: dynamic(() => import("@/components/case-study/revival-stream/film")),
  iexcelo: dynamic(() => import("@/components/case-study/iexcelo/film")),
  voxdeed: dynamic(() => import("@/components/case-study/voxdeed/film")),
  powerroute: dynamic(() => import("@/components/case-study/powerroute/film")),
  caseTracker: dynamic(() => import("@/components/case-study/case-tracker/film")),
};

/** Whether a "#rrggbb" wash is dark enough for light text */
const dark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 128;
};

export type Mockup = {
  /** Two colours for the backdrop wash, e.g. the product's brand colours */
  wash: [string, string];
} & (
  | {
      /** Desktop screenshot, shown on the laptop (scrolls if taller than the screen) */
      desktop: string;
      /** Mobile screenshot, shown on the phone (scrolls through its full length) */
      mobile: string;
    }
  | {
      /** Phone-only products: three screens (600×1076), one per phone */
      phones: [string, string, string];
    }
  | {
      /** A 3D film built for this project */
      film: keyof typeof films;
    }
);

/**
 * A product shot as a short motion ad: a laptop and a phone, drawn in CSS,
 * showing real screenshots. When it comes into view the laptop rises in and
 * the phone slides up beside it, then both screens scroll through the page
 * slowly, back and forth, like someone browsing it. Sized in container units,
 * so it fits any card.
 *
 * Phone-only products get three phones instead: one in front and two
 * angled behind it. They take turns at the front on a slow, continuous loop,
 * each gliding round to the next spot, so every screen gets its moment.
 *
 * Plays only while on screen (paused otherwise). Reduced motion: no entrance
 * and no movement; the devices sit still.
 */
export function DeviceMockup({
  mockup,
  label,
  covered = false,
  paused = false,
  rate = 1,
  priority = false,
}: {
  mockup: Mockup;
  label: string;
  /** Hidden behind something else: hold still rather than animate unseen */
  covered?: boolean;
  /** Paused by the visitor */
  paused?: boolean;
  /** Film speed: 0.25 is slow motion */
  rate?: number;
  priority?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);
  // Films load when their card gets close to the screen
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = !!e?.isIntersecting;
        setVisible(v);
        if (v) setSeen(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    const nearIo = new IntersectionObserver(([e]) => e?.isIntersecting && setNear(true), { rootMargin: "500px 0px" });
    nearIo.observe(el);
    return () => {
      io.disconnect();
      nearIo.disconnect();
    };
  }, []);

  // Several films at once is too much to draw: the conductor lets the one being looked at play
  const [allowed, setAllowed] = useState(false);
  const turn = useRef<ReturnType<typeof conduct> | null>(null);
  useEffect(() => {
    const t = conduct(root.current!, setAllowed);
    turn.current = t;
    return () => t.leave();
  }, []);
  useEffect(() => {
    turn.current?.want(!covered && !paused);
  }, [covered, paused]);
  // Its turn has come: decode every picture in the film ahead of time, off the main thread, so a screen
  // appearing mid-film doesn't stall a frame while it is decoded
  useEffect(() => {
    if (!allowed) return;
    root.current?.querySelectorAll("img").forEach((img) => {
      if (img.complete) img.decode().catch(() => {});
    });
  }, [allowed]);

  const playing = visible && allowed && !covered && !paused;
  const Film = "film" in mockup ? films[mockup.film] : null;
  const what = "film" in mockup ? (mockup.film === "revivalStream" ? "a laptop and an iPhone, as a short film" : mockup.film === "iexcelo" || mockup.film === "voxdeed" ? "a browser and an iPhone, as a short film" : "iPhones, as a short film") : "phones" in mockup ? "three phones" : "a laptop and a phone";

  return (
    <div
      ref={root}
      role="img"
      aria-label={`${label} on ${what}`}
      // For the nav passing over it (films set their own, moment by moment)
      data-nav-tone={dark(mockup.wash[0]) ? "dark" : "light"}
      data-seen={seen ? "" : undefined}
      data-playing={playing ? "" : undefined}
      className="device-mockup absolute inset-0 isolate overflow-hidden [container-type:size]"
      style={
        {
          "--wash-a": mockup.wash[0],
          "--wash-b": mockup.wash[1],
        } as React.CSSProperties
      }
    >
      <div aria-hidden="true" className="device-wash absolute inset-0" />

      {Film ? near ? <Film playing={playing} rate={rate} /> : null : "phones" in mockup ? (
        mockup.phones.map((src, i) => (
          <div
            key={src}
            className="device-phone device-trio absolute"
            style={{ "--slot": i } as React.CSSProperties}
          >
            <div className="device-screen device-trio-screen">
              <span className="device-island" />
              <Image
                src={src}
                alt=""
                fill
                sizes="30vw"
                priority={priority && i === 0}
                draggable={false}
                className="object-cover object-top"
              />
            </div>
          </div>
        ))
      ) : "desktop" in mockup ? (
        <>
          {/* Laptop */}
          <div className="device-laptop absolute">
            <div className="device-laptop-lid">
              <span className="device-laptop-cam" />
              <div className="device-screen">
                <div className="device-scroll device-scroll-desktop">
                  <Image
                    src={mockup.desktop}
                    alt=""
                    width={1600}
                    height={1249}
                    sizes="60vw"
                    priority={priority}
                    draggable={false}
                    className="block h-auto w-full"
                  />
                </div>
              </div>
            </div>
            <div className="device-laptop-base" />
          </div>

          {/* Phone */}
          <div className="device-phone absolute">
            <div className="device-screen device-phone-screen">
              <span className="device-island" />
              <div className="device-scroll device-scroll-mobile">
                <Image
                  src={mockup.mobile}
                  alt=""
                  width={520}
                  height={1455}
                  sizes="20vw"
                  priority={priority}
                  draggable={false}
                  className="block h-auto w-full"
                />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
