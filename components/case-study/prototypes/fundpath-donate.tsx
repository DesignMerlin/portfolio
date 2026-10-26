"use client";

import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PhoneStage } from "@/components/case-study/prototypes/phone-stage";
import { useSlow } from "@/components/case-study/prototype-speed";
import { CheckIcon } from "@/components/ui/icons";
import { spring, tween } from "@/lib/motion";

const purple = "#7c4ddb";
const GOAL = 3_500_000;
const naira = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;

type Activity = { id: number; who: string; amount: number; you?: boolean };

const sampleDonors = ["Chidi O.", "Amaka N.", "Anonymous", "Bola T.", "Ifeoma K.", "Seun A."];

// Where the money went. Sample entries for the prototype.
const ledger = [
  { what: "Paid to hospital: pre-surgery tests", amount: 400_000, proof: "Receipt verified" },
  { what: "Paid to pharmacy: dialysis medication", amount: 180_000, proof: "Receipt verified" },
  { what: "Held for surgery deposit", amount: 920_000, proof: "In escrow" },
];

/**
 * FundPath key flow, answering "how might we show funds update in real time
 * and keep it transparent?"
 * - Pick an amount, confirm in a sheet that shows your wallet before and after.
 * - The raised total counts up while the bar springs forward: the money
 *   visibly arrives, instead of a number silently changing.
 * - Your donation enters the activity feed at the top; "Simulate a donor"
 *   shows what other people's gifts look like arriving live.
 * - "Where the money went" swaps the feed for the spending ledger.
 */
