import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MDX lives in /content and is imported by route pages, so it does not
  // need to be in pageExtensions (MDX files never become routes on their own).
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

// Plugins are passed by name so Turbopack can use them.
// remark-frontmatter parses the YAML block; remark-mdx-frontmatter exposes it
// as `export const frontmatter`, which lib/content.ts validates.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-mdx-frontmatter"],
  },
});

export default withMDX(nextConfig);
