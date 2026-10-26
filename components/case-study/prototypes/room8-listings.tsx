"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PhoneStage } from "@/components/case-study/prototypes/phone-stage";
import { useSlow } from "@/components/case-study/prototype-speed";
import { ArrowLeft, CheckIcon, SearchIcon } from "@/components/ui/icons";
import { spring, tween } from "@/lib/motion";

type Tab = "Recommended" | "Nearby" | "Luxury";

type Listing = {
  id: string;
  price: string;
  room: string;
  area: string;
  host: string;
  mates: number;
  match: number;
  tabs: Tab[];
  hue: number;
  traits: { label: string; you: string; them: string; score: number }[];
};

// Sample data for the prototype, shaped like the listings in Samuel's Figma
const listings: Listing[] = [
  {
    id: "a",
    price: "₦250,000/mo",
    room: "Private room, 3 bedroom apartment",
    area: "Ibeju-Lekki, Lagos",
    host: "Marcus Brown",
    mates: 1,
    match: 92,
    tabs: ["Recommended", "Nearby"],
    hue: 142,
    traits: [
      { label: "Sleep schedule", you: "Early riser", them: "Early riser", score: 1 },
      { label: "Cleanliness", you: "Tidy", them: "Very tidy", score: 0.85 },
      { label: "Guests", you: "Weekends", them: "Weekends", score: 1 },
      { label: "Work pattern", you: "Hybrid", them: "Remote", score: 0.7 },
    ],
  },
  {
    id: "b",
    price: "₦200,000/mo",
    room: "Private room, 6 bedroom apartment",
    area: "Ibeju-Lekki, Lagos",
    host: "Ozzy Abel",
    mates: 2,
    match: 78,
    tabs: ["Recommended"],
    hue: 190,
    traits: [
      { label: "Sleep schedule", you: "Early riser", them: "Night owl", score: 0.4 },
      { label: "Cleanliness", you: "Tidy", them: "Tidy", score: 1 },
      { label: "Guests", you: "Weekends", them: "Often", score: 0.6 },
      { label: "Work pattern", you: "Hybrid", them: "Hybrid", score: 1 },
    ],
  },
  {
    id: "c",
    price: "₦450,000/mo",
    room: "Ensuite room, 3 bedroom apartment",
    area: "Lekki Phase 1, Lagos",
    host: "John Konrad",
    mates: 3,
    match: 84,
    tabs: ["Recommended", "Luxury"],
    hue: 30,
    traits: [
      { label: "Sleep schedule", you: "Early riser", them: "Flexible", score: 0.8 },
      { label: "Cleanliness", you: "Tidy", them: "Tidy", score: 1 },
      { label: "Guests", you: "Weekends", them: "Rarely", score: 0.7 },
      { label: "Work pattern", you: "Hybrid", them: "Office", score: 0.75 },
    ],
  },
  {
    id: "d",
    price: "₦180,000/mo",
    room: "Shared room, 4 bedroom flat",
    area: "Ajah, Lagos",
    host: "Tolu Ade",
    mates: 2,
    match: 71,
    tabs: ["Nearby"],
    hue: 260,
    traits: [
      { label: "Sleep schedule", you: "Early riser", them: "Early riser", score: 1 },
      { label: "Cleanliness", you: "Tidy", them: "Relaxed", score: 0.45 },
      { label: "Guests", you: "Weekends", them: "Weekends", score: 1 },
      { label: "Work pattern", you: "Hybrid", them: "Student", score: 0.6 },
    ],
  },
  {
    id: "e",
    price: "₦620,000/mo",
    room: "Studio in a serviced duplex",
    area: "Ikoyi, Lagos",
    host: "Nneka Obi",
    mates: 1,
    match: 88,
    tabs: ["Luxury"],
    hue: 330,
    traits: [
      { label: "Sleep schedule", you: "Early riser", them: "Early riser", score: 1 },
      { label: "Cleanliness", you: "Tidy", them: "Very tidy", score: 0.85 },
      { label: "Guests", you: "Weekends", them: "Rarely", score: 0.7 },
      { label: "Work pattern", you: "Hybrid", them: "Hybrid", score: 1 },
    ],
  },
];

const tabs: Tab[] = ["Recommended", "Nearby", "Luxury"];
const green = "#1f8a4c";

/**
 * Room8 key flow: browse, compare, request.
 * - Tabs filter the feed; cards that stay glide to their new slot, the rest
 *   fade, so you can see what the filter removed.
 * - A card expands into its detail sheet (shared layout): the photo and price
 *   are the same objects, just bigger, so you never lose the listing you tapped.
 * - Compatibility explains itself: the score fills, then each trait shows you
 *   versus them. "Request to join" morphs idle → sending → sent.
 */