export default function FundpathDonate() {
  const { t, ms } = useSlow();
  const reduce = useReducedMotion();
  const [raised, setRaised] = useState(1_500_000);
  const [wallet, setWallet] = useState(250_000);
  const [amount, setAmount] = useState(5_000);
  const [sheet, setSheet] = useState(false);
  const [status, setStatus] = useState<"idle" | "paying" | "done">("idle");
  const [view, setView] = useState<"activity" | "ledger">("activity");
  const [feed, setFeed] = useState<Activity[]>([
    { id: 2, who: "Ngozi E.", amount: 20_000 },
    { id: 1, who: "Anonymous", amount: 5_000 },
  ]);
  const nextId = useRef(3);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const shownRaised = useMotionValue(raised);
  const label = useTransform(shownRaised, (v) => naira(v));
  const progress = useTransform(shownRaised, (v) => `scaleX(${Math.min(v / GOAL, 1)})`);
  const percent = useTransform(shownRaised, (v) => `${Math.floor((v / GOAL) * 100)}%`);

  useEffect(() => {
    const c = animate(shownRaised, raised, reduce ? { duration: 0 } : t(tween("scene")));
    return () => c.stop();
  }, [raised, shownRaised, reduce, t]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const add = (a: Omit<Activity, "id">) => {
    setFeed((f) => [{ ...a, id: nextId.current++ }, ...f].slice(0, 6));
    setRaised((r) => r + a.amount);
  };

  const confirm = () => {
    setStatus("paying");
    timers.current.push(
      setTimeout(() => {
        setStatus("done");
        setWallet((w) => w - amount);
        setView("activity");
        add({ who: "You", amount, you: true });
        timers.current.push(
          setTimeout(() => {
            setSheet(false);
            setStatus("idle");
          }, ms(900)),
        );
      }, ms(900)),
    );
  };

  const simulate = () => {
    const who = sampleDonors[Math.floor(Math.random() * sampleDonors.length)]!;
    const amt = [2_000, 5_000, 10_000, 25_000][Math.floor(Math.random() * 4)]!;
    add({ who, amount: amt });
  };

  return (
    <PhoneStage label="FundPath prototype">
      <div className="flex h-full flex-col bg-[#faf9ff] text-[#1d1638]">
        <div className="relative h-[150px] shrink-0 bg-[linear-gradient(150deg,#d9cff7,#b9a6ee)]" aria-hidden="true">
          <div className="absolute inset-x-6 bottom-4 h-14 rounded-xl bg-white/50" />
          <div className="absolute top-6 left-8 size-10 rounded-full bg-white/70" />
          <span className="absolute right-3 bottom-3 rounded-full bg-black/35 px-2 py-0.5 text-[10px] text-white">Sample photo</span>
        </div>

        <div className="px-4 pt-3">
          <p className="text-[15px] font-semibold">Jane&apos;s kidney transplant bills</p>
          <p className="text-[11px] text-[#6b6488]">Ibeju-Lekki, Lagos. Organised by Hope Rising Foundation</p>

          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-[12px] text-[#6b6488]">
              <motion.span className="text-[16px] font-semibold text-[#1d1638] tabular">{label}</motion.span> raised of {naira(GOAL)}
            </p>
            <motion.span className="text-[12px] font-medium tabular" style={{ color: purple }}>
              {percent}
            </motion.span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ebe6fb]">
            <motion.div className="h-full origin-left rounded-full" style={{ background: purple, transform: progress }} />
          </div>

          <div role="tablist" aria-label="Campaign details" className="mt-4 grid grid-cols-2 rounded-xl bg-[#efebfb] p-1 text-[12px]">
            {(["activity", "ledger"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className="relative rounded-lg py-1.5"
                style={{ color: view === v ? "#1d1638" : "#6b6488" }}
              >
                {view === v ? (
                  <motion.span layoutId="fp-tab" transition={reduce ? { duration: 0 } : t(spring.snappy)} className="absolute inset-0 rounded-lg bg-white shadow-sm" />
                ) : null}
                <span className="relative">{v === "activity" ? "Live activity" : "Where the money went"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden px-4 pt-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {view === "activity" ? (
              <motion.ul
                key="activity"
                aria-live="polite"
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: t(tween("quick", "exit")) }}
              >
                <AnimatePresence initial={false}>
                  {feed.map((a) => (
                    <motion.li
                      key={a.id}
                      layout={!reduce}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-12px) scale(0.98)" }}
                      animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                      exit={{ opacity: 0 }}
                      transition={t(spring.gentle)}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[12px]"
                      style={{ background: a.you ? "#efe9ff" : "#ffffff" }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: a.you ? purple : "#a79bd0" }}>
                          {a.who[0]}
                        </span>
                        {a.who} donated
                      </span>
                      <span className="font-semibold tabular">{naira(a.amount)}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            ) : (
              <motion.ul
                key="ledger"
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: t(tween("quick", "exit")) }}
              >
                {ledger.map((l) => (
                  <li key={l.what} className="rounded-xl bg-white px-3 py-2.5 text-[12px]">
                    <div className="flex justify-between gap-2">
                      <span>{l.what}</span>
                      <span className="font-semibold tabular">{naira(l.amount)}</span>
                    </div>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px]" style={{ color: l.proof === "In escrow" ? "#6b6488" : "#1f8a4c" }}>
                      {l.proof !== "In escrow" ? <CheckIcon width={11} height={11} /> : null}
                      {l.proof}
                    </span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2 border-t border-black/5 bg-white p-4">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Donation amount">
            {[2_000, 5_000, 10_000].map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={amount === a}
                onClick={() => setAmount(a)}
                className="pressable flex-1 rounded-lg border py-2 text-[12px] font-medium transition-colors duration-150"
                style={{ borderColor: amount === a ? purple : "#e4def6", background: amount === a ? "#f1ecff" : "white" }}
              >
                {naira(a)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSheet(true)}
            disabled={wallet < amount}
            className="pressable h-11 w-full rounded-xl text-[14px] font-medium text-white disabled:opacity-40"
            style={{ background: purple }}
          >
            {wallet < amount ? "Not enough in your wallet" : `Donate ${naira(amount)}`}
          </button>
          <button type="button" onClick={simulate} className="w-full py-1 text-[11px] text-[#6b6488] underline underline-offset-2">
            Simulate another donor
          </button>
        </div>

        <AnimatePresence>
          {sheet ? (
            <>
              <motion.div
                key="scrim"
                className="absolute inset-0 z-10 bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: t(tween("quick", "exit")) }}
                transition={t(tween("base"))}
                onClick={() => status === "idle" && setSheet(false)}
              />
              <motion.div
                key="sheet"
                role="dialog"
                aria-label="Confirm donation"
                className="absolute inset-x-0 bottom-0 z-20 rounded-t-3xl bg-white p-5"
                initial={reduce ? { opacity: 0 } : { transform: "translateY(100%)" }}
                animate={reduce ? { opacity: 1 } : { transform: "translateY(0%)" }}
                exit={reduce ? { opacity: 0 } : { transform: "translateY(100%)", transition: t({ duration: 0.2, ease: [0.32, 0.72, 0, 1] }) }}
                transition={t({ duration: 0.38, ease: [0.32, 0.72, 0, 1] })}
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/10" />
                <p className="text-[15px] font-semibold">Donate {naira(amount)} to Jane</p>
                <div className="mt-4 space-y-2 rounded-2xl bg-[#f6f3ff] p-3 text-[12px]">
                  <Row label="Wallet now" value={naira(wallet)} />
                  <Row label="After this donation" value={naira(wallet - amount)} strong />
                  <Row label="Goes to" value="Escrow, released against receipts" />
                </div>
                <button
                  type="button"
                  autoFocus
                  onClick={confirm}
                  disabled={status !== "idle"}
                  className="pressable relative mt-4 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl text-[14px] font-medium text-white"
                  style={{ background: status === "done" ? "#1f8a4c" : purple, transition: "background-color 280ms ease" }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={status}
                      className="flex items-center gap-2"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(10px)", filter: "blur(3px)" }}
                      animate={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-10px)", filter: "blur(3px)" }}
                      transition={t(status === "done" ? spring.bouncy : tween("quick"))}
                    >
                      {status === "idle" && "Confirm donation"}
                      {status === "paying" && "Sending securely…"}
                      {status === "done" && (
                        <>
                          <CheckIcon /> Thank you, it&apos;s on its way
                        </>
                      )}
                    </motion.span>
                  </AnimatePresence>
                </button>
                <button
                  type="button"
                  onClick={() => setSheet(false)}
                  disabled={status !== "idle"}
                  className="mt-2 w-full py-2 text-[12px] text-[#6b6488] disabled:opacity-0"
                >
                  Not now
                </button>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </PhoneStage>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[#6b6488]">{label}</span>
      <span className={`text-right tabular ${strong ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}
