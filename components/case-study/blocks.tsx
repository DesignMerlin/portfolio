import type { ReactNode } from "react";

/**
 * Marks a section Samuel hasn't written yet. Honest, quiet, and obviously
 * temporary: better than filler text or invented detail.
 */
export function InProgress({ children }: { children?: ReactNode }) {
  return (
    <div className="my-6 max-w-[68ch] rounded-md border border-dashed border-line-strong px-5 py-4 text-muted">
      <p className="font-mono text-meta text-faint">Write-up in progress</p>
      {/* div, not p: MDX wraps text children in their own <p>. */}
      <div className="mt-1 [&>p]:my-0">
        {children ?? "Samuel is writing this section. Check back soon."}
      </div>
    </div>
  );
}

/** A key decision: what was chosen, what was rejected, and why. */
export function Decision({
  title,
  rejected,
  children,
}: {
  title: string;
  rejected?: string;
  children: ReactNode;
}) {
  return (
    <section className="my-8 max-w-[68ch] border-l-2 border-ink pl-5">
      <h3 className="text-title font-medium">{title}</h3>
      <div className="mt-2 [&>p]:my-2">{children}</div>
      {rejected && (
        <p className="mt-3 text-muted">
          <span className="font-mono text-meta text-faint">Rejected </span>
          {rejected}
        </p>
      )}
    </section>
  );
}

/** Image with a caption. `src` is optional so drafts can reserve the slot. */
export function Figure({ src, alt, caption }: { src?: string; alt: string; caption: string }) {
  return (
    <figure className="my-10">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- replaced by next/image once real assets land
        <img src={src} alt={alt} className="w-full rounded-lg border border-line" loading="lazy" />
      ) : (
        <div
          role="img"
          aria-label={`${alt} (image coming soon)`}
          className="grid aspect-[16/9] w-full place-items-center rounded-lg border border-dashed border-line-strong bg-ink-soft/40 font-mono text-meta text-faint"
        >
          Image coming soon
        </div>
      )}
      <figcaption className="mt-3 max-w-[68ch] text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}
