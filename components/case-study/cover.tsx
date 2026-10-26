import Image from "next/image";
import { PlaceholderShot } from "@/components/ui/placeholder-shot";

export type CoverData = { title: string; cover: string | null; coverAlt: string; tint: string };

/** Case study cover: the real Figma export when we have it, a coded placeholder otherwise */
export function Cover({
  work,
  sizes,
  priority = false,
  className = "",
}: {
  work: CoverData;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (work.cover) {
    return (
      <Image
        src={work.cover}
        alt={work.coverAlt}
        width={1184}
        height={1032}
        sizes={sizes}
        priority={priority}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return <PlaceholderShot kind="web" tint={work.tint} label={work.title} className={`h-full w-full ${className}`} />;
}
