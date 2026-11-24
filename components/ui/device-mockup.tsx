"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  priority = false,
}: {
  mockup: Mockup;
  label: string;
  /** Hidden behind something else: hold still rather than animate unseen */
  covered?: boolean;
  priority?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);

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
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={root}
      role="img"
      aria-label={`${label} on ${"phones" in mockup ? "three phones" : "a laptop and a phone"}`}
      data-seen={seen ? "" : undefined}
      data-playing={visible && !covered ? "" : undefined}
      className="device-mockup absolute inset-0 isolate overflow-hidden [container-type:size]"
      style={
        {
          "--wash-a": mockup.wash[0],
          "--wash-b": mockup.wash[1],
        } as React.CSSProperties
      }
    >
      <div aria-hidden="true" className="device-wash absolute inset-0" />

      {"phones" in mockup ? (
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
      ) : (
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
      )}
    </div>
  );
}
