"use client";

import {
  motion,
  motionValue,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { useRef, useSyncExternalStore } from "react";

type Unit = { text: string; note?: string };

const units: Unit[] = [
  { text: "I blend" },
  { text: "product thinking", note: "Research" },
  { text: "with" },
  { text: "interaction design", note: "Motion" },
  { text: "and" },
  { text: "code", note: "Components" },
  { text: "to make" },
  { text: "digital products", note: "Trust" },
  { text: "that just…" },
  { text: "make sense." },
];

const settled = motionValue(1);

const noop = () => () => {};
/** Where the browser can tie animation to scroll itself, the sentence is pure CSS (.sentence in globals.css) */
const useNative = () =>
  useSyncExternalStore(
    noop,
    () => CSS.supports("view-timeline-name: --a"),
    () => false,
  );

const TEXT = "mx-auto max-w-[17ch] text-balance font-display text-h1 font-semibold leading-[1.55] sm:leading-[1.45] lg:leading-[1.36]";
const BOX = "pointer-events-none absolute -inset-x-[0.12em] -inset-y-[0.02em] rounded-[3px] border border-accent";
const LABEL =
  "absolute -top-[1.35em] left-[-0.12em] rounded-[4px] bg-accent px-1.5 py-1 font-mono text-[11px] leading-none font-medium tracking-normal text-accent-ink sm:text-[13px]";
const CORNERS = ["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"];

/**
 * Motion that proves the point. As you scroll, the sentence lights up and
 * each skill gets a Figma-style selection box with its spec label, so the
 * sentence is annotated the way Samuel annotates a design. Scroll-linked,
 * so it moves only when the reader moves; reduced motion shows the finished,
 * fully annotated sentence.
 *
 * Where it can, the browser runs it straight off the scroll (a view timeline, off the main thread, so a phone
 * scrolling past costs nothing). Elsewhere Motion drives the same thing from the scroll position.
 */
export function ScrollSentence() {
  return useNative() ? <NativeSentence /> : <MotionSentence />;
}

function NativeSentence() {
  return (
    <div className="sentence">
      <p className={TEXT}>
        {units.map((u, i) => {
          const a = (i / units.length) * 0.9 * 100;
          const b = a + 100 / units.length;
          const box = a + (b - a) * 0.55;
          const range = { "--a": `${a.toFixed(2)}%`, "--b": `${b.toFixed(2)}%`, "--box": `${box.toFixed(2)}%` } as React.CSSProperties;
          return (
            <span key={u.text}>
              <span className="sentence-word" style={range}>
                {u.note ? (
                  <span className="relative inline-block whitespace-nowrap">
                    {u.text}
                    <span aria-hidden="true" className={`sentence-box ${BOX}`}>
                      {CORNERS.map((pos) => (
                        <span key={pos} className={`absolute size-[7px] border border-accent bg-surface ${pos}`} />
                      ))}
                    </span>
                    <span aria-hidden="true" className={`sentence-label ${LABEL}`}>
                      {u.note}
                    </span>
                  </span>
                ) : (
                  u.text
                )}
              </span>{" "}
            </span>
          );
        })}
      </p>
    </div>
  );
}

function MotionSentence() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });

  return (
    <div ref={ref}>
      <p className={TEXT}>
        {units.map((u, i) => (
          <Word
            key={u.text}
            unit={u}
            progress={reduce ? settled : scrollYProgress}
            index={i}
            total={units.length}
          />
        ))}
      </p>
    </div>
  );
}

function Word({
  unit,
  progress,
  index,
  total,
}: {
  unit: Unit;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = (index / total) * 0.9;
  const end = start + 1 / total;
  const lit = useTransform(progress, [start, end], [0, 1]);
  const opacity = useTransform(lit, [0, 1], [0.18, 1]);

  return (
    <>
      <motion.span style={{ opacity }}>{unit.note ? <Annotated unit={unit} lit={lit} /> : unit.text}</motion.span>{" "}
    </>
  );
}

function Annotated({ unit, lit }: { unit: Unit; lit: MotionValue<number> }) {
  const box = useTransform(lit, [0.55, 1], [0, 1]);
  const scale = useTransform(box, [0, 1], [0.96, 1]);
  const y = useTransform(box, [0, 1], [6, 0]);
  const boxTransform = useMotionTemplate`scale(${scale})`;
  const labelTransform = useMotionTemplate`translateY(${y}px)`;

  return (
    <span className="relative inline-block whitespace-nowrap">
      {unit.text}
      <motion.span aria-hidden="true" className={BOX} style={{ opacity: box, transform: boxTransform }}>
        {CORNERS.map((pos) => (
          <span key={pos} className={`absolute size-[7px] border border-accent bg-surface ${pos}`} />
        ))}
      </motion.span>
      <motion.span aria-hidden="true" className={LABEL} style={{ opacity: box, transform: labelTransform }}>
        {unit.note}
      </motion.span>
    </span>
  );
}
