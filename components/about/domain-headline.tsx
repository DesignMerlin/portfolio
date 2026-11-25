"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionTemplate, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { DeviceMockup, type Mockup } from "@/components/ui/device-mockup";
import { PlaceholderShot, type PlaceholderKind } from "@/components/ui/placeholder-shot";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { spring, tween } from "@/lib/motion";

export type Domain = { name: string; slug: string; title: string; tint: string; kind: PlaceholderKind; mockup?: Mockup };

/**
 * The CV headline, with each domain showing the work behind it. Hovering a
 * domain brings up its project beside the text, leaning after the cursor on a
 * spring; focusing one does the same. Every domain is a link to its project, so
 * touch and keyboard reach the same place. Reduced motion: the preview
 * appears in place without following.
 */
export function DomainHeadline({ lead, domains }: { lead: string; domains: Domain[] }) {
  const reduce = useReducedMotion();
  const [on, setOn] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 26 });
  const y = useSpring(0, { stiffness: 220, damping: 26 });
  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`;
  const d = on === null ? null : domains[on]!;

  /** Beside the paragraph, so it never covers what you're reading, leaning after the pointer */
  const place = (px: number, py: number, jump = false) => {
    const w = Math.min(300, innerWidth * 0.62);
    const h = w * (1032 / 1184);
    const r = box.current!.firstElementChild!.getBoundingClientRect();
    const nx = Math.min(r.right + 20 + (px - r.left) * 0.08, innerWidth - w - 12);
    const ny = Math.min(Math.max(12, py - h * 0.62), innerHeight - h - 12);
    if (jump || reduce) {
      x.jump(nx);
      y.jump(ny);
    } else {
      x.set(nx);
      y.set(ny);
    }
  };

  return (
    <div ref={box}>
      <p className="w-fit max-w-[24ch] text-[clamp(1.5rem,3.1vw,2.5rem)] leading-[1.2] font-medium tracking-[-0.03em] text-ink-2">
        {lead}{" "}
        {domains.map((dom, i) => (
          <span key={dom.slug}>
            <Link
              href={`/work/${dom.slug}`}
              transitionTypes={["nav-forward"]}
              className="domain"
              data-on={on === i ? "" : undefined}
              aria-label={`${dom.name}: see ${dom.title}`}
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                place(e.clientX, e.clientY, on === null);
                setOn(i);
              }}
              onPointerMove={(e) => e.pointerType === "mouse" && place(e.clientX, e.clientY)}
              onPointerLeave={() => setOn(null)}
              onFocus={(e) => {
                if (!e.currentTarget.matches(":focus-visible")) return;
                const r = e.currentTarget.getBoundingClientRect();
                place(r.left, r.bottom - 20, true);
                setOn(i);
              }}
              onBlur={() => setOn(null)}
            >
              {dom.name}
            </Link>
            {i < domains.length - 2 ? ", " : i === domains.length - 2 ? " and " : "."}
          </span>
        ))}
      </p>
      <AnimatePresence>
        {d ? (
          <motion.div
            key="preview"
            aria-hidden="true"
            className="domain-preview"
            style={{ transform }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: tween("quick", "exit") }}
            transition={tween("quick")}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={d.slug}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: reduce ? 1 : 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={reduce ? tween("base") : spring.gentle}
              >
                {d.mockup ? <DeviceMockup mockup={d.mockup} label={d.title} /> : <PlaceholderShot kind={d.kind} tint={d.tint} label={d.title} className="absolute inset-0 h-full w-full" />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