export default function Room8Listings() {
  const [tab, setTab] = useState<Tab>("Recommended");
  const [openId, setOpenId] = useState<string | null>(null);
  const { t } = useSlow();
  const reduce = useReducedMotion();
  const lastCard = useRef<HTMLButtonElement | null>(null);

  const shown = listings.filter((l) => l.tabs.includes(tab));
  const open = listings.find((l) => l.id === openId) ?? null;

  const close = () => {
    setOpenId(null);
    requestAnimationFrame(() => lastCard.current?.focus());
  };

  return (
    <PhoneStage label="Room8 prototype">
      <LayoutGroup>
        <div className="flex h-full flex-col bg-[#f7f8f7] text-[#14181a]">
          <div className="px-4 pt-6">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full bg-[#d8eedf] text-[12px] font-semibold text-[#1f8a4c]">J</span>
              <div className="leading-tight">
                <p className="text-[12px] text-[#5f6b66]">Hi, Jemmy</p>
                <p className="text-[15px] font-semibold">Welcome!</p>
              </div>
            </div>
            <div className="mt-4 flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-[13px] text-[#8a948f] shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
              <SearchIcon />
              Search by location
            </div>
            <div role="tablist" aria-label="Listing filters" className="mt-4 flex gap-1.5">
              {tabs.map((name) => {
                const active = name === tab;
                const count = listings.filter((l) => l.tabs.includes(name)).length;
                return (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(name)}
                    className="relative rounded-lg px-3 py-1.5 text-[12px]"
                    style={{ color: active ? green : "#5f6b66" }}
                  >
                    {active ? (
                      <motion.span
                        layoutId="room8-tab"
                        transition={reduce ? { duration: 0 } : t(spring.snappy)}
                        className="absolute inset-0 rounded-lg border border-[#bfe3cb] bg-[#e7f5ec]"
                      />
                    ) : null}
                    <span className="relative">
                      {name}
                      {active ? <span className="ml-1.5 rounded-full bg-[#1f8a4c] px-1.5 text-[10px] text-white">{count}</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="mt-3 flex-1 space-y-2.5 overflow-y-auto px-4 pb-4">
            <AnimatePresence initial={false} mode="popLayout">
              {shown.map((l) => (
                <motion.li
                  key={l.id}
                  layout={!reduce}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: t(tween("quick", "exit")) }}
                  transition={t(spring.gentle)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      lastCard.current = e.currentTarget;
                      setOpenId(l.id);
                    }}
                    className="pressable flex w-full gap-3 rounded-2xl bg-white p-2.5 text-left shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                    style={{ visibility: openId === l.id ? "hidden" : "visible" }}
                  >
                    <motion.div layoutId={`room8-photo-${l.id}`} transition={t(spring.gentle)} className="h-[74px] w-[78px] shrink-0 overflow-hidden rounded-xl">
                      <Room hue={l.hue} />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <motion.p layoutId={`room8-price-${l.id}`} transition={t(spring.gentle)} className="w-fit text-[13px] font-semibold">
                        {l.price}
                      </motion.p>
                      <p className="truncate text-[11px] text-[#5f6b66]">{l.room}</p>
                      <p className="truncate text-[11px] text-[#8a948f]">{l.area}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-[#5f6b66]">{l.host}</span>
                        <span className="rounded-full bg-[#e7f5ec] px-2 py-0.5 text-[10px] text-[#1f8a4c]">{l.match}% match</span>
                      </div>
                    </div>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="flex justify-around border-t border-black/5 bg-white py-2.5 text-[10px] text-[#8a948f]" aria-hidden="true">
            <span style={{ color: green }}>Home</span>
            <span>Explore</span>
            <span>Chats</span>
            <span>Favourites</span>
          </div>
        </div>

        <AnimatePresence>{open ? <Detail key={open.id} listing={open} onClose={close} /> : null}</AnimatePresence>
      </LayoutGroup>
    </PhoneStage>
  );
}

function Detail({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { t, ms } = useSlow();
  const reduce = useReducedMotion();
  const [request, setRequest] = useState<"idle" | "sending" | "sent">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      clearTimeout(timer.current);
    };
  }, [onClose]);

  const send = () => {
    if (request !== "idle") return;
    setRequest("sending");
    timer.current = setTimeout(() => setRequest("sent"), ms(1100));
  };

  return (
    <motion.div
      role="dialog"
      aria-label={`${listing.room} details`}
      className="absolute inset-0 z-10 flex flex-col bg-white text-[#14181a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: t({ ...tween("quick", "exit"), delay: 0.05 }) }}
      transition={t(tween("quick"))}
    >
      <motion.div layoutId={`room8-photo-${listing.id}`} transition={t(spring.gentle)} className="relative h-[210px] shrink-0 overflow-hidden">
        <Room hue={listing.hue} large />
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Back to listings"
          className="absolute top-4 left-4 grid size-9 place-items-center rounded-full bg-white/90 shadow"
        >
          <ArrowLeft />
        </button>
      </motion.div>

      <motion.div
        className="flex-1 overflow-y-auto px-4 pt-4 pb-4"
        initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(12px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        exit={{ opacity: 0, transition: t(tween("instant", "exit")) }}
        transition={t({ ...tween("base"), delay: 0.12 })}
      >
        <motion.p layoutId={`room8-price-${listing.id}`} transition={t(spring.gentle)} className="w-fit text-[20px] font-semibold">
          {listing.price}
        </motion.p>
        <p className="text-[12px] text-[#5f6b66]">
          {listing.room}, {listing.area}
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f3f8f5] p-3">
          <MatchRing value={listing.match} />
          <div className="text-[12px] leading-snug">
            <p className="font-semibold">You and {listing.host.split(" ")[0]} are a {listing.match}% match</p>
            <p className="text-[#5f6b66]">Based on the habits you both shared at sign-up</p>
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          {listing.traits.map((tr, i) => (
            <li key={tr.label} className="text-[12px]">
              <div className="flex justify-between">
                <span className="font-medium">{tr.label}</span>
                <span className="text-[#5f6b66]">
                  You: {tr.you}. {listing.host.split(" ")[0]}: {tr.them}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e9eeeb]">
                <motion.div
                  className="h-full origin-left rounded-full"
                  style={{ background: tr.score >= 0.8 ? green : tr.score >= 0.6 ? "#d6a21e" : "#d0573f" }}
                  initial={{ transform: "scaleX(0)" }}
                  animate={{ transform: `scaleX(${tr.score})` }}
                  transition={t({ ...tween("deliberate"), delay: 0.35 + i * 0.05 })}
                />
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="border-t border-black/5 p-4">
        <motion.button
          type="button"
          onClick={send}
          disabled={request === "sending"}
          aria-live="polite"
          className="pressable relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl text-[14px] font-medium text-white"
          animate={{ backgroundColor: request === "sent" ? "#14181a" : green }}
          transition={t(tween("base"))}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={request}
              className="flex items-center gap-2"
              initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(10px)", filter: "blur(3px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-10px)", filter: "blur(3px)" }}
              transition={t(request === "sent" ? spring.bouncy : tween("quick"))}
            >
              {request === "idle" && "Request to join"}
              {request === "sending" && (
                <>
                  <Dots />
                  Sending request
                </>
              )}
              {request === "sent" && (
                <>
                  <CheckIcon />
                  Request sent to {listing.host.split(" ")[0]}
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}

function MatchRing({ value }: { value: number }) {
  const { t } = useSlow();
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="none" stroke="#dcebe2" strokeWidth="5" />
      <motion.circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke={green}
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: value / 100 }}
        transition={t({ ...tween("scene"), delay: 0.2 })}
      />
    </svg>
  );
}

function Dots() {
  const { speed } = useSlow();
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-white"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.9 / speed, repeat: Infinity, delay: (i * 0.15) / speed, ease: "linear" }}
        />
      ))}
    </span>
  );
}

/** Stand-in for a listing photo: a tinted room with a window and a sofa */
function Room({ hue, large = false }: { hue: number; large?: boolean }) {
  return (
    <div className="relative h-full w-full" style={{ background: `linear-gradient(160deg, hsl(${hue} 35% 88%), hsl(${hue} 30% 74%))` }} aria-hidden="true">
      <div className="absolute top-[14%] left-[14%] h-[38%] w-[26%] rounded-sm border-2 border-white/80 bg-white/40" />
      <div className="absolute right-[12%] bottom-[16%] h-[22%] w-[46%] rounded-md" style={{ background: `hsl(${hue} 35% 45%)` }} />
      <div className="absolute bottom-0 h-[16%] w-full" style={{ background: `hsl(${hue} 20% 62%)` }} />
      {large ? <span className="absolute right-3 bottom-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white">Sample photo</span> : null}
    </div>
  );
}
