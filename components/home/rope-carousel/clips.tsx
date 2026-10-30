import type { ClipStyle } from "@/components/home/rope-carousel/settings";

/**
 * What holds each card to the rope. Drawn centred on the card's pivot (the
 * point where it meets the rope), so it rotates and sways with the card.
 */
export function Clip({ style }: { style: ClipStyle }) {
  if (style === "binder") return <Binder />;
  if (style === "tape") return <Tape />;
  return <Peg />;
}

/** Wooden clothes peg: two halves, a wire spring across the middle */
function Peg() {
  return (
    <svg aria-hidden="true" width="14" height="40" viewBox="0 0 14 40" className="absolute -top-[15px] left-1/2 -translate-x-1/2 overflow-visible">
      <defs>
        <linearGradient id="rc-peg" x1="0" x2="1">
          <stop offset="0" stopColor="#c45c3c" />
          <stop offset="0.45" stopColor="#e2865f" />
          <stop offset="1" stopColor="#b44f33" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0" width="6.2" height="40" rx="1.6" fill="url(#rc-peg)" />
      <rect x="7.3" y="0" width="6.2" height="40" rx="1.6" fill="url(#rc-peg)" />
      <rect x="6.6" y="1" width="0.8" height="38" fill="rgb(70 25 10 / 0.35)" />
      <rect x="-0.5" y="15" width="15" height="4.2" rx="1" fill="#e9e3d6" />
      <rect x="-0.5" y="18.2" width="15" height="1" fill="rgb(0 0 0 / 0.18)" />
    </svg>
  );
}

/** Black binder clip: the jaw grips the page, the wire handles loop over the rope */
function Binder() {
  return (
    <svg aria-hidden="true" width="40" height="44" viewBox="0 0 40 44" className="absolute -top-[18px] left-1/2 -translate-x-1/2 overflow-visible">
      <path d="M12 21 L9 2 M28 21 L31 2 M9 2 Q20 -4 31 2" fill="none" stroke="#c9ccd2" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 20 H36 L33 38 Q32 42 28 42 H12 Q8 42 7 38 Z" fill="#1d1f24" />
      <path d="M6 22 H34" stroke="rgb(255 255 255 / 0.22)" strokeWidth="1.2" />
    </svg>
  );
}

/** A strip of washi tape folded over the rope, ends torn */
function Tape() {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-[10px] left-1/2 h-[26px] w-[64px] -translate-x-1/2 -rotate-3 bg-[rgb(236_224_190/0.82)] shadow-[0_1px_2px_rgb(0_0_0/0.12)]"
      style={{
        clipPath:
          "polygon(3% 0, 97% 0, 100% 18%, 96% 38%, 100% 60%, 97% 82%, 99% 100%, 2% 100%, 0 80%, 4% 58%, 0 36%, 3% 16%)",
      }}
    />
  );
}
