import Image from "next/image";

/** Samuel's portrait, or a clearly labelled placeholder card until the photo is added */
export function Portrait({ src, alt, priority = false }: { src: string | null; alt: string; priority?: boolean }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 22vw, 70vw"
        className="object-cover object-[50%_30%]"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label="Placeholder for Samuel's portrait"
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--accent)_38%,transparent),transparent_70%),linear-gradient(180deg,var(--surface),var(--sunken))]"
    >
      {/* A simple silhouette so the card reads as "a person goes here" */}
      <svg viewBox="0 0 100 140" className="absolute inset-x-0 bottom-0 h-[82%] w-full text-ink/15" aria-hidden="true">
        <circle cx="50" cy="48" r="19" fill="currentColor" />
        <path d="M12 140c0-27 17-46 38-46s38 19 38 46Z" fill="currentColor" />
      </svg>
      <span className="absolute top-3 left-3 rounded-full bg-surface/80 px-2 py-0.5 font-mono text-[10px] text-ink-2 backdrop-blur">
        Your photo here
      </span>
    </div>
  );
}
