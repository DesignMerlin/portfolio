import Image from "next/image";

type Props = {
  title: string;
  domain: string;
  src: string | null;
  sizes: string;
  priority?: boolean;
  /** Larger type for the case study hero. */
  large?: boolean;
};

// A project cover at 16:10. Until Samuel adds a real image under /public,
// a designed placeholder renders instead: a quiet "document" with ruled
// lines and the project's name, so a missing image never looks broken.
export function Cover({ title, domain, src, sizes, priority, large }: Props) {
  if (src) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-raised">
        <Image src={src} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-line bg-[linear-gradient(160deg,var(--cover-a),var(--cover-b))]"
      role="img"
      aria-label={`${title} cover image (coming soon)`}
    >
      {/* Ruled lines, like a form. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_27px,var(--line)_27px,var(--line)_28px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] opacity-60"
      />
      <div aria-hidden="true" className="absolute inset-y-0 left-[12%] w-px bg-ink/25" />
      <div
        aria-hidden="true"
        className={`absolute right-[7%] bottom-[9%] left-[16%] ${large ? "sm:left-[18%]" : ""}`}
      >
        <p className={`font-mono text-faint ${large ? "text-sm" : "text-meta"}`}>{domain}</p>
        <p
          className={`mt-1 font-medium tracking-[-0.03em] text-fg/85 ${large ? "text-[clamp(2rem,6vw,4.5rem)] leading-none" : "text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.05]"}`}
        >
          {title}
        </p>
      </div>
      <p aria-hidden="true" className="absolute top-[8%] right-[7%] font-mono text-meta text-faint">
        Image coming soon
      </p>
    </div>
  );
}
