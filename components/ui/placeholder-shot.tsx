import type { CSSProperties } from "react";

export type PlaceholderKind = "mobile" | "web" | "dashboard" | "brand" | "wireframe";

/**
 * A coded stand-in for a UI shot that hasn't been exported yet. Pure CSS,
 * zero bytes of image, tinted per project. Always labelled as a placeholder
 * so a reviewer never mistakes it for real work.
 */
export function PlaceholderShot({
  kind,
  tint,
  label,
  className = "",
  showBadge = true,
}: {
  kind: PlaceholderKind;
  tint: string;
  label?: string;
  className?: string;
  showBadge?: boolean;
}) {
  const style = {
    "--tint": tint,
    background:
      kind === "wireframe"
        ? "var(--sunken)"
        : "radial-gradient(120% 90% at 100% 0%, color-mix(in oklab, var(--tint) 32%, transparent), transparent 60%), color-mix(in oklab, var(--tint) 10%, var(--surface))",
  } as CSSProperties;

  return (
    <div
      role="img"
      aria-label={label ? `Placeholder for ${label}` : "Placeholder image"}
      className={`relative isolate overflow-hidden ${className}`}
      style={style}
    >
      {showBadge ? (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-surface/80 px-2 py-0.5 font-mono text-[10px] text-ink-2 backdrop-blur">
          Placeholder
        </span>
      ) : null}
      {kind === "mobile" && <Phone />}
      {kind === "web" && <Browser />}
      {kind === "dashboard" && <Dashboard />}
      {kind === "brand" && <Brand />}
      {kind === "wireframe" && <Wireframe />}
    </div>
  );
}

const bar = "rounded-full bg-[color-mix(in_oklab,var(--ink)_12%,transparent)]";
const tintFill = "bg-[color-mix(in_oklab,var(--tint)_70%,var(--surface))]";

function Phone() {
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-[6%] px-[8%] pt-[12%]">
      {[0, 1].map((i) => (
        <div
          key={i}
          className={`relative w-[38%] max-w-[220px] rounded-t-[22px] border-[5px] border-b-0 border-[color-mix(in_oklab,var(--ink)_85%,transparent)] bg-surface shadow-[var(--shadow-float)] ${i === 1 ? "mb-[-6%] hidden sm:block" : ""}`}
          style={{ aspectRatio: "9 / 16", transform: i === 1 ? "translateY(-8%)" : undefined }}
        >
          <div className="mx-auto mt-2 h-2.5 w-[34%] rounded-full bg-[color-mix(in_oklab,var(--ink)_85%,transparent)]" />
          <div className="space-y-2 p-3">
            <div className={`h-2 w-1/2 ${bar}`} />
            <div className={`h-14 rounded-xl ${tintFill}`} />
            {[0, 1, 2].map((r) => (
              <div key={r} className="flex items-center gap-2">
                <div className="size-8 shrink-0 rounded-lg bg-[color-mix(in_oklab,var(--tint)_22%,var(--surface))]" />
                <div className="flex-1 space-y-1.5">
                  <div className={`h-1.5 w-4/5 ${bar}`} />
                  <div className={`h-1.5 w-1/2 ${bar}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Browser() {
  return (
    <div className="absolute inset-x-[7%] top-[14%] bottom-0 rounded-t-xl border border-b-0 border-line bg-surface shadow-[var(--shadow-float)]">
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 rounded-full bg-[color-mix(in_oklab,var(--ink)_15%,transparent)]" />
        ))}
        <span className={`ml-3 h-2 w-1/3 ${bar}`} />
      </div>
      <div className="grid grid-cols-[1fr_1.2fr] gap-[6%] p-[6%]">
        <div className="space-y-2.5">
          <div className={`h-3 w-11/12 ${bar}`} />
          <div className={`h-3 w-3/4 ${bar}`} />
          <div className={`mt-4 h-1.5 w-full ${bar}`} />
          <div className={`h-1.5 w-5/6 ${bar}`} />
          <div className={`mt-4 h-6 w-1/2 rounded-md ${tintFill}`} />
        </div>
        <div className={`aspect-[4/3] rounded-lg ${tintFill} opacity-80`} />
      </div>
    </div>
  );
}

function Dashboard() {
  const heights = [40, 64, 52, 80, 58, 92, 70];
  return (
    <div className="absolute inset-x-[6%] top-[12%] bottom-0 grid grid-cols-[22%_1fr] rounded-t-xl border border-b-0 border-line bg-surface shadow-[var(--shadow-float)]">
      <div className="space-y-2.5 border-r border-line p-3">
        <div className={`h-2.5 w-2/3 rounded-full ${tintFill}`} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1.5 ${i === 1 ? "w-4/5" : "w-3/5"} ${bar}`} />
        ))}
      </div>
      <div className="space-y-3 p-3">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5 rounded-lg border border-line p-2">
              <div className={`h-1.5 w-1/2 ${bar}`} />
              <div className={`h-3 w-2/3 ${bar}`} />
            </div>
          ))}
        </div>
        <div className="flex h-[38%] items-end gap-[3%] rounded-lg border border-line p-2">
          {heights.map((h, i) => (
            <div key={i} className={`flex-1 rounded-sm ${tintFill}`} style={{ height: `${h}%`, opacity: 0.5 + i * 0.07 }} />
          ))}
        </div>
        {[0, 1].map((i) => (
          <div key={i} className={`h-1.5 w-full ${bar}`} />
        ))}
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-5">
        <div className="grid size-20 place-items-center rounded-[26px] bg-[var(--tint)] shadow-[var(--shadow-float)]">
          <div className="size-8 rotate-45 rounded-lg border-[5px] border-white/90" />
        </div>
        <div className="flex gap-1.5">
          {[100, 70, 40, 15].map((p) => (
            <span
              key={p}
              className="size-5 rounded-full border border-line"
              style={{ background: `color-mix(in oklab, var(--tint) ${p}%, var(--surface))` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Wireframe() {
  return (
    <div className="absolute inset-[8%] grid grid-cols-[1fr_1.4fr] gap-[6%]">
      <div className="space-y-3">
        <div className="h-3 w-3/4 rounded-sm border border-dashed border-ink-3" />
        <div className="h-3 w-1/2 rounded-sm border border-dashed border-ink-3" />
        <div className="mt-6 h-16 rounded-md border border-dashed border-ink-3" />
        <div className="h-16 rounded-md border border-dashed border-ink-3" />
      </div>
      <div className="relative rounded-md border border-dashed border-ink-3">
        <svg className="absolute inset-0 size-full text-ink-3" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeDasharray="4 4" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeDasharray="4 4" />
        </svg>
      </div>
    </div>
  );
}
