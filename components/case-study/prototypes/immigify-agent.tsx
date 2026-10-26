"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSlow } from "@/components/case-study/prototype-speed";
import { ArrowUpRight, CheckIcon, StopIcon } from "@/components/ui/icons";
import { spring, tween } from "@/lib/motion";

type Card =
  | { kind: "missing"; items: { name: string; from: string }[] }
  | { kind: "draft"; text: string };

type Script = {
  steps: string[];
  answer: string;
  card?: Card;
  sources: string[];
  followUps: string[];
};

// Sample client and data for the prototype. Not legal advice.
const scripts: Record<string, Script> = {
  "What's still missing from Adaeze's H-1B file?": {
    steps: ["Reading Adaeze Okafor's case file", "Checking the H-1B document checklist", "Comparing it with what's on file"],
    answer:
      "Two items are still missing before the petition can go out. Her credential evaluation hasn't been uploaded, and the employer support letter is still unsigned. Everything else on the checklist, including her passport and the certified LCA, is on file.",
    card: {
      kind: "missing",
      items: [
        { name: "Credential evaluation", from: "Request from client" },
        { name: "Signed support letter", from: "Request from employer" },
      ],
    },
    sources: ["Case file", "Firm's H-1B checklist"],
    followUps: ["Draft a reminder to Adaeze", "Who else is waiting on documents?"],
  },
  "Draft a reminder to Adaeze": {
    steps: ["Reading your last messages with Adaeze", "Checking the filing timeline"],
    answer: "Here's a short, friendly reminder. It names the one thing she needs to do and why the date matters.",
    card: {
      kind: "draft",
      text: "Hi Adaeze, quick one: we still need your credential evaluation to finish your H-1B petition. If you can upload it to your portal by Friday, we stay on track for filing. Reply here if anything's unclear.",
    },
    sources: ["Message history", "Case timeline"],
    followUps: ["What's still missing from Adaeze's H-1B file?"],
  },
  "Who else is waiting on documents?": {
    steps: ["Looking across your open cases"],
    answer:
      "I can only see Adaeze's file in this prototype, so I can't answer that one. In the product, this question lists every case blocked on a document, sorted by filing date.",
    sources: [],
    followUps: ["What's still missing from Adaeze's H-1B file?"],
  },
};

const starters = Object.keys(scripts).slice(0, 2);

type Turn = { q: string; status: "thinking" | "streaming" | "stopped" | "done"; step: number; words: number };

/**
 * Immigify's consultant agent, rebuilt as a working pattern study:
 * - Thinking shows what the agent is actually doing, step by step, instead
 *   of a spinner: consultants trust work they can see.
 * - Answers stream word by word into a fixed-width column, so lines never
 *   reflow under the reader's eye.
 * - "Stop generating" interrupts cleanly and keeps the partial answer, with
 *   a way to continue.
 * - Structured results arrive as a compact chip that expands, in place, into
 *   an actionable card. Follow-ups appear only once the answer has settled.
 */
