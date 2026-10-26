"use client";

import { animate, motion, motionValue, useMotionTemplate, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { Portrait } from "@/components/home/portrait";
import { spring } from "@/lib/motion";

const zero = motionValue(0);

/** True when a card turned by `deg` shows its front (the photo) */
const facesFront = (deg: number) => Math.cos((deg * Math.PI) / 180) >= 0;

/**
 * Portrait card with a name on the back.
 * - Two flips add up: scroll turns the card (the hero passes 0–360° as it
 *   glides left) and the visitor turns it (hover, tap, Enter or Space).
 *   One angle drives both the rotation and which face shows, so the right
 *   face is visible in every browser, with or without backface-visibility.
 * - The visitor's flip is a spring, so hovering in and out quickly reverses
 *   mid-turn instead of finishing the flip first.
 * - `interactive={false}` holds the card still (the hero uses this until the
 *   card has settled beside the services); a flipped card turns back.
 * - Reduced motion: no rotation, the two sides crossfade.
 */
export function FlipPortrait({
  photo,
  name,
  role,
  scrollTurn,
  interactive = true,
  priority = false,
}: {
  photo: { src: string | null; alt: string };
  name: string;
  role: string;
  /** Degrees of rotation driven by scroll (optional) */
  scrollTurn?: MotionValue<number>;
  /** Whether hover, tap and keyboard can flip it right now */
  interactive?: boolean;
  priority?: boolean;
}) {
  const [wantsFlip, setWantsFlip] = useState(false);
  const flipped = interactive && wantsFlip;
  const reduce = !!useReducedMotion();

  const hoverTurn = useMotionValue(0);
  useEffect(() => {
    if (reduce) {
      hoverTurn.set(flipped ? 180 : 0);
      return;
    }
    const c = animate(hoverTurn, flipped ? 180 : 0, spring.gentle);
    return () => c.stop();
  }, [flipped, reduce, hoverTurn]);

  const scroll = scrollTurn ?? zero;
  const angle = useTransform(() => (reduce ? 0 : scroll.get()) + hoverTurn.get());
  const transform = useMotionTemplate`rotateY(${angle}deg)`;
  const showFront = useTransform(() => (facesFront(scroll.get() * (reduce ? 0 : 1) + hoverTurn.get()) ? 1 : 0));
  const showBack = useTransform(showFront, (v) => 1 - v);

  // Reduced motion crossfades the faces instead of turning the card
  const frontStyle = reduce ? { opacity: flipped ? 0 : 1, transition: "opacity 280ms ease" } : { opacity: showFront };
  const backStyle = reduce
    ? { opacity: flipped ? 1 : 0, transition: "opacity 280ms ease" }
    : { opacity: showBack, transform: "rotateY(180deg)" };

  return (
    <div className="h-full w-full [perspective:1400px]">
      <motion.button
        type="button"
        aria-pressed={interactive ? flipped : undefined}
        aria-disabled={!interactive || undefined}
        tabIndex={interactive ? 0 : -1}
        aria-label={interactive ? `${name}, ${role}. ${flipped ? "Show photo" : "Flip card"}` : photo.alt}
        onHoverStart={() => interactive && setWantsFlip(true)}
        onHoverEnd={() => setWantsFlip(false)}
        onClick={(e) => {
          if (!interactive) return;
          // Mouse users already flip on hover; clicks from keyboard (detail 0) or touch toggle it
          const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
          if (e.detail === 0 || !canHover) setWantsFlip((f) => !f);
        }}
        style={reduce ? undefined : { transform }}
        className={`relative block h-full w-full rounded-[var(--radius-l)] text-left outline-offset-4 [transform-style:preserve-3d] ${interactive ? "cursor-pointer" : "cursor-default"}`}
      >
        {/* Front: the photo */}
        <motion.span
          className="card-face absolute inset-0 overflow-hidden rounded-[var(--radius-l)] shadow-[var(--shadow-float)]"
          style={frontStyle}
        >
          <Portrait src={photo.src} alt={photo.alt} priority={priority} />
        </motion.span>

        {/* Back: name card */}
        <motion.span
          aria-hidden="true"
          className="card-face absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[var(--radius-l)] bg-[#14112b] p-[9%] text-white shadow-[var(--shadow-float)]"
          style={backStyle}
        >
          <span className="pointer-events-none absolute -top-1/4 -right-1/3 size-[110%] rounded-full bg-[radial-gradient(circle,rgb(169_156_255/0.45),transparent_62%)]" />
          <span className="relative font-mono text-[11px] text-white/50">Lagos, Nigeria</span>
          <span className="relative">
            <span className="block font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[0.95] font-bold tracking-[-0.03em]">
              {name}
            </span>
            <span className="mt-3 block text-small text-white/70">{role}</span>
          </span>
        </motion.span>
      </motion.button>
    </div>
  );
}
