import { PlaceholderShot, type PlaceholderKind } from "@/components/ui/placeholder-shot";

/** A numbered chapter of the case study. Ids feed the section navigator. */
export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} data-section aria-labelledby={`${id}-title`} className="scroll-mt-24 pt-20 first:pt-0 lg:pt-28">
      <h2 id={`${id}-title`} className="group mb-6 text-h2 font-semibold">
        <a href={`#${id}`} className="outline-offset-4">
          {title}
          <span aria-hidden="true" className="ml-3 text-ink-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            #
          </span>
        </a>
      </h2>
      <div className="prose-case">{children}</div>
    </section>
  );
}

/** The question the project answers, set large so it frames everything after it */
export function HMW({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 border-l-2 border-accent pl-6">
      <p className="font-display text-h3 leading-snug font-medium text-ink">{children}</p>
    </blockquote>
  );
}

export function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="my-8 rounded-[var(--radius-m)] bg-accent-soft p-5">
      <p className="text-small font-semibold text-ink">{title}</p>
      <div className="mt-1.5 text-small text-ink-2 [&>p+p]:mt-2">{children}</div>
    </aside>
  );
}

/** A figure that stays a coded placeholder until the real export lands */
export function Figure({
  kind = "web",
  tint = "#4b37d6",
  caption,
  ratio = "16 / 10",
}: {
  kind?: PlaceholderKind;
  tint?: string;
  caption: string;
  ratio?: string;
}) {
  return (
    <figure className="my-10 lg:-mr-[12%]">
      <div className="overflow-hidden rounded-[var(--radius-l)] border border-line" style={{ aspectRatio: ratio }}>
        <PlaceholderShot kind={kind} tint={tint} label={caption} className="h-full w-full" />
      </div>
      <figcaption className="mt-3 max-w-[60ch] text-small text-ink-2">{caption}</figcaption>
    </figure>
  );
}

/** Research methods at a glance */
export function Methods({ items }: { items: { name: string; detail: string }[] }) {
  return (
    <dl className="my-8 grid gap-px overflow-hidden rounded-[var(--radius-m)] border border-line bg-line sm:grid-cols-2">
      {items.map((m) => (
        <div key={m.name} className="bg-surface p-4">
          <dt className="font-medium text-ink">{m.name}</dt>
          <dd className="mt-1 text-small text-ink-2">{m.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
