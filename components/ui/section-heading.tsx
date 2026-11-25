/** The header shared by the home page's list sections (Selected work, Work experience): same size, same face */
export function SectionHeading({ id, children, sub, count }: { id: string; children: React.ReactNode; sub?: string; count?: number }) {
  return (
    <div>
      <h2 id={id} className="font-display text-[1.625rem] leading-[1.2] font-semibold tracking-[-0.03em]">
        {children} {count ? <span className="font-normal text-ink-2">{count}</span> : null}
      </h2>
      {sub ? <p className="mt-1.5 max-w-[56ch] text-small text-ink-2">{sub}</p> : null}
    </div>
  );
}
