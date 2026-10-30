import type { Skill } from "@/content/about";

/**
 * A page torn out of a spiral notebook: perforated top edge, ruled lines,
 * a red margin. Everything is sized in container units, so the writing
 * stays on the lines at any card width. The paper is the same in both
 * themes; it's an object hanging in the room, not part of the UI chrome.
 */
export function NotebookCard({ svc, tint, radius, shadow }: { svc: Skill; tint: string; radius: number; shadow: boolean }) {
  return (
    <div className="relative mt-[10px] [container-type:inline-size]">
      {/* Shadow on its own layer: the torn edge is a mask, which would clip a shadow on the page itself */}
      {shadow ? (
        <div
          aria-hidden="true"
          className="absolute inset-x-[3%] top-[6%] bottom-0 shadow-[0_22px_36px_-14px_rgb(0_0_0/0.55),0_4px_10px_-4px_rgb(0_0_0/0.3)]"
          style={{ borderRadius: radius }}
        />
      ) : null}
      <article className="notebook-page relative" style={{ borderRadius: radius }}>
        <h3 className="notebook-title">
          <span style={{ "--hl": tint } as React.CSSProperties}>{svc.name}</span>
        </h3>
        <p className="notebook-line">{svc.line}</p>
        <ul className="notebook-list">
          {svc.tools.slice(0, 3).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}