export default function ImmigifyAgent() {
  const { t, ms } = useSlow();
  const reduce = useReducedMotion();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scroller = useRef<HTMLDivElement>(null);

  const current = turns[turns.length - 1];
  const busy = current && (current.status === "thinking" || current.status === "streaming");

  const update = (patch: Partial<Turn>) =>
    setTurns((ts) => ts.map((x, i) => (i === ts.length - 1 ? { ...x, ...patch } : x)));

  // Drive the current turn: steps, then words
  useEffect(() => {
    if (!current) return;
    const script = scripts[current.q]!;
    const words = script.answer.split(" ").length;
    if (current.status === "thinking") {
      timer.current = setTimeout(() => {
        if (current.step + 1 < script.steps.length) update({ step: current.step + 1 });
        else update({ status: "streaming", step: script.steps.length });
      }, ms(650));
    } else if (current.status === "streaming") {
      timer.current = setTimeout(() => {
        const next = Math.min(current.words + 1, words);
        update({ words: next, status: next >= words ? "done" : "streaming" });
      }, ms(38));
    }
    return () => clearTimeout(timer.current);
  }, [current, ms]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [turns.length, current?.status, current?.step, expanded, reduce]);

  const ask = (q: string) => {
    if (busy) return;
    setExpanded(null);
    setTurns((ts) => [...ts, { q, status: "thinking", step: 0, words: 0 }]);
  };

  return (
    <div
      role="group"
      aria-label="Immigify agent prototype"
      className="flex h-[580px] w-full max-w-[640px] flex-col overflow-hidden rounded-[20px] border border-line bg-surface shadow-[var(--shadow-float)]"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-[#3157d5] text-[11px] font-bold text-white">AI</span>
          <div className="leading-tight">
            <p className="text-small font-medium">Case assistant</p>
            <p className="text-micro text-ink-3">Sample client: Adaeze Okafor, H-1B</p>
          </div>
        </div>
        <span className="rounded-full border border-line px-2 py-0.5 text-micro text-ink-3">Prototype</span>
      </div>

      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
        {turns.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div className="max-w-[34ch]">
              <p className="text-lead font-medium">Ask about Adaeze&apos;s case</p>
              <p className="mt-1 text-small text-ink-2">The assistant reads the case file and the firm&apos;s checklists before it answers.</p>
              <div className="mt-5 flex flex-col gap-2">
                {starters.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => ask(q)}
                    className="pressable rounded-xl border border-line px-4 py-2.5 text-left text-small hover:border-line-strong hover:bg-sunken"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <LayoutGroup>
            <div className="space-y-6">
              {turns.map((turn, ti) => {
                const script = scripts[turn.q]!;
                const isLast = ti === turns.length - 1;
                const text = script.answer.split(" ").slice(0, turn.words);
                return (
                  <div key={ti} className="space-y-3">
                    <div className="flex justify-end">
                      <p className="max-w-[80%] rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-small text-paper">{turn.q}</p>
                    </div>

                    {/* Working steps: visible while thinking, then collapse to a one-line summary */}
                    <div className="text-small">
                      {turn.status === "thinking" ? (
                        <ul className="space-y-1.5">
                          {script.steps.slice(0, turn.step + 1).map((s, si) => {
                            const doing = si === turn.step;
                            return (
                              <motion.li
                                key={s}
                                initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(4px)" }}
                                animate={{ opacity: 1, transform: "translateY(0px)" }}
                                transition={t(tween("base"))}
                                className="flex items-center gap-2"
                              >
                                {doing ? (
                                  <span className="size-3.5 shrink-0 rounded-full border-2 border-[#3157d5]/30 border-t-[#3157d5] motion-safe:animate-spin" />
                                ) : (
                                  <CheckIcon className="shrink-0 text-signal" width={14} height={14} />
                                )}
                                <span className={doing ? "agent-shimmer" : "text-ink-2"}>{s}</span>
                              </motion.li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="flex items-center gap-1.5 text-micro text-ink-3">
                          <CheckIcon width={12} height={12} /> Checked {script.steps.length} {script.steps.length === 1 ? "source" : "sources"}
                        </p>
                      )}
                    </div>

                    {turn.status !== "thinking" ? (
                      <div className="max-w-[56ch] text-small leading-relaxed text-ink">
                        {text.map((w, wi) => (
                          <span key={wi} className="agent-token">
                            {w}{" "}
                          </span>
                        ))}
                        {turn.status === "streaming" ? <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-ink/60 motion-safe:animate-pulse" /> : null}
                      </div>
                    ) : null}

                    {turn.status === "stopped" ? (
                      <div className="flex items-center gap-3 text-small">
                        <span className="rounded-full bg-sunken px-2.5 py-0.5 text-micro text-ink-2">Stopped</span>
                        <button type="button" onClick={() => update({ status: "streaming" })} className="text-accent underline underline-offset-2">
                          Continue answer
                        </button>
                      </div>
                    ) : null}

                    <AnimatePresence>
                      {turn.status === "done" ? (
                        <motion.div
                          key="extras"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={t({ ...tween("base"), delay: 0.1 })}
                          className="space-y-3"
                        >
                          {script.card ? (
                            <ResultCard card={script.card} open={expanded === ti} onToggle={() => setExpanded(expanded === ti ? null : ti)} id={ti} />
                          ) : null}
                          {script.sources.length ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-micro text-ink-3">Sources</span>
                              {script.sources.map((s) => (
                                <span key={s} className="rounded-md border border-line px-2 py-0.5 text-micro text-ink-2">
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {isLast ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {script.followUps.map((f, fi) => (
                                <motion.button
                                  key={f}
                                  type="button"
                                  onClick={() => ask(f)}
                                  initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(6px)" }}
                                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                                  transition={t({ ...tween("base"), delay: 0.35 + fi * 0.05 })}
                                  className="pressable rounded-full border border-line px-3 py-1.5 text-small text-ink-2 hover:border-line-strong hover:text-ink"
                                >
                                  {f}
                                </motion.button>
                              ))}
                            </div>
                          ) : null}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </LayoutGroup>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-line p-3">
        <div className="flex h-10 flex-1 items-center rounded-xl bg-sunken px-3 text-small text-ink-3">
          {busy ? "Working on it…" : "Pick a question above to try it"}
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          {busy ? (
            <motion.button
              key="stop"
              type="button"
              onClick={() => {
                clearTimeout(timer.current);
                update({ status: "stopped", step: scripts[current.q]!.steps.length });
              }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.9)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              exit={{ opacity: 0, transform: reduce ? "none" : "scale(0.9)", transition: t(tween("quick", "exit")) }}
              transition={t(tween("quick"))}
              className="pressable flex h-10 items-center gap-1.5 rounded-xl bg-ink px-3 text-small text-paper"
            >
              <StopIcon /> Stop generating
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultCard({ card, open, onToggle, id }: { card: Card; open: boolean; onToggle: () => void; id: number }) {
  const { t } = useSlow();
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const label = card.kind === "missing" ? `${card.items.length} missing documents` : "Reminder draft";
  const layoutT = reduce ? { duration: 0 } : t(spring.gentle);

  return (
    <motion.div
      layout
      transition={layoutT}
      className="overflow-hidden border border-[#3157d5]/25 bg-[#3157d5]/[0.06]"
      style={{ borderRadius: open ? 16 : 999, width: open ? "100%" : "fit-content" }}
    >
      <motion.button
        layout="position"
        transition={layoutT}
        type="button"
        aria-expanded={open}
        aria-controls={`card-${id}`}
        onClick={onToggle}
        className="flex items-center gap-2 px-3.5 py-2 text-small font-medium text-[#3157d5] dark:text-[#9fb4ff]"
      >
        <span className="size-1.5 rounded-full bg-current" />
        {open ? "Hide" : label}
        {!open ? <ArrowUpRight /> : null}
      </motion.button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`card-${id}`}
            key="body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: t({ ...tween("base"), delay: 0.1 }) }}
            exit={{ opacity: 0, transition: t(tween("instant", "exit")) }}
            className="px-3.5 pb-3.5"
          >
            {card.kind === "missing" ? (
              <ul className="space-y-2">
                {card.items.map((it) => (
                  <li key={it.name} className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2.5 text-small">
                    <span className="text-ink">{it.name}</span>
                    <span className="rounded-full border border-line px-2.5 py-1 text-micro whitespace-nowrap text-ink-2">{it.from}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl bg-surface p-3 text-small text-ink">
                <p>{card.text}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(card.text).then(() => setCopied(true), () => {});
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-micro text-ink-2 hover:text-ink"
                >
                  {copied ? <CheckIcon width={12} height={12} className="text-signal" /> : null}
                  {copied ? "Copied" : "Copy draft"}
                </button>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
