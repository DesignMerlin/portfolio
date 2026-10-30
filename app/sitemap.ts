import type { MetadataRoute } from "next";
import { getAllWork } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const work = await getAllWork();
  return [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/about` },
    { url: `${siteUrl}/playground` },
    ...work.map((w) => ({ url: `${siteUrl}/work/${w.meta.slug}`, priority: 0.8 })),
  ];
}
